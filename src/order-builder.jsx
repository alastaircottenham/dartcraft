const { useState, useEffect } = React;

const AU_STATES = ['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'];

const Field = ({label, error, children, hint, span=1}) => (
  <label style={{display:'flex', flexDirection:'column', gap:8, gridColumn:`span ${span}`}}>
    <span style={{fontFamily:'var(--sans)', fontWeight:500, fontSize:13, color:'var(--text-2)'}}>{label}</span>
    {children}
    {hint && !error && <span style={{fontSize:12, color:'var(--text-3)'}}>{hint}</span>}
    {error && <span style={{fontSize:12, color:'#ef4444'}}>{error}</span>}
  </label>
);

const inputStyle = (err) => ({
  background:'#0a0b10', border:`1px solid ${err?'#ef4444':'var(--border)'}`, borderRadius:12,
  padding:'13px 16px', color:'var(--text)', fontSize:15, fontFamily:'var(--body)', width:'100%',
  outline:'none', transition:'border .15s'
});

function stockLabel(qty) {
  if (qty <= 0) return { text: 'Sold out', color: '#ef4444' };
  if (qty <= 2) return { text: `${qty} left`, color: '#f59e0b' };
  if (qty <= 5) return { text: 'Low stock', color: '#f59e0b' };
  return { text: 'In stock', color: '#22c55e' };
}

const Spinner = () => (
  <span style={{
    display:'inline-block', width:16, height:16, border:'2px solid rgba(10,11,16,0.3)',
    borderTopColor:'#0a0b10', borderRadius:'50%', animation:'dc-spin 0.6s linear infinite'
  }}/>
);

const SHIPPING_AUD = 19.95;

const OrderBuilder = ({selectedId, onSelect}) => {
  const [form, setForm] = useState({
    name:'', email:'', phone:'',
    street:'', suburb:'', state:'', postcode:'',
    notes:'', diy:false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [stockQty, setStockQty] = useState({});
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    fetch('/api/stock')
      .then(r => r.json())
      .then(setStockQty)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPromoInput('');
    setPromoCode('');
    setPromoStatus(null);
  }, [selectedId]);

  const pkg = PACKAGES.find(p => p.id === selectedId) || PACKAGES[0];
  const discountAud = (promoStatus?.valid && promoStatus.discountCents) ? promoStatus.discountCents / 100 : 0;
  const total = pkg.price + SHIPPING_AUD - discountAud;
  const currentStock = stockQty[pkg.id];
  const isSoldOut = typeof currentStock === 'number' && currentStock <= 0;

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoStatus(null);
    setPromoCode('');
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, packageId: pkg.id }),
      });
      const data = await res.json();
      if (data.valid) { setPromoCode(code); setPromoStatus(data); }
      else setPromoStatus({ valid: false });
    } catch { setPromoStatus({ valid: false }); }
    finally { setPromoLoading(false); }
  };

  const validate = () => {
    const e = {};
    if(!form.name.trim()) e.name = 'Required';
    if(!form.email.trim()) e.email = 'Required';
    else if(!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if(!form.phone.trim()) e.phone = 'Required';
    if(!form.street.trim()) e.street = 'Required';
    if(!form.suburb.trim()) e.suburb = 'Required';
    if(!form.state) e.state = 'Required';
    if(!form.postcode.trim()) e.postcode = 'Required';
    else if(!/^\d{4}$/.test(form.postcode.trim())) e.postcode = '4-digit postcode';
    if(!form.diy) e.diy = 'Please acknowledge';
    return e;
  };

  const update = (k, v) => {
    setForm(f => ({...f, [k]: v}));
    if(errors[k]) setErrors(prev => ({...prev, [k]: undefined}));
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if(Object.keys(errs).length){ setErrors(errs); return; }
    if(isSoldOut){ setApiError('This package is currently out of stock.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          name: form.name, email: form.email, phone: form.phone,
          street: form.street, suburb: form.suburb, state: form.state, postcode: form.postcode,
          notes: form.notes,
          promoCode: promoCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || 'Something went wrong. Please try again.'); setSubmitting(false); return; }
      window.location.href = data.url;
    } catch {
      setApiError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  return (
    <section id="order" style={{padding:'140px 0 120px', borderTop:'1px solid var(--border-2)', background:'linear-gradient(180deg, transparent 0%, #07080b 100%)'}}>
      <Sections.Container>
        <div style={{maxWidth:760, marginBottom:50}}>
          <Sections.Eyebrow>Order builder</Sections.Eyebrow>
          <h2 style={{fontFamily:'var(--sans)', fontWeight:700, fontSize:'clamp(34px, 4.6vw, 60px)', lineHeight:1.05, letterSpacing:'-0.025em', margin:'18px 0 18px'}}>
            Build your DartCraft kit.
          </h2>
          <p style={{fontSize:17, lineHeight:1.6, color:'var(--text-2)', maxWidth:560}}>
            Choose the package that suits your setup. Full payment is required at checkout. Orders will be shipped once payment is received.
          </p>
        </div>

        <form onSubmit={submit} style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:32, alignItems:'flex-start'}} className="dc-order-grid">
          {/* LEFT */}
          <div style={{display:'flex', flexDirection:'column', gap:24}}>
            {/* Package picker */}
            <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:18, padding:28}}>
              <SectionHead num="01" title="Choose your kit"/>
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {PACKAGES.map(p => {
                  const qty = stockQty[p.id];
                  const soldOut = typeof qty === 'number' && qty <= 0;
                  const sl = typeof qty === 'number' ? stockLabel(qty) : null;
                  const isSelected = selectedId === p.id;
                  return (
                    <label key={p.id} style={{
                      display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:18,
                      padding:'20px 22px', border:`1px solid ${isSelected?'var(--accent)':'var(--border)'}`, borderRadius:14,
                      cursor: soldOut ? 'not-allowed' : 'pointer',
                      background: isSelected ? 'rgba(124,92,255,0.06)' : '#0a0b10',
                      opacity: soldOut ? 0.5 : 1,
                      transition:'all .15s'
                    }}>
                      <div style={{
                        width:22, height:22, borderRadius:99,
                        border:`2px solid ${isSelected?'var(--accent)':'var(--border)'}`,
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                      }}>
                        {isSelected && <div style={{width:10, height:10, borderRadius:99, background:'var(--accent)'}}/>}
                      </div>
                      <input type="radio" name="pkg" value={p.id} checked={isSelected}
                        onChange={() => !soldOut && onSelect(p.id)} style={{display:'none'}} disabled={soldOut}/>
                      <div>
                        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap'}}>
                          <span style={{fontFamily:'var(--sans)', fontWeight:600, fontSize:16, letterSpacing:'-0.01em'}}>{p.name}</span>
                          {p.badge && <span style={{fontSize:10, fontFamily:'var(--mono)', letterSpacing:'0.06em', textTransform:'uppercase', background:'var(--accent)', color:'#0a0b10', padding:'2px 7px', borderRadius:99, fontWeight:600}}>{p.badge}</span>}
                          {sl && <span style={{fontSize:10, fontFamily:'var(--mono)', letterSpacing:'0.06em', textTransform:'uppercase', color:sl.color, padding:'2px 7px', borderRadius:99, border:`1px solid ${sl.color}`, fontWeight:600}}>{sl.text}</span>}
                        </div>
                        <div style={{fontSize:13, color:'var(--text-2)', lineHeight:1.45}}>{p.bestFor}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontFamily:'var(--sans)', fontWeight:700, fontSize:22, letterSpacing:'-0.02em'}}>${p.price}</div>
                        <div style={{fontSize:11, color:'var(--text-3)'}}>AUD</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Customer details */}
            <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:18, padding:28}}>
              <SectionHead num="02" title="Your details"/>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
                <Field label="Full name" error={errors.name} span={2}>
                  <input style={inputStyle(errors.name)} value={form.name} onChange={e=>update('name', e.target.value)} placeholder="Jane Smith"/>
                </Field>
                <Field label="Email" error={errors.email}>
                  <input type="email" style={inputStyle(errors.email)} value={form.email} onChange={e=>update('email', e.target.value)} placeholder="jane@example.com"/>
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input style={inputStyle(errors.phone)} value={form.phone} onChange={e=>update('phone', e.target.value)} placeholder="0400 000 000"/>
                </Field>
              </div>
            </div>

            {/* Shipping */}
            <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:18, padding:28}}>
              <SectionHead num="03" title="Shipping address" tag="Australia only"/>
              <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:18}} className="dc-ship-fields">
                <Field label="Street address" error={errors.street} span={3}>
                  <input style={inputStyle(errors.street)} value={form.street} onChange={e=>update('street', e.target.value)} placeholder="42 Wallaby Way"/>
                </Field>
                <Field label="Suburb" error={errors.suburb} span={2}>
                  <input style={inputStyle(errors.suburb)} value={form.suburb} onChange={e=>update('suburb', e.target.value)} placeholder="Sydney"/>
                </Field>
                <Field label="Postcode" error={errors.postcode}>
                  <input style={inputStyle(errors.postcode)} value={form.postcode} onChange={e=>update('postcode', e.target.value)} placeholder="2000" maxLength={4}/>
                </Field>
                <Field label="State" error={errors.state}>
                  <select style={{...inputStyle(errors.state), appearance:'none', backgroundImage:'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'><path fill=\'none\' stroke=\'%23A5ABB8\' stroke-width=\'1.5\' d=\'M1 1l5 5 5-5\'/></svg>")', backgroundRepeat:'no-repeat', backgroundPosition:'right 16px center'}}
                          value={form.state} onChange={e=>update('state', e.target.value)}>
                    <option value="">Select…</option>
                    {AU_STATES.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Country" span={2}>
                  <input style={{...inputStyle(false), background:'#06070a', color:'var(--text-2)'}} value="Australia" disabled/>
                </Field>
              </div>
            </div>

            {/* Notes */}
            <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:18, padding:28}}>
              <SectionHead num="04" title="Notes (optional)"/>
              <textarea style={{...inputStyle(false), minHeight:100, resize:'vertical', fontFamily:'var(--body)'}}
                placeholder="Anything we should know? Specific dartboard model, surround type, delivery instructions…"
                value={form.notes} onChange={e=>update('notes', e.target.value)}/>
            </div>
          </div>

          {/* RIGHT — sticky summary */}
          <aside style={{position:'sticky', top:100}} className="dc-order-aside">
            <div style={{
              background:'linear-gradient(180deg, #15131f 0%, #0a0b10 100%)',
              border:'1px solid var(--border)', borderRadius:18, padding:28,
              display:'flex', flexDirection:'column', gap:22
            }}>
              <div>
                <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8}}>Your order</div>
                <div style={{fontFamily:'var(--sans)', fontWeight:700, fontSize:22, letterSpacing:'-0.015em', lineHeight:1.2}}>{pkg.name}</div>
                {pkg.badge && <div style={{marginTop:10}}><span style={{fontSize:10, fontFamily:'var(--mono)', letterSpacing:'0.06em', textTransform:'uppercase', background:'var(--accent)', color:'#0a0b10', padding:'3px 8px', borderRadius:99, fontWeight:600}}>{pkg.badge}</span></div>}
              </div>

              <div style={{borderTop:'1px solid var(--border-2)', paddingTop:18}}>
                <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.08em', marginBottom:10}}>INCLUDED</div>
                <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:7}}>
                  {pkg.includes.map(it => (
                    <li key={it} style={{display:'flex', gap:8, fontSize:13, color:'var(--text)'}}>
                      <span style={{color:'var(--accent)', flexShrink:0, marginTop:2}}><Icons.Check size={13}/></span>{it}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{borderTop:'1px solid var(--border-2)', paddingTop:18}}>
                <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.08em', marginBottom:10}}>NOT INCLUDED</div>
                <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:5}}>
                  {pkg.excludes.map(it => (
                    <li key={it} style={{display:'flex', gap:8, fontSize:12, color:'var(--text-3)'}}>
                      <span style={{flexShrink:0, marginTop:2, opacity:0.5}}><Icons.Minus size={12}/></span>{it}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Promo code input */}
              <div style={{borderTop:'1px solid var(--border-2)', paddingTop:18}}>
                <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.08em', marginBottom:10}}>PROMO CODE</div>
                <div style={{display:'flex', gap:8}}>
                  <input
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus(null); setPromoCode(''); }}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    placeholder="Enter code"
                    style={{...inputStyle(promoStatus?.valid === false), flex:1, fontSize:13, padding:'10px 14px', fontFamily:'var(--mono)', letterSpacing:'0.05em'}}
                  />
                  <button type="button" onClick={applyPromo} disabled={promoLoading || !promoInput.trim()} style={{
                    padding:'10px 16px', borderRadius:12, border:'1px solid var(--border)',
                    background:'rgba(255,255,255,0.05)', color:'var(--text)', fontFamily:'var(--sans)',
                    fontWeight:600, fontSize:13, cursor:promoLoading||!promoInput.trim()?'not-allowed':'pointer',
                    whiteSpace:'nowrap', opacity:promoLoading||!promoInput.trim()?0.45:1
                  }}>{promoLoading ? '…' : 'Apply'}</button>
                </div>
                {promoStatus?.valid && <div style={{marginTop:7, fontSize:12, color:'#22c55e'}}>✓ {promoStatus.discountDisplay} applied</div>}
                {promoStatus?.valid === false && <div style={{marginTop:7, fontSize:12, color:'#ef4444'}}>Invalid or expired code</div>}
              </div>

              <div style={{borderTop:'1px solid var(--border-2)', paddingTop:18, display:'flex', flexDirection:'column', gap:8}}>
                <Row k="Subtotal" v={`$${pkg.price}.00`}/>
                <Row k="Shipping (AU)" v="$19.95"/>
                {discountAud > 0 && <Row k={`Promo (${promoCode})`} v={`−$${discountAud.toFixed(2)}`} discount/>}
                <Row k="GST" v="Included" muted/>
                <div style={{height:1, background:'var(--border-2)', margin:'6px 0'}}/>
                <Row k="Total" v={`$${total.toFixed(2)} AUD`} big/>
              </div>

              {isSoldOut && (
                <div style={{padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, fontSize:13, color:'#ef4444'}}>
                  This package is currently out of stock. Please select another option.
                </div>
              )}

              {apiError && (
                <div style={{padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, fontSize:13, color:'#ef4444'}}>
                  {apiError}
                </div>
              )}

              <label style={{display:'flex', gap:12, alignItems:'flex-start', padding:'14px', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, cursor:'pointer'}}>
                <input type="checkbox" checked={form.diy} onChange={e=>update('diy', e.target.checked)} style={{
                  marginTop:2, width:18, height:18, accentColor:'#7C5CFF', cursor:'pointer', flexShrink:0
                }}/>
                <span style={{fontSize:12.5, lineHeight:1.5, color:'var(--text-2)'}}>
                  I understand this is a <span style={{color:'var(--text)'}}>DIY install hardware kit</span>. Dartboard and in-home installation are not included unless specifically stated.
                </span>
              </label>
              {errors.diy && <span style={{fontSize:12, color:'#ef4444', marginTop:-12}}>{errors.diy}</span>}

              <button type="submit" disabled={submitting || isSoldOut} style={{
                padding:'16px', borderRadius:99, border:'none',
                cursor: (submitting || isSoldOut) ? 'not-allowed' : 'pointer',
                background: (submitting || isSoldOut) ? 'rgba(245,245,240,0.35)' : '#F5F5F0',
                color:'#0a0b10', fontFamily:'var(--sans)', fontWeight:700, fontSize:15,
                display:'flex', alignItems:'center', justifyContent:'center', gap:10
              }}>
                {submitting ? <><Spinner/> Redirecting to Stripe…</> : <><Icons.Lock size={15}/> Pay ${total.toFixed(2)} — Secure checkout</>}
              </button>
              <div style={{textAlign:'center', fontSize:11, color:'var(--text-3)', fontFamily:'var(--mono)', letterSpacing:'0.06em'}}>
                FULL PAYMENT REQUIRED · STRIPE SECURED
              </div>
            </div>
          </aside>
        </form>
      </Sections.Container>

      <style>{`
        @keyframes dc-spin { to { transform: rotate(360deg); } }
        @media (max-width: 980px){
          .dc-order-grid{grid-template-columns:1fr !important}
          .dc-order-aside{position:relative !important; top:auto !important}
        }
        @media (max-width: 600px){
          .dc-ship-fields{grid-template-columns:1fr !important}
          .dc-ship-fields > label{grid-column: span 1 !important}
        }
        input::placeholder, textarea::placeholder { color: var(--text-3); }
        input:focus, select:focus, textarea:focus { border-color: var(--accent) !important; }
      `}</style>
    </section>
  );
};

const SectionHead = ({num, title, tag}) => (
  <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:24}}>
    <div style={{
      width:34, height:34, borderRadius:8, background:'rgba(124,92,255,0.12)', color:'var(--accent)',
      display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:12, fontWeight:600
    }}>{num}</div>
    <div style={{fontFamily:'var(--sans)', fontWeight:600, fontSize:18, letterSpacing:'-0.01em', flex:1}}>{title}</div>
    {tag && <div style={{fontSize:11, fontFamily:'var(--mono)', letterSpacing:'0.06em', color:'var(--text-3)', textTransform:'uppercase'}}>{tag}</div>}
  </div>
);

const Row = ({k, v, big, muted, discount}) => (
  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
    <div style={{fontSize: big?15:13, color: big?'var(--text)':'var(--text-2)', fontFamily: big?'var(--sans)':'var(--body)', fontWeight: big?600:400}}>{k}</div>
    <div style={{fontSize: big?22:14, fontWeight: big?700:500, color: discount?'#22c55e':muted?'var(--text-3)':'var(--text)', fontFamily:'var(--sans)', letterSpacing: big?'-0.02em':'0'}}>{v}</div>
  </div>
);

window.OrderBuilder = OrderBuilder;
