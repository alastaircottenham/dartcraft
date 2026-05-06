require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dartcraft-admin';
const STOCK_FILE  = path.join(__dirname, 'stock.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const CODES_FILE  = path.join(__dirname, 'codes.json');
const SHIPPING_CENTS = 1995; // $19.95 AUD

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const OWNER_EMAIL = process.env.OWNER_EMAIL || '';

// ── Stock helpers ─────────────────────────────────────────────────────────────

const DEFAULT_STOCK = {
  'ring-only':        { quantity: 10, label: 'Printed Ring with Camera Mounts' },
  'ring-led':         { quantity: 10, label: 'Printed Ring + LED Lighting' },
  'ring-led-cameras': { quantity: 5,  label: 'Ring + LED Lighting + Cameras' },
  'full-system':      { quantity: 3,  label: 'Full AutoDarts System' },
};

function loadStock() {
  try { return JSON.parse(fs.readFileSync(STOCK_FILE, 'utf8')); }
  catch { saveStock(DEFAULT_STOCK); return { ...DEFAULT_STOCK }; }
}

function saveStock(stock) {
  fs.writeFileSync(STOCK_FILE, JSON.stringify(stock, null, 2));
}

// ── Orders helpers ────────────────────────────────────────────────────────────

function loadOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); }
  catch { return {}; }
}

function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// ── Promo code helpers ────────────────────────────────────────────────────────

function loadCodes() {
  try { return JSON.parse(fs.readFileSync(CODES_FILE, 'utf8')); }
  catch { return {}; }
}

function saveCodes(codes) {
  fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
}

function calcDiscount(promo, priceAud) {
  if (!promo || !promo.active) return 0;
  if (promo.type === 'percent') return Math.round(priceAud * promo.value / 100) * 100;
  return Math.min(promo.value * 100, priceAud * 100);
}

// ── Package catalogue ─────────────────────────────────────────────────────────

const PACKAGES = {
  'ring-only':        { name: 'Printed Ring with Camera Mounts', priceAud: 150 },
  'ring-led':         { name: 'Printed Ring + LED Lighting',     priceAud: 199 },
  'ring-led-cameras': { name: 'Ring + LED Lighting + Cameras',   priceAud: 299 },
  'full-system':      { name: 'Full AutoDarts System',           priceAud: 549 },
};

// ── Email helpers ─────────────────────────────────────────────────────────────

async function sendEmail(to, subject, html) {
  if (!resend || !to) return;
  try {
    await resend.emails.send({ from: `DartCraft <${FROM_EMAIL}>`, to: [to], subject, html });
    console.log(`[email] Sent "${subject}" → ${to}`);
  } catch (err) {
    console.error('[email] Send error:', err.message);
  }
}

function fmt(cents) {
  return `$${(cents / 100).toFixed(2)} AUD`;
}

function confirmationEmailHtml(session) {
  const m = session.metadata || {};
  const amount = session.amount_total ? fmt(session.amount_total) : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">
  <tr><td style="background:#050607;padding:32px 40px">
    <p style="margin:0;font-size:22px;font-weight:700;color:#F5F5F0;letter-spacing:-0.02em">DartCraft</p>
    <p style="margin:8px 0 0;font-size:12px;color:#5A6070;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase">Order Confirmed</p>
  </td></tr>
  <tr><td style="padding:36px 40px">
    <p style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111;letter-spacing:-0.02em">Thanks, ${m.customerName || 'there'}! 🎯</p>
    <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6">Your order has been received and we're getting it ready. Here are your full details:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:10px;padding:24px;margin-bottom:24px">
      <tr><td>
        <p style="margin:0 0 4px;font-size:11px;color:#999;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase">Package</p>
        <p style="margin:0 0 20px;font-size:17px;font-weight:700;color:#111">${m.packageName || ''}</p>
        <p style="margin:0 0 4px;font-size:11px;color:#999;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase">Amount paid</p>
        <p style="margin:0 0 20px;font-size:17px;font-weight:700;color:#111">${amount}</p>
        <p style="margin:0 0 4px;font-size:11px;color:#999;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase">Shipping to</p>
        <p style="margin:0;font-size:14px;color:#333;line-height:1.7">${m.customerName || ''}<br>${m.street || ''}<br>${m.suburb || ''} ${m.state || ''} ${m.postcode || ''}<br>Australia</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:20px;margin-bottom:28px">
      <tr><td>
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e">What happens next</p>
        <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6">We'll pack your kit and ship it with tracking. You'll get a shipping notification when it's on its way. Setup manual is included in the box.</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6">Questions? Email <a href="mailto:hello@dartcraft.com.au" style="color:#7C5CFF">hello@dartcraft.com.au</a></p>
  </td></tr>
  <tr><td style="background:#f8f8f8;padding:20px 40px;border-top:1px solid #eee">
    <p style="margin:0;font-size:12px;color:#bbb;text-align:center">DartCraft · Australia · <a href="mailto:hello@dartcraft.com.au" style="color:#7C5CFF;text-decoration:none">hello@dartcraft.com.au</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function ownerNotificationHtml(session) {
  const m = session.metadata || {};
  const amount = session.amount_total ? fmt(session.amount_total) : '—';
  const date = new Date(session.created * 1000).toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' });
  const notesRow = m.notes ? `<tr style="border-bottom:1px solid #f0f0f0"><td style="color:#888;padding:10px 0;width:130px;vertical-align:top">Notes</td><td style="color:#333;padding:10px 0">${m.notes}</td></tr>` : '';
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">
  <tr><td style="background:#7C5CFF;padding:28px 36px">
    <p style="margin:0;font-size:20px;font-weight:700;color:#fff">🎯 New order received!</p>
    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75)">${date} AEST</p>
  </td></tr>
  <tr><td style="padding:32px 36px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
      <tr style="border-bottom:1px solid #f0f0f0"><td style="color:#888;padding:10px 0;width:130px">Package</td><td style="font-weight:700;color:#111;padding:10px 0">${m.packageName || m.packageId || '—'}</td></tr>
      <tr style="border-bottom:1px solid #f0f0f0"><td style="color:#888;padding:10px 0">Amount</td><td style="font-weight:700;color:#111;padding:10px 0">${amount}</td></tr>
      <tr style="border-bottom:1px solid #f0f0f0"><td style="color:#888;padding:10px 0">Name</td><td style="color:#333;padding:10px 0">${m.customerName || '—'}</td></tr>
      <tr style="border-bottom:1px solid #f0f0f0"><td style="color:#888;padding:10px 0">Email</td><td style="color:#333;padding:10px 0">${session.customer_email || '—'}</td></tr>
      <tr style="border-bottom:1px solid #f0f0f0"><td style="color:#888;padding:10px 0">Phone</td><td style="color:#333;padding:10px 0">${m.phone || '—'}</td></tr>
      <tr style="border-bottom:1px solid #f0f0f0"><td style="color:#888;padding:10px 0;vertical-align:top">Ship to</td><td style="color:#333;padding:10px 0;line-height:1.7">${m.street || ''}<br>${m.suburb || ''} ${m.state || ''} ${m.postcode || ''}</td></tr>
      ${notesRow}
      <tr><td style="color:#bbb;padding:10px 0;font-size:12px">Stripe ID</td><td style="color:#bbb;padding:10px 0;font-family:monospace;font-size:11px">${session.id}</td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#f8f8f8;padding:20px 36px;border-top:1px solid #eee">
    <p style="margin:0;font-size:12px;color:#bbb;text-align:center">Manage orders in your <a href="${BASE_URL}/admin" style="color:#7C5CFF">DartCraft Admin</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function shippingEmailHtml(session) {
  const m = session.metadata || {};
  const firstName = (m.customerName || 'there').split(' ')[0];
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">
  <tr><td style="background:#050607;padding:32px 40px">
    <p style="margin:0;font-size:22px;font-weight:700;color:#F5F5F0;letter-spacing:-0.02em">DartCraft</p>
    <p style="margin:8px 0 0;font-size:12px;color:#22c55e;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase">● Your order has shipped</p>
  </td></tr>
  <tr><td style="padding:36px 40px">
    <p style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111;letter-spacing:-0.02em">It's on its way, ${firstName}! 📦</p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6">Your <strong>${m.packageName || 'DartCraft kit'}</strong> has been packed and dispatched to:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:10px;padding:20px;margin-bottom:28px">
      <tr><td style="font-size:14px;color:#333;line-height:1.8">${m.customerName || ''}<br>${m.street || ''}<br>${m.suburb || ''} ${m.state || ''} ${m.postcode || ''}<br>Australia</td></tr>
    </table>
    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6">Tracking information will be provided separately where available. Your setup manual is included in the box.</p>
    <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6">Any questions? <a href="mailto:hello@dartcraft.com.au" style="color:#7C5CFF">hello@dartcraft.com.au</a></p>
  </td></tr>
  <tr><td style="background:#f8f8f8;padding:20px 40px;border-top:1px solid #eee">
    <p style="margin:0;font-size:12px;color:#bbb;text-align:center">DartCraft · Australia · <a href="mailto:hello@dartcraft.com.au" style="color:#7C5CFF;text-decoration:none">hello@dartcraft.com.au</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ── Middleware ────────────────────────────────────────────────────────────────

// Block direct access to sensitive data files before static middleware
['stock.json','orders.json','codes.json','.env','server.js'].forEach(f =>
  app.get(`/${f}`, (_req, res) => res.status(404).end())
);

app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.static(__dirname));

// ── Public API ────────────────────────────────────────────────────────────────

app.get('/api/stock', (_req, res) => {
  const stock = loadStock();
  const out = {};
  for (const [id, s] of Object.entries(stock)) out[id] = s.quantity;
  res.json(out);
});

app.post('/api/validate-promo', (req, res) => {
  const { code, packageId } = req.body;
  const pkg = PACKAGES[packageId];
  if (!pkg || !code) return res.json({ valid: false });

  const codes = loadCodes();
  const promo = codes[String(code).toUpperCase()];
  if (!promo || !promo.active) return res.json({ valid: false });

  const discountCents = calcDiscount(promo, pkg.priceAud);
  const discountDisplay = promo.type === 'percent' ? `${promo.value}% off` : `$${promo.value} off`;
  res.json({ valid: true, discountCents, discountDisplay });
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { packageId, name, email, phone, street, suburb, state, postcode, notes, promoCode } = req.body;

  const pkg = PACKAGES[packageId];
  if (!pkg) return res.status(400).json({ error: 'Invalid package selected.' });

  const stock = loadStock();
  if (!stock[packageId] || stock[packageId].quantity <= 0) {
    return res.status(400).json({ error: 'That package is currently out of stock.' });
  }

  if (!name || !email || !phone || !street || !suburb || !state || !postcode) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  // Server-side promo validation
  let discountCents = 0;
  let appliedPromo = '';
  if (promoCode) {
    const codes = loadCodes();
    const promo = codes[String(promoCode).toUpperCase()];
    if (promo && promo.active) {
      discountCents = calcDiscount(promo, pkg.priceAud);
      appliedPromo = String(promoCode).toUpperCase();
    }
  }

  try {
    const lineItems = [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: `DartCraft — ${pkg.name}`,
            description: 'AutoDarts-compatible hardware kit. DIY install required. Ships from Australia.',
            images: [`${BASE_URL}/assets/hero-product.png`],
          },
          unit_amount: pkg.priceAud * 100,
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
      const totalCents = pkg.priceAud * 100 + SHIPPING_CENTS;
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

app.post('/api/webhook', async (req, res) => {
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

    // Decrement stock
    if (packageId) {
      const stock = loadStock();
      if (stock[packageId] && stock[packageId].quantity > 0) {
        stock[packageId].quantity -= 1;
        saveStock(stock);
        console.log(`[webhook] Stock decremented: ${packageId} → ${stock[packageId].quantity} remaining`);
      }
    }

    // Send emails
    const customerEmail = session.customer_email || session.customer_details?.email;
    await Promise.all([
      sendEmail(customerEmail, 'Your DartCraft order is confirmed 🎯', confirmationEmailHtml(session)),
      sendEmail(OWNER_EMAIL, `New order: ${session.metadata?.packageName || packageId} — ${fmt(session.amount_total)}`, ownerNotificationHtml(session)),
    ]);
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
  res.json(loadStock());
});

app.put('/api/admin/stock/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative integer' });
  }
  const stock = loadStock();
  if (!stock[id]) return res.status(404).json({ error: 'Package not found' });
  stock[id].quantity = quantity;
  saveStock(stock);
  res.json({ id, quantity });
});

// GET /api/admin/orders — list all paid sessions from Stripe with local shipped status
app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const paid = sessions.data.filter(s => s.payment_status === 'paid');
    const shipped = loadOrders();
    const orders = paid.map(s => ({
      id: s.id,
      created: s.created,
      amount_total: s.amount_total,
      currency: s.currency,
      customer_email: s.customer_email || s.customer_details?.email,
      metadata: s.metadata,
      shipped: !!shipped[s.id],
      shippedAt: shipped[s.id]?.shippedAt || null,
    }));
    res.json(orders);
  } catch (err) {
    console.error('Orders error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/orders/:id/ship — mark shipped + send email
app.post('/api/admin/orders/:id/ship', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Order is not paid.' });
    }

    const orders = loadOrders();
    if (orders[id]?.shipped) {
      return res.status(400).json({ error: 'Order already marked as shipped.' });
    }

    const shippedAt = new Date().toISOString();
    orders[id] = { shipped: true, shippedAt };
    saveOrders(orders);

    const customerEmail = session.customer_email || session.customer_details?.email;
    await sendEmail(
      customerEmail,
      `Your DartCraft order has shipped! 📦`,
      shippingEmailHtml(session)
    );

    console.log(`[admin] Order ${id} marked as shipped`);
    res.json({ shipped: true, shippedAt });
  } catch (err) {
    console.error('Ship error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Admin codes CRUD ──────────────────────────────────────────────────────────

app.get('/api/admin/codes', requireAdmin, (_req, res) => {
  res.json(loadCodes());
});

app.post('/api/admin/codes', requireAdmin, (req, res) => {
  const { code, type, value, active } = req.body;
  const key = String(code || '').toUpperCase().trim();
  if (!key || !/^[A-Z0-9]+$/.test(key)) {
    return res.status(400).json({ error: 'Code must contain only letters and numbers.' });
  }
  if (!['percent', 'fixed'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "percent" or "fixed".' });
  }
  const num = parseFloat(value);
  if (!num || num <= 0 || (type === 'percent' && num > 100)) {
    return res.status(400).json({ error: 'Invalid value.' });
  }
  const codes = loadCodes();
  codes[key] = { type, value: num, active: active !== false };
  saveCodes(codes);
  res.json({ code: key, ...codes[key] });
});

app.put('/api/admin/codes/:code', requireAdmin, (req, res) => {
  const key = req.params.code.toUpperCase();
  const codes = loadCodes();
  if (!codes[key]) return res.status(404).json({ error: 'Code not found.' });
  const { type, value, active } = req.body;
  if (type !== undefined) codes[key].type = type;
  if (value !== undefined) codes[key].value = parseFloat(value);
  if (active !== undefined) codes[key].active = Boolean(active);
  saveCodes(codes);
  res.json({ code: key, ...codes[key] });
});

app.delete('/api/admin/codes/:code', requireAdmin, (req, res) => {
  const key = req.params.code.toUpperCase();
  const codes = loadCodes();
  if (!codes[key]) return res.status(404).json({ error: 'Code not found.' });
  delete codes[key];
  saveCodes(codes);
  res.json({ deleted: true });
});

// ── HTML pages ────────────────────────────────────────────────────────────────

app.get('/success', (_req, res) => res.sendFile(path.join(__dirname, 'success.html')));
app.get('/cancel',  (_req, res) => res.sendFile(path.join(__dirname, 'cancel.html')));
app.get('/admin',   (_req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/',        (_req, res) => res.sendFile(path.join(__dirname, 'Dartcraft.html')));

// ── Start ─────────────────────────────────────────────────────────────────────

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
