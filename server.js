require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const { Resend } = require('resend');
const multer = require('multer');

const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dartcraft-admin';
const SHIPPING_CENTS = 1995; // $19.95 AUD
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Set DATABASE_URL in your environment before starting the server.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Neon pooled URLs usually include sslmode=require, which pg can parse directly.
  // Avoid double SSL config in that case; otherwise keep production-safe fallback.
  ssl: DATABASE_URL.includes('sslmode=require')
    ? undefined
    : process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const OWNER_EMAIL = process.env.OWNER_EMAIL || '';

// ── DB helpers ────────────────────────────────────────────────────────────────

async function queryDb(text, params = []) {
  return pool.query(text, params);
}

async function getActivePackage(packageId) {
  const result = await queryDb(
    'select id, name, price_aud, quantity from packages where id = $1 and active = true limit 1',
    [packageId]
  );
  return result.rows[0] || null;
}

async function getActivePromo(rawCode) {
  const code = String(rawCode || '').toUpperCase().trim();
  if (!code) return null;
  const result = await queryDb(
    'select code, type, value, active from promo_codes where code = $1 and active = true limit 1',
    [code]
  );
  return result.rows[0] || null;
}

function calcDiscount(promo, priceAud, shippingAud = 0) {
  if (!promo || !promo.active) return 0;
  if (promo.type === 'free_shipping') return Math.round(shippingAud * 100);
  if (promo.type === 'percent') return Math.round(priceAud * promo.value / 100) * 100;
  // fixed: can apply against total (product + shipping), minimum $1 remaining
  const totalCents = Math.round((priceAud + shippingAud) * 100);
  return Math.min(Math.round(promo.value * 100), totalCents - 100);
}

// ── Email helpers ─────────────────────────────────────────────────────────────

async function sendEmail(to, subject, html, options = {}) {
  if (!resend || !to) return;
  try {
    await resend.emails.send({
      from: `DartCraft <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      ...(options.text    ? { text: options.text }       : {}),
      ...(options.headers ? { headers: options.headers } : {}),
    });
    console.log(`[email] Sent "${subject}" → ${to}`);
  } catch (err) {
    console.error('[email] Send error:', err.message);
  }
}

function fmt(cents) {
  return `$${(cents / 100).toFixed(2)} AUD`;
}

function emailShell({ badge, badgeColor, body }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e8ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8ed;padding:48px 20px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">
  <tr><td style="background:#050607;padding:30px 40px">
    <p style="margin:0;font-size:20px;font-weight:700;color:#F5F5F0;letter-spacing:-0.02em">DartCraft</p>
    <p style="margin:8px 0 0;font-size:11px;color:${badgeColor};font-family:monospace;letter-spacing:0.10em;text-transform:uppercase">${badge}</p>
  </td></tr>
  <tr><td style="background:#ffffff;padding:40px">
    ${body}
  </td></tr>
  <tr><td style="background:#f2f2f5;padding:20px 40px;border-top:1px solid #e4e4e8">
    <p style="margin:0;font-size:11px;color:#aaa;text-align:center;font-family:monospace;letter-spacing:0.06em;text-transform:uppercase">DartCraft &middot; Australia &middot; <a href="mailto:hello@dartcraft.com.au" style="color:#7C5CFF;text-decoration:none">hello@dartcraft.com.au</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function detailRow(label, value) {
  return `<tr>
    <td style="padding:11px 0;width:120px;vertical-align:top;font-size:11px;color:#999;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid #f0f0f0">${label}</td>
    <td style="padding:11px 0;font-size:14px;color:#222;line-height:1.6;border-bottom:1px solid #f0f0f0">${value}</td>
  </tr>`;
}

function confirmationEmailHtml(session) {
  const m = session.metadata || {};
  const amount = session.amount_total ? fmt(session.amount_total) : '';
  const body = `
    <p style="margin:0 0 6px;font-size:26px;font-weight:700;color:#111;letter-spacing:-0.025em">Order confirmed.</p>
    <p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.65">Hi ${m.customerName?.split(' ')[0] || 'there'}, your DartCraft kit is confirmed and we're getting it ready to ship.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f9;border-radius:12px;padding:24px 28px;margin-bottom:28px">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${detailRow('Package', `<strong>${m.packageName || ''}</strong>`)}
          ${detailRow('Amount paid', `<strong>${amount}</strong>`)}
          ${detailRow('Ship to', `${m.customerName || ''}<br>${m.street || ''}<br>${m.suburb || ''} ${m.state || ''} ${m.postcode || ''}<br>Australia`)}
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:20px">
      <tr><td>
        <p style="margin:0 0 5px;font-size:13px;font-weight:700;color:#92400e">What happens next</p>
        <p style="margin:0;font-size:13px;color:#78350f;line-height:1.65">We'll pack your kit and dispatch it. You'll receive a shipping confirmation once it's on its way.</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border:1px solid #c7d4f8;border-radius:12px;padding:20px 24px;margin-bottom:32px">
      <tr><td>
        <p style="margin:0 0 5px;font-size:13px;font-weight:700;color:#1e3a8a">Your setup guide</p>
        <p style="margin:0 0 14px;font-size:13px;color:#1e40af;line-height:1.65">Download your digital setup guide to get familiar with the installation before your kit arrives.</p>
        <a href="${BASE_URL}/assets/setup-guide.pdf" style="display:inline-block;padding:10px 20px;background:#1e3a8a;color:#fff;border-radius:99px;text-decoration:none;font-size:13px;font-weight:700">Download setup guide &rarr;</a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#bbb;line-height:1.6">Questions? <a href="mailto:hello@dartcraft.com.au" style="color:#7C5CFF">hello@dartcraft.com.au</a></p>
  `;
  return emailShell({ badge: '&#9679; Order confirmed', badgeColor: '#22c55e', body });
}

function ownerNotificationHtml(session) {
  const m = session.metadata || {};
  const amount = session.amount_total ? fmt(session.amount_total) : '—';
  const date = new Date(session.created * 1000).toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' });
  const body = `
    <p style="margin:0 0 6px;font-size:26px;font-weight:700;color:#111;letter-spacing:-0.025em">New order received.</p>
    <p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.65">${date} AEST &mdash; ${m.packageName || m.packageId || '—'} &mdash; <strong>${amount}</strong></p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f9;border-radius:12px;padding:24px 28px;margin-bottom:28px">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${detailRow('Package', `<strong>${m.packageName || m.packageId || '—'}</strong>`)}
          ${detailRow('Amount', `<strong>${amount}</strong>`)}
          ${detailRow('Name', m.customerName || '—')}
          ${detailRow('Email', session.customer_email || '—')}
          ${detailRow('Phone', m.phone || '—')}
          ${detailRow('Ship to', `${m.street || ''}<br>${m.suburb || ''} ${m.state || ''} ${m.postcode || ''}<br>Australia`)}
          ${m.notes ? detailRow('Notes', m.notes) : ''}
          ${detailRow('Stripe ID', `<span style="font-family:monospace;font-size:11px;color:#aaa">${session.id}</span>`)}
        </table>
      </td></tr>
    </table>
    <p style="margin:0"><a href="${BASE_URL}/admin" style="display:inline-block;padding:13px 28px;background:#7C5CFF;color:#fff;border-radius:99px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:-0.01em">Open Admin &rarr;</a></p>
  `;
  return emailShell({ badge: '&#9679; New order', badgeColor: '#7C5CFF', body });
}

function shippingEmailHtml(session, trackingNumber = '') {
  const m = session.metadata || {};
  const firstName = (m.customerName || 'there').split(' ')[0];
  const trackingBlock = trackingNumber
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:32px">
        <tr><td>
          <p style="margin:0 0 5px;font-size:13px;font-weight:700;color:#166534">Australia Post tracking</p>
          <p style="margin:0 0 12px;font-size:13px;color:#15803d;line-height:1.65">Your tracking number is <strong>${trackingNumber}</strong>.</p>
          <a href="https://auspost.com.au/mypost/track/#/details/${trackingNumber}" style="display:inline-block;padding:10px 20px;background:#166534;color:#fff;border-radius:99px;text-decoration:none;font-size:13px;font-weight:700">Track my parcel &rarr;</a>
        </td></tr>
      </table>`
    : '';
  const body = `
    <p style="margin:0 0 6px;font-size:26px;font-weight:700;color:#111;letter-spacing:-0.025em">Your order has shipped.</p>
    <p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.65">Hi ${firstName}, your <strong>${m.packageName || 'DartCraft kit'}</strong> has been packed and dispatched.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f9;border-radius:12px;padding:24px 28px;margin-bottom:28px">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${detailRow('Package', `<strong>${m.packageName || 'DartCraft Kit'}</strong>`)}
          ${detailRow('Delivering to', `${m.customerName || ''}<br>${m.street || ''}<br>${m.suburb || ''} ${m.state || ''} ${m.postcode || ''}<br>Australia`)}
        </table>
      </td></tr>
    </table>
    ${trackingBlock}
    <p style="margin:0;font-size:13px;color:#bbb;line-height:1.6">Questions? <a href="mailto:hello@dartcraft.com.au" style="color:#7C5CFF">hello@dartcraft.com.au</a></p>
  `;
  return emailShell({ badge: '&#9679; Shipped', badgeColor: '#22c55e', body });
}

function restockEmailHtml(packageName, unsubscribeUrl) {
  const body = `
    <p style="margin:0 0 6px;font-size:26px;font-weight:700;color:#111;letter-spacing:-0.025em">Back in stock.</p>
    <p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.65">Good news — <strong>${packageName}</strong> is back in stock and available to order now.</p>
    <p style="margin:0 0 40px">
      <a href="${BASE_URL}/#order" style="display:inline-block;padding:13px 28px;background:#7C5CFF;color:#fff;border-radius:99px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:-0.01em">Order now &rarr;</a>
    </p>
    <p style="margin:0;font-size:12px;color:#bbb;line-height:1.8">
      You're receiving this because you requested a back-in-stock alert for ${packageName}.<br>
      <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline">Unsubscribe from these alerts</a>
    </p>
  `;
  return emailShell({ badge: '&#9679; Back in stock', badgeColor: '#22c55e', body });
}

function orderRowToSession(order) {
  const createdSeconds = Math.floor(new Date(order.created_at).getTime() / 1000);
  return {
    id: order.stripe_session_id,
    created: createdSeconds,
    amount_total: order.amount_total,
    customer_email: order.customer_email,
    metadata: {
      packageId: order.package_id,
      packageName: order.package_name,
      customerName: order.customer_name,
      phone: order.phone || '',
      street: order.street || '',
      suburb: order.suburb || '',
      state: order.state || '',
      postcode: order.postcode || '',
      notes: order.notes || '',
      promoCode: order.promo_code || '',
      discountCents: String(order.discount_cents || 0),
    },
  };
}

// ── Middleware ────────────────────────────────────────────────────────────────

// Block direct access to sensitive data files before static middleware
['stock.json','orders.json','codes.json','.env','server.js'].forEach(f =>
  app.get(`/${f}`, (_req, res) => res.status(404).end())
);

app.use(['/api/webhook', '/api/webhooks/stripe'], express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.static(__dirname));

// ── Review photo uploads ──────────────────────────────────────────────────────

const reviewsDir = path.join(__dirname, 'assets', 'reviews');
if (!fs.existsSync(reviewsDir)) fs.mkdirSync(reviewsDir, { recursive: true });

const reviewUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, reviewsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `review-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ── Public API ────────────────────────────────────────────────────────────────

app.get('/api/config', (_req, res) => {
  res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '' });
});

app.get('/api/stock', (_req, res) => {
  (async () => {
    try {
      const result = await queryDb(
        'select id, quantity from packages where active = true order by created_at asc'
      );
      const out = {};
      for (const row of result.rows) out[row.id] = Number(row.quantity);
      res.json(out);
    } catch (err) {
      console.error('[api/stock] DB error:', err.message);
      res.status(500).json({ error: 'Could not load stock.' });
    }
  })();
});

app.get('/api/packages', (_req, res) => {
  (async () => {
    try {
      const result = await queryDb(
        'select id, price_aud from packages where active = true order by created_at asc'
      );
      const out = {};
      for (const row of result.rows) out[row.id] = Number(row.price_aud);
      res.json(out);
    } catch (err) {
      console.error('[api/packages] DB error:', err.message);
      res.status(500).json({ error: 'Could not load packages.' });
    }
  })();
});

app.post('/api/validate-promo', async (req, res) => {
  const { code, packageId } = req.body;
  if (!packageId || !code) return res.json({ valid: false });

  try {
    const pkg = await getActivePackage(packageId);
    if (!pkg) return res.json({ valid: false });

    const promo = await getActivePromo(code);
    if (!promo) return res.json({ valid: false });

    const promoValue = Number(promo.value);
    const freeShipping = promo.type === 'free_shipping';
    const discountCents = calcDiscount(
      { type: promo.type, value: promoValue, active: true },
      Number(pkg.price_aud),
      SHIPPING_CENTS / 100
    );
    const discountDisplay = freeShipping
      ? 'Free shipping'
      : promo.type === 'percent'
        ? `${promoValue}% off`
        : `$${(discountCents / 100).toFixed(2)} off`;
    res.json({ valid: true, discountCents, discountDisplay, freeShipping });
  } catch (err) {
    console.error('[api/validate-promo] DB error:', err.message);
    res.status(500).json({ valid: false });
  }
});

app.post('/api/notify', async (req, res) => {
  const { email, packageId } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(String(email))) {
    return res.status(400).json({ error: 'Valid email required.' });
  }
  if (!packageId) {
    return res.status(400).json({ error: 'Package ID required.' });
  }
  try {
    const pkg = await getActivePackage(packageId);
    if (!pkg) return res.status(400).json({ error: 'Invalid package.' });
    const token = crypto.randomBytes(24).toString('hex');
    await queryDb(
      `insert into stock_notifications (package_id, email, token, notified, created_at)
       values ($1, $2, $3, false, now())
       on conflict (package_id, email) do update set token = excluded.token, notified = false, created_at = now()`,
      [packageId, String(email).toLowerCase().trim(), token]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[api/notify] DB error:', err.message);
    res.status(500).json({ error: 'Could not save notification request.' });
  }
});

app.get('/api/notify/unsubscribe', async (req, res) => {
  const { token } = req.query;

  const page = (heading, msg, isError = false) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DartCraft – Unsubscribe</title>
<style>*{box-sizing:border-box}body{margin:0;padding:40px 20px;background:#0a0b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{background:#111;border:1px solid #222;border-radius:16px;padding:48px 40px;max-width:420px;width:100%;text-align:center}h1{font-size:20px;font-weight:700;margin:0 0 12px;letter-spacing:-0.02em;color:${isError ? '#ef4444' : '#22c55e'}}p{font-size:14px;color:#999;line-height:1.65;margin:0 0 24px}a{color:#7C5CFF;text-decoration:none;font-size:14px}.logo{font-size:18px;font-weight:700;color:#F5F5F0;margin:0 0 24px}</style>
</head>
<body><div class="card"><p class="logo">DartCraft</p><h1>${heading}</h1><p>${msg}</p><a href="${BASE_URL}/">Back to DartCraft &rarr;</a></div></body></html>`;

  if (!token) {
    return res.status(400).send(page('Invalid link', 'This unsubscribe link is invalid.', true));
  }
  try {
    const result = await queryDb(
      'delete from stock_notifications where token = $1 returning package_id',
      [String(token)]
    );
    if (!result.rows.length) {
      return res.send(page('Already removed', 'This link has already been used or is no longer valid.', true));
    }
    res.send(page('Unsubscribed', "You've been removed from back-in-stock alerts. You won't receive any more emails for this product."));
  } catch (err) {
    console.error('[api/notify/unsubscribe] DB error:', err.message);
    res.status(500).send(page('Error', 'Something went wrong. Please try again.', true));
  }
});

app.post('/api/reviews/submit', reviewUpload.single('photo'), async (req, res) => {
  const { name, rating, product_id, review } = req.body;
  if (!name || !review) return res.status(400).json({ error: 'Name and review are required.' });
  const r = parseInt(rating);
  if (!r || r < 1 || r > 5) return res.status(400).json({ error: 'Rating must be 1–5.' });
  const photoUrl = req.file ? `/assets/reviews/${req.file.filename}` : null;
  try {
    await queryDb(
      `insert into reviews (name, rating, product_id, review, photo_url, active, created_at)
       values ($1, $2, $3, $4, $5, false, now())`,
      [name.trim(), r, product_id || null, review.trim(), photoUrl]
    );

    // Notify owner
    const PRODUCT_LABELS = {
      'ring-only': 'DartCraft Ring with Camera Mounts',
      'ring-led': 'DartCraft Ring + LED Lighting',
      'ring-led-cameras': 'DartCraft Ring + LED + Cameras',
      'full-system': 'Full AutoDarts System',
    };
    const productLabel = PRODUCT_LABELS[product_id] || '—';
    const stars = '★'.repeat(r) + '☆'.repeat(5 - r);
    const body = `
      <p style="margin:0 0 6px;font-size:26px;font-weight:700;color:#111;letter-spacing:-0.025em">New review submitted.</p>
      <p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.65">A customer has submitted a review and is waiting for approval.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f9;border-radius:12px;padding:24px 28px;margin-bottom:28px">
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${detailRow('Name', name.trim())}
            ${detailRow('Rating', `<span style="font-size:18px;letter-spacing:2px">${stars}</span>`)}
            ${detailRow('Product', productLabel)}
            ${detailRow('Review', `<em>${review.trim()}</em>`)}
            ${photoUrl ? detailRow('Photo', `<a href="${BASE_URL}${photoUrl}" style="color:#7C5CFF">View photo</a>`) : ''}
          </table>
        </td></tr>
      </table>
      <p style="margin:0"><a href="${BASE_URL}/admin" style="display:inline-block;padding:13px 28px;background:#7C5CFF;color:#fff;border-radius:99px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:-0.01em">Review in admin &rarr;</a></p>
    `;
    sendEmail(
      OWNER_EMAIL,
      `New review from ${name.trim()} — ${stars}`,
      emailShell({ badge: '&#9679; New review', badgeColor: '#f59e0b', body })
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('[api/reviews/submit] DB error:', err.message);
    res.status(500).json({ error: 'Could not submit review. Please try again.' });
  }
});

app.get('/api/reviews', async (_req, res) => {
  try {
    const result = await queryDb(
      `select id, name, rating, product_id, review, photo_url, display_date, verified_purchase
       from reviews where active = true order by created_at desc`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[api/reviews] DB error:', err.message);
    res.status(500).json({ error: 'Could not load reviews.' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { packageId, name, email, phone, street, suburb, state, postcode, notes, promoCode } = req.body;

  try {
    const pkg = await getActivePackage(packageId);
    if (!pkg) return res.status(400).json({ error: 'Invalid package selected.' });
    if (Number(pkg.quantity) <= 0) {
      return res.status(400).json({ error: 'That package is currently out of stock.' });
    }

    if (!name || !email || !phone || !street || !suburb || !state || !postcode) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    let discountCents = 0;
    let appliedPromo = '';
    if (promoCode) {
      const promo = await getActivePromo(promoCode);
      if (promo) {
        discountCents = calcDiscount(
          { type: promo.type, value: Number(promo.value), active: true },
          Number(pkg.price_aud),
          SHIPPING_CENTS / 100
        );
        appliedPromo = String(promo.code).toUpperCase();
      }
    }

    const lineItems = [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: `DartCraft — ${pkg.name}`,
            description: 'AutoDarts-compatible hardware kit. DIY install required. Ships from Australia.',
            images: [`${BASE_URL}/assets/hero-product.png`],
          },
          unit_amount: Number(pkg.price_aud) * 100,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'aud',
          product_data: { name: 'Shipping (Australia)' },
          unit_amount: SHIPPING_CENTS,
        },
        quantity: 1,
      },
    ];

    // Stripe doesn't allow negative line items — use a coupon instead
    let sessionDiscounts = [];
    if (discountCents > 0) {
      const totalCents = Number(pkg.price_aud) * 100 + SHIPPING_CENTS;
      const cappedDiscount = Math.min(discountCents, totalCents - 1);
      const coupon = await stripe.coupons.create({
        amount_off: cappedDiscount,
        currency: 'aud',
        duration: 'once',
        name: `Promo: ${appliedPromo}`,
      });
      sessionDiscounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      ...(sessionDiscounts.length ? { discounts: sessionDiscounts } : {}),
      mode: 'payment',
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE_URL}/Dartcraft.html#order`,
      customer_email: email,
      metadata: {
        packageId,
        packageName: pkg.name,
        customerName: name,
        phone,
        street,
        suburb,
        state,
        postcode,
        notes: notes ? notes.substring(0, 500) : '',
        promoCode: appliedPromo,
        discountCents: String(discountCents),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment service error. Please try again.' });
  }
});

app.get('/api/session/:id', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ['line_items'],
    });
    res.json({
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_email || session.customer_details?.email,
      metadata: session.metadata,
      shipping_details: session.shipping_details,
      line_items: session.line_items?.data?.map(i => ({
        description: i.description,
        amount_total: i.amount_total,
      })),
    });
  } catch (err) {
    res.status(400).json({ error: 'Session not found.' });
  }
});

// ── Stripe webhook ────────────────────────────────────────────────────────────

app.post(['/api/webhook', '/api/webhooks/stripe'], async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = secret
      ? stripe.webhooks.constructEvent(req.body, sig, secret)
      : JSON.parse(req.body);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const packageId = session.metadata?.packageId;
    const metadata = session.metadata || {};
    const customerEmail = session.customer_email || session.customer_details?.email || '';

    let processed = false;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query(
        'select id from orders where stripe_session_id = $1 limit 1',
        [session.id]
      );
      if (existing.rows.length) {
        await client.query('COMMIT');
        console.log(`[webhook] Duplicate event ignored for session ${session.id}`);
      } else {
        if (!packageId) {
          await client.query('ROLLBACK');
          console.error(`[webhook] Missing packageId in metadata for session ${session.id}`);
          return res.json({ received: true });
        }

        await client.query(
          `insert into orders (
            stripe_session_id, stripe_payment_intent_id, payment_status,
            package_id, package_name, amount_total, currency,
            customer_name, customer_email, phone, street, suburb, state, postcode, notes,
            promo_code, discount_cents, shipped, shipped_at
          ) values (
            $1, $2, $3,
            $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, false, null
          )`,
          [
            session.id,
            typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id || null),
            session.payment_status || 'paid',
            packageId,
            metadata.packageName || packageId,
            Number(session.amount_total || 0),
            String(session.currency || 'aud'),
            metadata.customerName || '',
            customerEmail,
            metadata.phone || null,
            metadata.street || null,
            metadata.suburb || null,
            metadata.state || null,
            metadata.postcode || null,
            metadata.notes || null,
            metadata.promoCode || null,
            Number.parseInt(metadata.discountCents || '0', 10) || 0,
          ]
        );

        const stockResult = await client.query(
          'update packages set quantity = quantity - 1, updated_at = now() where id = $1 and quantity > 0 returning quantity',
          [packageId]
        );
        if (!stockResult.rows.length) {
          await client.query('ROLLBACK');
          console.error(`[webhook] Stock unavailable for package ${packageId}, session ${session.id}`);
          return res.json({ received: true });
        }

        await client.query('COMMIT');
        processed = true;
        const newQty = stockResult.rows[0].quantity;
        console.log(`[webhook] Order saved and stock decremented: ${packageId} -> ${newQty}`);

        // If stock just hit 0, reset notification flags so subscribers get alerted on next restock
        if (newQty === 0) {
          queryDb(
            'update stock_notifications set notified = false where package_id = $1',
            [packageId]
          ).catch(err => console.error('[notify] Error resetting notification flags:', err.message));
        }
      }
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch {}
      console.error('[webhook] DB transaction error:', err.message);
      return res.status(500).json({ received: false });
    } finally {
      client.release();
    }

    if (processed) {
      await Promise.all([
        sendEmail(customerEmail, 'Your DartCraft order is confirmed 🎯', confirmationEmailHtml(session)),
        sendEmail(OWNER_EMAIL, `New order: ${metadata.packageName || packageId} — ${fmt(session.amount_total)}`, ownerNotificationHtml(session)),
      ]);
    }
  }

  res.json({ received: true });
});

// ── Admin API ─────────────────────────────────────────────────────────────────

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/admin/stock', requireAdmin, (_req, res) => {
  (async () => {
    try {
      const result = await queryDb(
        'select id, name, quantity from packages where active = true order by created_at asc'
      );
      const out = {};
      for (const row of result.rows) {
        out[row.id] = { quantity: Number(row.quantity), label: row.name };
      }
      res.json(out);
    } catch (err) {
      console.error('[api/admin/stock] DB error:', err.message);
      res.status(500).json({ error: 'Could not load stock.' });
    }
  })();
});

app.put('/api/admin/stock/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative integer' });
  }
  try {
    const current = await queryDb(
      'select quantity, name from packages where id = $1 limit 1',
      [id]
    );
    if (!current.rows.length) return res.status(404).json({ error: 'Package not found' });
    const oldQty = Number(current.rows[0].quantity);
    const packageName = current.rows[0].name;

    const result = await queryDb(
      'update packages set quantity = $2, updated_at = now() where id = $1 returning id, quantity',
      [id, quantity]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Package not found' });

    res.json({ id: result.rows[0].id, quantity: Number(result.rows[0].quantity) });

    // If manually set to 0, reset notification flags so subscribers get alerted on next restock
    if (quantity === 0) {
      queryDb(
        'update stock_notifications set notified = false where package_id = $1',
        [id]
      ).catch(err => console.error('[notify] Error resetting notification flags:', err.message));
    }

    // If restocked (was 0, now > 0), notify subscribers asynchronously
    if (oldQty <= 0 && quantity > 0) {
      (async () => {
        try {
          const subs = await queryDb(
            'select email, token from stock_notifications where package_id = $1 and notified = false',
            [id]
          );
          if (!subs.rows.length) return;
          await queryDb(
            'update stock_notifications set notified = true where package_id = $1 and notified = false',
            [id]
          );
          for (const sub of subs.rows) {
            const unsubUrl = `${BASE_URL}/api/notify/unsubscribe?token=${sub.token}`;
            await sendEmail(
              sub.email,
              `${packageName} is back in stock`,
              restockEmailHtml(packageName, unsubUrl),
              {
                headers: {
                  'List-Unsubscribe': `<${unsubUrl}>`,
                  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                },
                text: `Good news — ${packageName} is back in stock and available to order now.\n\nOrder here: ${BASE_URL}/#order\n\n---\nYou're receiving this because you requested a back-in-stock alert.\nUnsubscribe: ${unsubUrl}`,
              }
            );
          }
          console.log(`[notify] Sent ${subs.rows.length} restock email(s) for ${id}`);
        } catch (err) {
          console.error('[notify] Error sending restock emails:', err.message);
        }
      })();
    }
  } catch (err) {
    console.error('[api/admin/stock/:id] DB error:', err.message);
    res.status(500).json({ error: 'Could not update stock.' });
  }
});

app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
  try {
    const result = await queryDb(
      `select stripe_session_id, created_at, amount_total, currency, customer_email,
              package_id, package_name, customer_name, phone, street, suburb, state, postcode, notes,
              promo_code, discount_cents, shipped, shipped_at, tracking_number
       from orders
       where payment_status = 'paid'
       order by created_at desc
       limit 500`
    );
    const orders = result.rows.map((o) => ({
      id: o.stripe_session_id,
      created: Math.floor(new Date(o.created_at).getTime() / 1000),
      amount_total: Number(o.amount_total),
      currency: o.currency,
      customer_email: o.customer_email,
      metadata: {
        packageId: o.package_id,
        packageName: o.package_name,
        customerName: o.customer_name,
        phone: o.phone || '',
        street: o.street || '',
        suburb: o.suburb || '',
        state: o.state || '',
        postcode: o.postcode || '',
        notes: o.notes || '',
        promoCode: o.promo_code || '',
        discountCents: String(o.discount_cents || 0),
      },
      shipped: Boolean(o.shipped),
      shippedAt: o.shipped_at ? new Date(o.shipped_at).toISOString() : null,
      trackingNumber: o.tracking_number || '',
    }));
    res.json(orders);
  } catch (err) {
    console.error('Orders error:', err.message);
    res.status(500).json({ error: 'Could not load orders.' });
  }
});

app.post('/api/admin/orders/:id/ship', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const trackingNumber = (req.body.trackingNumber || '').trim();
  try {
    const orderResult = await queryDb(
      `select stripe_session_id, payment_status, amount_total, customer_email, package_id, package_name,
              customer_name, phone, street, suburb, state, postcode, notes, promo_code, discount_cents,
              shipped, shipped_at, created_at
       from orders where stripe_session_id = $1 limit 1`,
      [id]
    );
    if (!orderResult.rows.length) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    const order = orderResult.rows[0];

    if (order.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Order is not paid.' });
    }

    if (order.shipped) {
      return res.status(400).json({ error: 'Order already marked as shipped.' });
    }

    const updated = await queryDb(
      `update orders
       set shipped = true, shipped_at = now(), tracking_number = $2
       where stripe_session_id = $1
       returning stripe_session_id, payment_status, amount_total, customer_email, package_id, package_name,
                 customer_name, phone, street, suburb, state, postcode, notes, promo_code, discount_cents,
                 shipped, shipped_at, created_at`,
      [id, trackingNumber || null]
    );
    const shippedOrder = updated.rows[0];

    await sendEmail(
      shippedOrder.customer_email,
      'Your DartCraft order has shipped',
      shippingEmailHtml(orderRowToSession(shippedOrder), trackingNumber)
    );

    console.log(`[admin] Order ${id} marked as shipped${trackingNumber ? ` (tracking: ${trackingNumber})` : ''}`);
    res.json({ shipped: true, shippedAt: new Date(shippedOrder.shipped_at).toISOString(), trackingNumber });
  } catch (err) {
    console.error('Ship error:', err.message);
    res.status(500).json({ error: 'Could not mark order as shipped.' });
  }
});

// ── Admin codes CRUD ──────────────────────────────────────────────────────────

app.get('/api/admin/codes', requireAdmin, (_req, res) => {
  (async () => {
    try {
      const result = await queryDb('select code, type, value, active from promo_codes order by code asc');
      const codes = {};
      for (const row of result.rows) {
        codes[row.code] = { type: row.type, value: Number(row.value), active: Boolean(row.active) };
      }
      res.json(codes);
    } catch (err) {
      console.error('[api/admin/codes] DB error:', err.message);
      res.status(500).json({ error: 'Could not load promo codes.' });
    }
  })();
});

app.post('/api/admin/codes', requireAdmin, async (req, res) => {
  const { code, type, value, active } = req.body;
  const key = String(code || '').toUpperCase().trim();
  if (!key || !/^[A-Z0-9]+$/.test(key)) {
    return res.status(400).json({ error: 'Code must contain only letters and numbers.' });
  }
  if (!['percent', 'fixed', 'free_shipping'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "percent" or "fixed".' });
  }
  const num = type === 'free_shipping' ? 0 : parseFloat(value);
  if (type !== 'free_shipping' && (!num || num <= 0 || (type === 'percent' && num > 100))) {
    return res.status(400).json({ error: 'Invalid value.' });
  }
  try {
    const result = await queryDb(
      `insert into promo_codes (code, type, value, active, created_at, updated_at)
       values ($1, $2, $3, $4, now(), now())
       on conflict (code) do update
       set type = excluded.type, value = excluded.value, active = excluded.active, updated_at = now()
       returning code, type, value, active`,
      [key, type, num, active !== false]
    );
    const row = result.rows[0];
    res.json({ code: row.code, type: row.type, value: Number(row.value), active: Boolean(row.active) });
  } catch (err) {
    console.error('[api/admin/codes POST] DB error:', err.message);
    res.status(500).json({ error: 'Could not save code.' });
  }
});

app.put('/api/admin/codes/:code', requireAdmin, async (req, res) => {
  const key = req.params.code.toUpperCase();
  const { type, value, active } = req.body;
  if (type !== undefined && !['percent', 'fixed', 'free_shipping'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "percent" or "fixed".' });
  }
  if (value !== undefined) {
    const num = parseFloat(value);
    if (!num || num <= 0 || (type === 'percent' && num > 100)) {
      return res.status(400).json({ error: 'Invalid value.' });
    }
  }
  try {
    const existing = await queryDb('select code, type, value, active from promo_codes where code = $1 limit 1', [key]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Code not found.' });
    const current = existing.rows[0];
    const nextType = type !== undefined ? type : current.type;
    const nextValue = value !== undefined ? parseFloat(value) : Number(current.value);
    if (nextType === 'percent' && nextValue > 100) {
      return res.status(400).json({ error: 'Invalid value.' });
    }
    const nextActive = active !== undefined ? Boolean(active) : Boolean(current.active);
    const updated = await queryDb(
      `update promo_codes
       set type = $2, value = $3, active = $4, updated_at = now()
       where code = $1
       returning code, type, value, active`,
      [key, nextType, nextValue, nextActive]
    );
    const row = updated.rows[0];
    res.json({ code: row.code, type: row.type, value: Number(row.value), active: Boolean(row.active) });
  } catch (err) {
    console.error('[api/admin/codes PUT] DB error:', err.message);
    res.status(500).json({ error: 'Could not update code.' });
  }
});

app.delete('/api/admin/codes/:code', requireAdmin, async (req, res) => {
  const key = req.params.code.toUpperCase();
  try {
    const result = await queryDb('delete from promo_codes where code = $1 returning code', [key]);
    if (!result.rows.length) return res.status(404).json({ error: 'Code not found.' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('[api/admin/codes DELETE] DB error:', err.message);
    res.status(500).json({ error: 'Could not delete code.' });
  }
});

// ── Admin reviews CRUD ────────────────────────────────────────────────────────

app.get('/api/admin/reviews', requireAdmin, async (_req, res) => {
  try {
    const result = await queryDb(
      `select id, name, rating, product_id, review, photo_url, display_date, verified_purchase, active, created_at
       from reviews order by created_at desc`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[api/admin/reviews] DB error:', err.message);
    res.status(500).json({ error: 'Could not load reviews.' });
  }
});

app.post('/api/admin/reviews', requireAdmin, async (req, res) => {
  const { name, rating, product_id, review, display_date, verified_purchase } = req.body;
  if (!name || !review) return res.status(400).json({ error: 'Name and review are required.' });
  const r = parseInt(rating);
  if (!r || r < 1 || r > 5) return res.status(400).json({ error: 'Rating must be 1–5.' });
  try {
    const result = await queryDb(
      `insert into reviews (name, rating, product_id, review, display_date, verified_purchase, active, created_at)
       values ($1, $2, $3, $4, $5, $6, true, now()) returning *`,
      [name.trim(), r, product_id || null, review.trim(), display_date || null, Boolean(verified_purchase)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[api/admin/reviews POST] DB error:', err.message);
    res.status(500).json({ error: 'Could not save review.' });
  }
});

app.post('/api/admin/reviews/:id/photo', requireAdmin, reviewUpload.single('photo'), async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const photoUrl = `/assets/reviews/${req.file.filename}`;
  try {
    const result = await queryDb(
      'update reviews set photo_url = $2 where id = $1 returning id, photo_url',
      [id, photoUrl]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Review not found.' });
    res.json({ photoUrl });
  } catch (err) {
    console.error('[api/admin/reviews/:id/photo] DB error:', err.message);
    res.status(500).json({ error: 'Could not save photo.' });
  }
});

app.put('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, rating, product_id, review, display_date, verified_purchase, active } = req.body;
  try {
    const existing = await queryDb('select * from reviews where id = $1 limit 1', [id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Review not found.' });
    const cur = existing.rows[0];
    const nextName     = name              !== undefined ? String(name).trim()           : cur.name;
    const nextRating   = rating            !== undefined ? parseInt(rating)              : cur.rating;
    const nextProduct  = product_id        !== undefined ? (product_id || null)          : cur.product_id;
    const nextReview   = review            !== undefined ? String(review).trim()         : cur.review;
    const nextDate     = display_date      !== undefined ? (display_date || null)        : cur.display_date;
    const nextVerified = verified_purchase !== undefined ? Boolean(verified_purchase)    : cur.verified_purchase;
    const nextActive   = active            !== undefined ? Boolean(active)               : cur.active;
    if (!nextName || !nextReview) return res.status(400).json({ error: 'Name and review are required.' });
    if (!nextRating || nextRating < 1 || nextRating > 5) return res.status(400).json({ error: 'Rating must be 1–5.' });
    const result = await queryDb(
      `update reviews set name=$2, rating=$3, product_id=$4, review=$5, display_date=$6,
       verified_purchase=$7, active=$8 where id=$1 returning *`,
      [id, nextName, nextRating, nextProduct, nextReview, nextDate, nextVerified, nextActive]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[api/admin/reviews PUT] DB error:', err.message);
    res.status(500).json({ error: 'Could not update review.' });
  }
});

app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await queryDb('delete from reviews where id = $1 returning id, photo_url', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Review not found.' });
    const photoUrl = result.rows[0].photo_url;
    if (photoUrl && photoUrl.startsWith('/assets/reviews/')) {
      fs.unlink(path.join(__dirname, photoUrl), () => {});
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('[api/admin/reviews DELETE] DB error:', err.message);
    res.status(500).json({ error: 'Could not delete review.' });
  }
});

// ── Admin send email ──────────────────────────────────────────────────────────

function welcomeEmailHtml(name) {
  const firstName = (name || 'there').split(' ')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DartCraft — Your setup guide &amp; links</title>
<style>
  body { margin: 0; padding: 32px 16px; background: #F4F4F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  .email-wrap { max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .email-header { background: #1A1A2E; padding: 32px 40px; text-align: center; }
  .email-logo { color: #fff; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; }
  .email-logo span { color: #7C5CFF; }
  .email-tagline { color: #9999BB; font-size: 13px; margin-top: 4px; }
  .email-hero { background: #7C5CFF; padding: 28px 40px; text-align: center; }
  .email-hero h1 { color: #fff; font-size: 20px; font-weight: 600; margin: 0 0 6px; }
  .email-hero p { color: #D5CEFF; font-size: 14px; margin: 0; }
  .email-body { background: #ffffff; padding: 32px 40px; }
  .email-body p { font-size: 15px; color: #1A1A2E; line-height: 1.7; margin: 0 0 16px; }
  .email-body p.muted { font-size: 14px; color: #666; }
  .cta-block { background: #F7F7FA; border-radius: 8px; padding: 18px 20px; margin: 16px 0; display: flex; align-items: center; gap: 16px; border: 1px solid #E8E8F0; }
  .cta-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 20px; }
  .cta-icon.purple { background: #EEEDFE; }
  .cta-icon.green  { background: #EAF3DE; }
  .cta-icon.amber  { background: #FAEEDA; }
  .cta-text { flex: 1; }
  .cta-text strong { display: block; font-size: 14px; font-weight: 600; color: #1A1A2E; margin-bottom: 2px; }
  .cta-text span { font-size: 13px; color: #666; }
  .cta-btn { display: inline-block; background: #7C5CFF; color: #fff; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 8px; text-decoration: none; white-space: nowrap; }
  .cta-btn.outline { background: transparent; color: #7C5CFF; border: 1.5px solid #7C5CFF; }
  .divider { border: none; border-top: 1px solid #EBEBF0; margin: 24px 0; }
  .email-footer { background: #F7F7FA; padding: 20px 40px; text-align: center; border-top: 1px solid #EBEBF0; }
  .email-footer p { font-size: 12px; color: #999; margin: 0; line-height: 1.6; }
  .email-footer a { color: #7C5CFF; text-decoration: none; }
  @media (max-width: 520px) {
    .email-header, .email-hero, .email-body, .email-footer { padding-left: 20px; padding-right: 20px; }
    .cta-block { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
</style>
</head>
<body>
<div class="email-wrap">
  <div class="email-header">
    <div class="email-logo">Dart<span>Craft</span></div>
    <div class="email-tagline">AutoDarts Kits Australia</div>
  </div>
  <div class="email-hero">
    <h1>You're all set — welcome to the game! 🎯</h1>
    <p>Everything you need to get started is right here.</p>
  </div>
  <div class="email-body">
    <p>Hi ${firstName},</p>
    <p>Thanks so much for your order. Your DartCraft system is ready to go, and everything you need to get set up is below.</p>
    <div class="cta-block">
      <div class="cta-icon purple">📄</div>
      <div class="cta-text">
        <strong>Setup guide</strong>
        <span>Step-by-step instructions for your system</span>
      </div>
      <a class="cta-btn" href="${BASE_URL}/assets/setup-guide.pdf">Download PDF</a>
    </div>
    <div class="cta-block">
      <div class="cta-icon green">🌐</div>
      <div class="cta-text">
        <strong>DartCraft website</strong>
        <span>Browse kits, accessories &amp; more</span>
      </div>
      <a class="cta-btn outline" href="${BASE_URL}">Visit site</a>
    </div>
    <hr class="divider">
    <p>If you have any mates looking to set up their own board, feel free to point them our way — we ship across Australia and every kit is built to the same standard as yours.</p>
    <div class="cta-block">
      <div class="cta-icon amber">⭐</div>
      <div class="cta-text">
        <strong>Leave a review</strong>
        <span>It only takes a minute and means a lot!</span>
      </div>
      <a class="cta-btn" href="${BASE_URL}/submit-review">Review us</a>
    </div>
    <hr class="divider">
    <p class="muted">Any questions or issues getting set up? Don't hesitate to reach out — happy to help.</p>
    <p class="muted">Cheers,<br><strong style="color:#1A1A2E;">The DartCraft Team</strong></p>
  </div>
  <div class="email-footer">
    <p><a href="${BASE_URL}">dartcraft.com.au</a> &nbsp;·&nbsp; Australian-built AutoDarts kits &nbsp;·&nbsp; Ships from Australia</p>
  </div>
</div>
</body>
</html>`;
}

app.post('/api/admin/send-email', requireAdmin, async (req, res) => {
  const { email, name } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(String(email))) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }
  const recipientName = (name || '').trim() || 'there';
  try {
    await sendEmail(
      email.trim().toLowerCase(),
      `Your DartCraft setup guide & links 🎯`,
      welcomeEmailHtml(recipientName)
    );
    console.log(`[admin] Welcome email sent to ${email} (${recipientName})`);
    res.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/send-email] Error:', err.message);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// ── HTML pages ────────────────────────────────────────────────────────────────

app.get('/success',        (_req, res) => res.sendFile(path.join(__dirname, 'success.html')));
app.get('/cancel',         (_req, res) => res.sendFile(path.join(__dirname, 'cancel.html')));
app.get('/admin',          (_req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/terms',          (_req, res) => res.sendFile(path.join(__dirname, 'terms.html')));
app.get('/privacy',        (_req, res) => res.sendFile(path.join(__dirname, 'privacy.html')));
app.get('/submit-review',  (_req, res) => res.sendFile(path.join(__dirname, 'submit-review.html')));
app.get('/',               (_req, res) => res.sendFile(path.join(__dirname, 'Dartcraft.html')));

// ── Start ─────────────────────────────────────────────────────────────────────

// Add tracking_number column if it doesn't exist yet (safe to run on every start)
queryDb('ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text').catch(() => {});

// Create stock_notifications table if it doesn't exist yet
queryDb(`
  CREATE TABLE IF NOT EXISTS stock_notifications (
    id SERIAL PRIMARY KEY,
    package_id TEXT NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    notified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(package_id, email)
  )
`).catch(() => {});

// Create reviews table if it doesn't exist yet
queryDb(`
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    product_id TEXT,
    review TEXT NOT NULL,
    photo_url TEXT,
    display_date TEXT,
    verified_purchase BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`).catch(() => {});

app.listen(PORT, () => {
  console.log(`\n🎯 DartCraft server running at ${BASE_URL}`);
  console.log(`   Storefront : ${BASE_URL}/Dartcraft.html`);
  console.log(`   Admin      : ${BASE_URL}/admin`);
  console.log(`   API stock  : ${BASE_URL}/api/stock\n`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set — payment sessions will fail.');
  }
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY not set — emails will be skipped.');
  }
});
