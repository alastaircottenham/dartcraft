// Photo-accurate dartboard + LED ring visual based on the real product photos.
// The ring is a black outer hoop, white frosted inner panel that diffuses LED light,
// with 4 black camera mount clips at top/right/bottom/left (cardinal positions).

const NUMBERS = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

// Authentic dartboard built from SVG. realistic colors: cream + black segments,
// red/green doubles & triples, red/green bull.
const Dartboard = ({size=600, showDarts=false}) => {
  const cx = size/2, cy = size/2;
  // proportions roughly true to a real board: bull r=6, 25 r=15, triple inner r=99, triple outer r=107, double inner r=162, double outer r=170 (out of 226 board radius)
  // We'll scale around board radius ~ 0.42 * size
  const R = size * 0.42;
  const k = R / 170;
  const rBull = 6*k;
  const r25   = 15*k;
  const rTrIn = 99*k;
  const rTrOut= 107*k;
  const rDbIn = 162*k;
  const rDbOut= 170*k;
  const rNum  = 188*k;

  const segPath = (rIn, rOut, a1, a2) => {
    const p = (a, r) => [cx + Math.cos(a)*r, cy + Math.sin(a)*r];
    const [x1,y1] = p(a1, rOut);
    const [x2,y2] = p(a2, rOut);
    const [x3,y3] = p(a2, rIn);
    const [x4,y4] = p(a1, rIn);
    return `M${x1} ${y1} A${rOut} ${rOut} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${rIn} ${rIn} 0 0 0 ${x4} ${y4} Z`;
  };

  return (
    <g>
      {/* Outer black bezel of the dartboard itself */}
      <circle cx={cx} cy={cy} r={rNum + 6*k} fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="1"/>
      {/* number band — matte black */}
      <circle cx={cx} cy={cy} r={rNum - 4*k} fill="#0a0a0a"/>

      {/* Segments */}
      {NUMBERS.map((n, i) => {
        const a1 = (-99 + i*18) * Math.PI/180;
        const a2 = (-81 + i*18) * Math.PI/180;
        const isLight = i % 2 === 1;
        const baseFill = isLight ? '#e9d8a8' : '#0d0d0d';
        return (
          <g key={i}>
            {/* outer (single, between triple and double) */}
            <path d={segPath(rTrOut, rDbIn, a1, a2)} fill={baseFill} stroke="rgba(0,0,0,0.4)" strokeWidth="0.5"/>
            {/* triple ring */}
            <path d={segPath(rTrIn, rTrOut, a1, a2)} fill={isLight ? '#1a8f3d' : '#c52121'} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5"/>
            {/* inner single */}
            <path d={segPath(r25, rTrIn, a1, a2)} fill={baseFill} stroke="rgba(0,0,0,0.4)" strokeWidth="0.5"/>
            {/* double ring */}
            <path d={segPath(rDbIn, rDbOut, a1, a2)} fill={isLight ? '#1a8f3d' : '#c52121'} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5"/>
          </g>
        );
      })}

      {/* spider wires */}
      {Array.from({length:20}).map((_,i)=>{
        const a = (-99 + i*18) * Math.PI/180;
        return <line key={i} x1={cx + Math.cos(a)*r25} y1={cy + Math.sin(a)*r25}
                     x2={cx + Math.cos(a)*rDbOut} y2={cy + Math.sin(a)*rDbOut}
                     stroke="rgba(220,220,220,0.55)" strokeWidth="1"/>
      })}
      <circle cx={cx} cy={cy} r={rTrIn}  fill="none" stroke="rgba(220,220,220,0.55)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={rTrOut} fill="none" stroke="rgba(220,220,220,0.55)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={rDbIn}  fill="none" stroke="rgba(220,220,220,0.55)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={rDbOut} fill="none" stroke="rgba(220,220,220,0.55)" strokeWidth="1"/>

      {/* Bull */}
      <circle cx={cx} cy={cy} r={r25}   fill="#1a8f3d"/>
      <circle cx={cx} cy={cy} r={rBull} fill="#c52121"/>

      {/* Numbers */}
      {NUMBERS.map((n,i)=>{
        const a = (-90 + i*18) * Math.PI/180;
        const x = cx + Math.cos(a)*rNum;
        const y = cy + Math.sin(a)*rNum;
        return <text key={i} x={x} y={y} fill="#f5f5f0"
                     fontFamily="Space Grotesk, sans-serif" fontWeight="700"
                     fontSize={14*k} textAnchor="middle" dominantBaseline="central">{n}</text>;
      })}

      {/* darts */}
      {showDarts && (
        <g>
          <Dart x={cx + 10*k} y={cy - 28*k} angle={-30}/>
          <Dart x={cx - 18*k} y={cy + 8*k} angle={20}/>
          <Dart x={cx + 22*k} y={cy + 12*k} angle={-60}/>
        </g>
      )}
    </g>
  );
};

const Dart = ({x,y,angle}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <line x1="0" y1="0" x2="40" y2="0" stroke="#c0c0c0" strokeWidth="1.5"/>
    <polygon points="0,-2 0,2 -3,0" fill="#7C5CFF"/>
    <polygon points="40,-3 40,3 46,0" fill="#3a3a3a"/>
  </g>
);

// Dartboard + ring with cameras. Reusable across hero + step views.
const BoardWithRing = ({size=720, glow=1, showCameras=true, highlight, showDarts=false, showLabels=true}) => {
  const cx = size/2, cy = size/2;
  // Ring proportions per photo: outer ring ~ 0.94*size radius, inner aperture ~ 0.50*size radius
  const Rout  = size * 0.47;        // outer black hoop edge
  const Rband = size * 0.435;       // inside of outer hoop (start of frosted panel)
  const Rinner= size * 0.34;        // inner aperture (where dartboard sits)
  const Rmount= size * 0.455;       // where camera mounts attach (on outer hoop)

  // 3 camera mount positions per the actual product photo:
  // clock 12 (top), clock 6 (bottom), clock 7 (lower-left).
  // Clock-to-degree mapping: 12 → -90, 6 → 90, 7 → 120.
  const mounts = [
    {a: -90, label:'CAM 01'}, // 12 o'clock
    {a:  90, label:'CAM 02'}, // 6 o'clock
    {a: 120, label:'CAM 03'}, // 7 o'clock
  ];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{display:'block', overflow:'visible'}}>
      <defs>
        <radialGradient id="ledGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="rgba(255,255,255,0.0)"/>
          <stop offset={`${(Rinner/Rout)*100}%`} stopColor="rgba(255,255,255,0.0)"/>
          <stop offset={`${(Rinner/Rout)*100 + 1}%`} stopColor="rgba(255,255,255,0.85)"/>
          <stop offset={`${(Rband/Rout)*100 - 1}%`} stopColor="rgba(255,255,255,0.92)"/>
          <stop offset={`${(Rband/Rout)*100}%`} stopColor="rgba(255,255,255,0.0)"/>
        </radialGradient>
        <radialGradient id="ambient" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="rgba(124,92,255,0.18)"/>
          <stop offset="55%" stopColor="rgba(124,92,255,0.05)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
        <linearGradient id="hoop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a"/>
          <stop offset="50%" stopColor="#0c0c0c"/>
          <stop offset="100%" stopColor="#1a1a1a"/>
        </linearGradient>
        <radialGradient id="frost" cx="50%" cy="50%" r="50%">
          <stop offset={`${(Rinner/Rout)*100}%`} stopColor="#0a0a0a"/>
          <stop offset={`${(Rband/Rout)*100}%`} stopColor="#000000"/>
        </radialGradient>
        {/* Path for curved text along the upper arc of the surround */}
        <path id="ringTextTop" d={`M ${cx - (Rband+Rinner)/2} ${cy} A ${(Rband+Rinner)/2} ${(Rband+Rinner)/2} 0 0 1 ${cx + (Rband+Rinner)/2} ${cy}`} fill="none"/>
        {/* Path for curved text along the lower arc */}
        <path id="ringTextBot" d={`M ${cx - (Rband+Rinner)/2} ${cy} A ${(Rband+Rinner)/2} ${(Rband+Rinner)/2} 0 0 0 ${cx + (Rband+Rinner)/2} ${cy}`} fill="none"/>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6"/>
        </filter>
      </defs>

      {/* ambient backdrop */}
      <rect width={size} height={size} fill="url(#ambient)"/>

      {/* Outer hoop (black) */}
      <circle cx={cx} cy={cy} r={Rout} fill="url(#hoop)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {/* Frosted LED panel ring */}
      <circle cx={cx} cy={cy} r={Rband} fill="url(#frost)"/>
      {/* subtle inner LED bleed behind the board (the lit halo escaping inside) */}
      <g style={{filter:`opacity(${glow})`}}>
        <circle cx={cx} cy={cy} r={Rinner+8} fill="none"
                stroke="rgba(255,255,255,0.35)" strokeWidth="14"
                opacity="0.5" filter="url(#softGlow)"/>
      </g>
      {/* inner aperture cutout */}
      <circle cx={cx} cy={cy} r={Rinner} fill="#0a0b10"/>
      {/* inner bevel ring */}
      <circle cx={cx} cy={cy} r={Rinner} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="3"/>
      <circle cx={cx} cy={cy} r={Rinner-3} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>

      {/* Dartboard */}
      <g transform={`translate(${cx - Rinner} ${cy - Rinner}) scale(${(Rinner*2)/size})`}>
        <Dartboard size={size} showDarts={showDarts}/>
      </g>

      {/* Curved white labels on the black surround, Winmau-style */}
      <g fontFamily="Space Grotesk, sans-serif" fontWeight="700" fill="#ffffff">
        <text fontSize={size*0.038} letterSpacing={size*0.008}>
          <textPath href="#ringTextTop" startOffset="50%" textAnchor="middle">DARTCRAFT</textPath>
        </text>
        <text fontSize={size*0.024} letterSpacing={size*0.006} opacity="0.85">
          <textPath href="#ringTextBot" startOffset="50%" textAnchor="middle">AUTODARTS · COMPATIBLE</textPath>
        </text>
      </g>

      {/* Camera mounts at 4 cardinal positions */}
      {showCameras && mounts.map((m, i)=>{
        const a = m.a * Math.PI/180;
        const mx = cx + Math.cos(a)*Rmount;
        const my = cy + Math.sin(a)*Rmount;
        const isHi = highlight === 'cameras';
        return (
          <g key={i} transform={`translate(${mx} ${my}) rotate(${m.a + 90})`}>
            {/* mount arm — short stub from outside ring */}
            <rect x={-size*0.04} y={-size*0.022} width={size*0.08} height={size*0.044} rx={size*0.008}
                  fill="#0a0a0a" stroke="rgba(255,255,255,0.08)"/>
            {/* camera body (small cube clip seen in photos) */}
            <rect x={-size*0.025} y={-size*0.018} width={size*0.05} height={size*0.036} rx={size*0.005}
                  fill="#111" stroke={isHi?'#7C5CFF':'rgba(255,255,255,0.12)'} strokeWidth={isHi?1.5:1}/>
            {/* lens */}
            <circle r={size*0.011} fill="#000" stroke={isHi?'#7C5CFF':'rgba(255,255,255,0.3)'} strokeWidth="1"/>
            <circle r={size*0.005} fill={isHi?'#7C5CFF':'#222'}/>
            {/* pulse ring on highlight */}
            {isHi && <circle r={size*0.018} fill="none" stroke="#7C5CFF" strokeWidth="1" opacity="0.5"/>}
          </g>
        );
      })}

      {/* Calibration crosshair overlay */}
      {highlight === 'calibrate' && (
        <g stroke="#7C5CFF" strokeWidth="1" opacity="0.85">
          <circle cx={cx} cy={cy} r={Rinner*0.5} fill="none" strokeDasharray="3 4"/>
          <circle cx={cx} cy={cy} r={Rinner*0.7} fill="none" strokeDasharray="2 6" opacity="0.5"/>
          <line x1={cx - Rinner*0.85} y1={cy} x2={cx - Rinner*0.5} y2={cy} strokeDasharray="2 4"/>
          <line x1={cx + Rinner*0.5} y1={cy} x2={cx + Rinner*0.85} y2={cy} strokeDasharray="2 4"/>
          <line x1={cx} y1={cy - Rinner*0.85} x2={cx} y2={cy - Rinner*0.5} strokeDasharray="2 4"/>
          <line x1={cx} y1={cy + Rinner*0.5} x2={cx} y2={cy + Rinner*0.85} strokeDasharray="2 4"/>
          <text x={cx + Rinner*0.55} y={cy - 4} fill="#7C5CFF" fontFamily="JetBrains Mono, monospace" fontSize={size*0.018}>CAL · OK</text>
        </g>
      )}

      {/* Highlight indicators */}
      {highlight === 'led' && (
        <circle cx={cx} cy={cy} r={(Rband+Rinner)/2} fill="none"
                stroke="#7C5CFF" strokeWidth={Rband-Rinner} opacity="0.18"/>
      )}
      {highlight === 'mount' && (
        <g>
          {[ -90, 90, 120 ].map((d,i)=>{
            const a = d*Math.PI/180;
            return <circle key={i} cx={cx + Math.cos(a)*Rout} cy={cy + Math.sin(a)*Rout} r={size*0.04}
                           fill="none" stroke="#7C5CFF" strokeDasharray="2 3" opacity="0.7"/>
          })}
        </g>
      )}
    </svg>
  );
};

// HERO: real product photo treated to match the dark theme
const HeroVisual = () => (
  <div style={{position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
    {/* purple ambient halo behind the product */}
    <div style={{
      position:'absolute', inset:'8%', borderRadius:'50%',
      background:'radial-gradient(circle at 50% 50%, rgba(124,92,255,0.35), rgba(124,92,255,0.08) 45%, rgba(0,0,0,0) 70%)',
      filter:'blur(20px)', pointerEvents:'none',
    }}/>
    {/* soft white LED bloom */}
    <div style={{
      position:'absolute', inset:'18%', borderRadius:'50%',
      background:'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)',
      pointerEvents:'none',
    }}/>
    <img src="assets/hero-product.webp" alt="Dartcraft AutoDarts ring around a Winmau dartboard"
      style={{
        position:'relative', width:'100%', height:'auto', maxWidth:780, objectFit:'contain',
        filter:'drop-shadow(0 40px 80px rgba(0,0,0,0.6)) drop-shadow(0 0 60px rgba(124,92,255,0.25))',
      }}/>
  </div>
);

// "Step" visual that highlights specific aspects per step
// step keys: 0 assemble, 1 mount, 2 connect-pc, 3 autodarts, 4 calibrate
const StepPhoto = ({src, alt=''}) => (
  <img src={src} alt={alt} loading="lazy" style={{
    position:'absolute', inset:0, width:'100%', height:'100%',
    objectFit:'cover', display:'block'
  }}/>
);

const StepVisual = ({step}) => (
  <div style={{position:'relative', width:'100%', height:'100%', overflow:'hidden'}}>
    {step === 0 && <StepPhoto src="assets/step1-assemble.webp" alt="Ring assembly with LED lighting"/>}
    {step === 1 && <StepPhoto src="assets/step2-mount.webp" alt="Ring mounted on dartboard"/>}
    {step === 2 && <StepPhoto src="assets/step3-connect.webp" alt="Connected to mini PC"/>}
    {step === 3 && <AutoDartsAccountMock/>}
    {step === 4 && <StepPhoto src="assets/step5-play.webp" alt="AutoDarts calibrated and ready to play"/>}
  </div>
);

// ── Flat-screen monitor illustration ──────────────────────────────────────────
const MonitorSVG = () => (
  <svg viewBox="0 0 200 165" style={{width:'100%', height:'auto', display:'block', filter:'drop-shadow(0 10px 20px rgba(0,0,0,0.6))'}}>
    <defs>
      <linearGradient id="monBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1d1f24"/>
        <stop offset="100%" stopColor="#0e1014"/>
      </linearGradient>
      <linearGradient id="monScreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0d0f15"/>
        <stop offset="100%" stopColor="#080a10"/>
      </linearGradient>
    </defs>
    {/* bezel */}
    <rect x="10" y="6" width="180" height="128" rx="5" fill="url(#monBody)" stroke="rgba(255,255,255,0.07)"/>
    {/* screen */}
    <rect x="17" y="13" width="166" height="113" rx="2" fill="url(#monScreen)"/>
    {/* setup UI on screen */}
    <rect x="24" y="20" width="152" height="8" rx="1.5" fill="rgba(124,92,255,0.15)"/>
    <text x="100" y="26.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="6.5" fill="#7C5CFF" letterSpacing="1.5">AUTODARTS  SETUP</text>
    {/* progress bar track */}
    <rect x="24" y="34" width="152" height="3" rx="1.5" fill="rgba(255,255,255,0.05)"/>
    {/* progress bar fill */}
    <rect x="24" y="34" width="100" height="3" rx="1.5" fill="#7C5CFF" opacity="0.75"/>
    <text x="130" y="37" fontFamily="JetBrains Mono, monospace" fontSize="4.5" fill="#7C5CFF" opacity="0.7">66%</text>
    {/* content rows */}
    <rect x="24" y="44" width="55" height="4" rx="1" fill="rgba(255,255,255,0.07)"/>
    <rect x="24" y="52" width="80" height="3.5" rx="1" fill="rgba(255,255,255,0.04)"/>
    <rect x="24" y="59" width="68" height="3.5" rx="1" fill="rgba(255,255,255,0.04)"/>
    {/* camera feed box */}
    <rect x="112" y="44" width="56" height="44" rx="3" fill="#060810" stroke="rgba(124,92,255,0.25)" strokeWidth="0.8"/>
    <text x="140" y="67" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="5" fill="rgba(124,92,255,0.6)">CAM FEED</text>
    <circle cx="140" cy="55" r="3" fill="none" stroke="rgba(124,92,255,0.4)" strokeWidth="0.7" strokeDasharray="1 1"/>
    {/* continue button */}
    <rect x="112" y="95" width="56" height="14" rx="3" fill="#7C5CFF" opacity="0.9"/>
    <text x="140" y="104" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="7" fill="#0a0b10">Continue →</text>
    {/* status row */}
    <circle cx="30" cy="110" r="2.5" fill="#22C55E" opacity="0.9"/>
    <rect x="36" y="107" width="45" height="5" rx="1" fill="rgba(255,255,255,0.05)"/>
    <text x="58" y="111" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="4.5" fill="rgba(34,197,94,0.7)">BOARD DETECTED</text>
    {/* stand neck */}
    <rect x="95" y="134" width="10" height="16" rx="2" fill="#111315"/>
    {/* stand base */}
    <rect x="72" y="149" width="56" height="5" rx="2.5" fill="#111315" stroke="rgba(255,255,255,0.05)"/>
    {/* power LED */}
    <circle cx="100" cy="137" r="1.8" fill="#22C55E" opacity="0.85">
      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.8s" repeatCount="indefinite"/>
    </circle>
    {/* HDMI port on bottom edge */}
    <rect x="86" y="130" width="10" height="3" rx="0.5" fill="#080a0e" stroke="rgba(255,255,255,0.1)"/>
  </svg>
);

// ── Mock: hero ring connected to a Dell OptiPlex Micro (animated USB packets) ──
const ConnectPCMock = () => (
  <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
    {/* Ring product on the left, smaller */}
    <div style={{position:'absolute', left:'2%', top:'50%', transform:'translateY(-50%)', width:'52%', aspectRatio:'1/1'}}>
      <img src="assets/hero-product.webp" alt="Dartcraft ring" loading="lazy" style={{
        width:'100%', height:'100%', objectFit:'contain',
        filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.55)) drop-shadow(0 0 20px rgba(124,92,255,0.2))',
      }}/>
    </div>

    {/* Monitor top-right */}
    <div style={{position:'absolute', right:'1%', top:'1%', width:'40%'}}>
      <MonitorSVG/>
      <div style={{textAlign:'center', marginTop:3, fontFamily:'var(--mono)', fontSize:8, color:'#F59E0B', letterSpacing:'0.08em'}}>
        MONITOR — NOT INCLUDED
      </div>
    </div>

    {/* OptiPlex Micro in the bottom-right */}
    <div style={{position:'absolute', right:'4%', bottom:'10%', width:'34%'}}>
      <OptiplexMicro/>
      <div style={{textAlign:'center', marginTop:8, fontFamily:'var(--mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em'}}>
        DELL OPTIPLEX MICRO
      </div>
    </div>

    {/* SVG overlay: USB cables (ring→PC) + HDMI cable (monitor→PC) */}
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none'}}>
      <defs>
        <linearGradient id="cableGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.9"/>
        </linearGradient>
      </defs>

      {/* USB cables: ring (~27,50) → PC (~76,70) */}
      <path id="cable1" d="M 27 50 C 50 50, 58 68, 76 70" fill="none" stroke="url(#cableGrad)" strokeWidth="0.6" opacity="0.55"/>
      <path id="cable2" d="M 29 56 C 52 60, 60 74, 76 74" fill="none" stroke="url(#cableGrad)" strokeWidth="0.5" opacity="0.4"/>
      <path id="cable3" d="M 25 44 C 48 42, 58 64, 76 68" fill="none" stroke="url(#cableGrad)" strokeWidth="0.5" opacity="0.4"/>

      {/* HDMI cable: monitor bottom (~79,36) → PC top (~79,55) */}
      <path d="M 79 36 C 79 44, 79 48, 79 55" fill="none" stroke="#888" strokeWidth="0.8" opacity="0.45" strokeDasharray="1.5 2"/>

      {/* Animated data packets — USB */}
      <circle r="1.1" fill="#7C5CFF">
        <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto"><mpath href="#cable1"/></animateMotion>
      </circle>
      <circle r="0.9" fill="#22D3EE" opacity="0.9">
        <animateMotion dur="2.4s" begin="0.8s" repeatCount="indefinite" rotate="auto"><mpath href="#cable1"/></animateMotion>
      </circle>
      <circle r="0.8" fill="#22C55E" opacity="0.85">
        <animateMotion dur="2.4s" begin="1.6s" repeatCount="indefinite" rotate="auto"><mpath href="#cable1"/></animateMotion>
      </circle>
      <circle r="0.8" fill="#22D3EE" opacity="0.7">
        <animateMotion dur="3s" repeatCount="indefinite" rotate="auto"><mpath href="#cable2"/></animateMotion>
      </circle>
      <circle r="0.8" fill="#7C5CFF" opacity="0.7">
        <animateMotion dur="3s" begin="1.5s" repeatCount="indefinite" rotate="auto"><mpath href="#cable3"/></animateMotion>
      </circle>
    </svg>

    {/* Status chips */}
    <div style={{position:'absolute', bottom:'4%', left:'4%', fontFamily:'var(--mono)', fontSize:9, color:'#22C55E', display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.6)', padding:'5px 9px', borderRadius:99, border:'1px solid rgba(34,197,94,0.35)'}}>
      <span style={{width:6, height:6, borderRadius:99, background:'#22C55E', boxShadow:'0 0 6px #22C55E'}}/>
      USB 3.0 · LINKED
    </div>
    <div style={{position:'absolute', bottom:'13%', left:'4%', fontFamily:'var(--mono)', fontSize:9, color:'var(--text-2)', background:'rgba(0,0,0,0.55)', padding:'5px 9px', borderRadius:99, border:'1px solid var(--border)'}}>
      3× CAM · 1× LED PWR
    </div>
  </div>
);

// ── Dell OptiPlex Micro illustration ───────────────────────────────────────
const OptiplexMicro = () => (
  <svg viewBox="0 0 200 180" style={{width:'100%', height:'auto', display:'block', filter:'drop-shadow(0 14px 24px rgba(0,0,0,0.6))'}}>
    <defs>
      <linearGradient id="pcBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1d1f24"/>
        <stop offset="55%" stopColor="#0e1014"/>
        <stop offset="100%" stopColor="#06070a"/>
      </linearGradient>
      <linearGradient id="pcTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2a2d33"/>
        <stop offset="100%" stopColor="#15171c"/>
      </linearGradient>
    </defs>
    {/* shadow */}
    <ellipse cx="100" cy="170" rx="70" ry="6" fill="#000" opacity="0.5"/>
    {/* main body — tall mini tower */}
    <rect x="55" y="20" width="90" height="145" rx="6" fill="url(#pcBody)" stroke="rgba(255,255,255,0.06)"/>
    {/* top bevel */}
    <rect x="55" y="20" width="90" height="10" rx="6" fill="url(#pcTop)"/>
    {/* power button */}
    <circle cx="68" cy="36" r="2.4" fill="#0a0b10" stroke="rgba(255,255,255,0.15)"/>
    <circle cx="68" cy="36" r="1" fill="#22C55E" opacity="0.9">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
    </circle>
    {/* Dell badge area */}
    <rect x="78" y="32" width="44" height="9" rx="1.5" fill="#0a0b10" stroke="rgba(255,255,255,0.08)"/>
    <text x="100" y="39" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="6" fill="#aaa" letterSpacing="2">DELL</text>
    {/* drive slot */}
    <rect x="65" y="50" width="70" height="2" rx="1" fill="#000"/>
    <rect x="65" y="55" width="70" height="1" rx="0.5" fill="rgba(255,255,255,0.04)"/>
    {/* vent grille */}
    <g opacity="0.6">
      {Array.from({length:14}).map((_,i)=>(
        <rect key={i} x="65" y={70 + i*5} width="70" height="1.2" rx="0.5" fill="#000"/>
      ))}
    </g>
    {/* USB ports row */}
    <g>
      <rect x="65" y="148" width="9" height="3.4" rx="0.6" fill="#0066cc"/>
      <rect x="76" y="148" width="9" height="3.4" rx="0.6" fill="#0066cc"/>
      <rect x="87" y="148" width="9" height="3.4" rx="0.6" fill="#0066cc"/>
      <rect x="98" y="148" width="9" height="3.4" rx="0.6" fill="#0066cc"/>
      {/* cables coming out the side */}
      <rect x="135" y="80" width="6" height="3" rx="1" fill="#222"/>
      <rect x="135" y="90" width="6" height="3" rx="1" fill="#222"/>
      <rect x="135" y="100" width="6" height="3" rx="1" fill="#222"/>
    </g>
    {/* base / stand */}
    <rect x="50" y="163" width="100" height="4" rx="2" fill="#0a0b10" stroke="rgba(255,255,255,0.05)"/>
  </svg>
);
// ── Step 1: Assemble — ring image + allen key + manual ────────────────────────
const AllenKeySVG = () => (
  <svg viewBox="0 0 40 110" width="34" height="90" style={{display:'block'}}>
    <defs>
      <linearGradient id="akMetal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#2a2d33"/>
        <stop offset="40%" stopColor="#3a3d44"/>
        <stop offset="100%" stopColor="#1e2026"/>
      </linearGradient>
    </defs>
    {/* horizontal short arm */}
    <rect x="4" y="4" width="32" height="9" rx="4.5" fill="url(#akMetal)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
    {/* vertical long arm */}
    <rect x="4" y="4" width="9" height="100" rx="4.5" fill="url(#akMetal)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
    {/* highlight stripe — short arm */}
    <rect x="6" y="6" width="28" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
    {/* highlight stripe — long arm */}
    <rect x="6" y="8" width="2" height="93" rx="1" fill="rgba(255,255,255,0.07)"/>
    {/* hex socket at tip */}
    <polygon points="8.5,97 13,94 13,100" fill="rgba(255,255,255,0.15)"/>
    <circle cx="8.5" cy="97" r="3" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7"/>
  </svg>
);

const ManualSVG = () => (
  <svg viewBox="0 0 72 90" width="60" height="75" style={{display:'block'}}>
    {/* back page */}
    <rect x="8" y="4" width="58" height="78" rx="3" fill="#16181f" stroke="rgba(255,255,255,0.05)"/>
    {/* front page */}
    <rect x="3" y="8" width="58" height="78" rx="3" fill="#1e2028" stroke="rgba(255,255,255,0.1)"/>
    {/* purple header band */}
    <rect x="3" y="8" width="58" height="14" rx="3" fill="rgba(124,92,255,0.4)"/>
    <rect x="3" y="16" width="58" height="6" fill="rgba(124,92,255,0.4)"/>
    <text x="32" y="18" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="6" fill="#0a0b10" letterSpacing="0.5">DARTCRAFT</text>
    <text x="32" y="25" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="4" fill="rgba(10,11,16,0.7)" letterSpacing="0.5">SETUP GUIDE</text>
    {/* ring diagram */}
    <circle cx="32" cy="48" r="18" fill="none" stroke="rgba(124,92,255,0.3)" strokeWidth="1.2"/>
    <circle cx="32" cy="48" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
    <circle cx="32" cy="48" r="5" fill="rgba(124,92,255,0.15)"/>
    {/* mount point dots */}
    <circle cx="32" cy="30" r="2" fill="rgba(124,92,255,0.5)"/>
    <circle cx="32" cy="66" r="2" fill="rgba(124,92,255,0.5)"/>
    <circle cx="14" cy="48" r="2" fill="rgba(124,92,255,0.5)"/>
    <circle cx="50" cy="48" r="2" fill="rgba(124,92,255,0.5)"/>
    {/* text lines */}
    <rect x="10" y="70" width="42" height="2.5" rx="1" fill="rgba(255,255,255,0.07)"/>
    <rect x="10" y="75" width="32" height="2.5" rx="1" fill="rgba(255,255,255,0.05)"/>
    <rect x="10" y="80" width="38" height="2.5" rx="1" fill="rgba(255,255,255,0.05)"/>
    {/* spine */}
    <rect x="3" y="8" width="5" height="78" rx="2" fill="rgba(0,0,0,0.35)"/>
  </svg>
);

const AssembleMock = () => (
  <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
    {/* Ring image — centred */}
    <img src="assets/step1-ring.webp" alt="Ring assembly" loading="lazy" style={{
      position:'absolute', top:'50%', left:'50%', width:'74%', objectFit:'contain',
      transform:'translate(-50%, -50%)',
      filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 24px rgba(124,92,255,0.2))',
    }}/>

    {/* Allen key — bottom left */}
    <div style={{position:'absolute', left:'3%', bottom:'5%', display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
      <AllenKeySVG/>
      <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.08em', textAlign:'center', lineHeight:1.5}}>
        ALLEN<br/>KEY
      </div>
    </div>

    {/* Manual — bottom right */}
    <div style={{position:'absolute', right:'2%', bottom:'5%', display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
      <ManualSVG/>
      <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.08em', textAlign:'center', lineHeight:1.5}}>
        SETUP<br/>MANUAL
      </div>
    </div>

    {/* Label chip */}
    <div style={{position:'absolute', top:'5%', left:'6%', fontFamily:'var(--mono)', fontSize:9, color:'var(--accent)', background:'rgba(0,0,0,0.6)', padding:'5px 10px', borderRadius:99, border:'1px solid rgba(124,92,255,0.4)', letterSpacing:'0.06em'}}>
      ASSEMBLE + LED
    </div>
  </div>
);

// ── Stone wall background SVG ─────────────────────────────────────────────────
const StoneWallBg = () => (
  <svg viewBox="0 0 520 520" width="100%" height="100%" style={{position:'absolute',inset:0,display:'block'}} preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="stoneVig" cx="50%" cy="50%" r="72%">
        <stop offset="35%" stopColor="rgba(0,0,0,0)"/>
        <stop offset="100%" stopColor="rgba(0,0,0,0.52)"/>
      </radialGradient>
    </defs>
    {/* mortar */}
    <rect width="520" height="520" fill="#4a4440"/>
    {/* row 0 */}
    <rect x="1"   y="1"   width="126" height="56" rx="1" fill="#b0a898"/>
    <rect x="129" y="1"   width="94"  height="56" rx="1" fill="#8a7e6c"/>
    <rect x="225" y="1"   width="148" height="56" rx="1" fill="#b4ac9c"/>
    <rect x="375" y="1"   width="82"  height="56" rx="1" fill="#786a58"/>
    <rect x="459" y="1"   width="60"  height="56" rx="1" fill="#a4988a"/>
    {/* row 1 */}
    <rect x="1"   y="59"  width="78"  height="60" rx="1" fill="#988c7c"/>
    <rect x="81"  y="59"  width="136" height="60" rx="1" fill="#beb6a6"/>
    <rect x="219" y="59"  width="104" height="60" rx="1" fill="#867a6a"/>
    <rect x="325" y="59"  width="118" height="60" rx="1" fill="#aca49c"/>
    <rect x="445" y="59"  width="74"  height="60" rx="1" fill="#9c9282"/>
    {/* row 2 */}
    <rect x="1"   y="121" width="158" height="66" rx="1" fill="#b8b2a4"/>
    <rect x="161" y="121" width="108" height="66" rx="1" fill="#887868"/>
    <rect x="271" y="121" width="136" height="66" rx="1" fill="#c0b8aa"/>
    <rect x="409" y="121" width="110" height="66" rx="1" fill="#7e7262"/>
    {/* row 3 */}
    <rect x="1"   y="189" width="92"  height="56" rx="1" fill="#a09488"/>
    <rect x="95"  y="189" width="124" height="56" rx="1" fill="#b6ae9e"/>
    <rect x="221" y="189" width="90"  height="56" rx="1" fill="#8e8272"/>
    <rect x="313" y="189" width="128" height="56" rx="1" fill="#786860"/>
    <rect x="443" y="189" width="76"  height="56" rx="1" fill="#b0a898"/>
    {/* row 4 */}
    <rect x="1"   y="247" width="144" height="62" rx="1" fill="#c4beb0"/>
    <rect x="147" y="247" width="96"  height="62" rx="1" fill="#847868"/>
    <rect x="245" y="247" width="154" height="62" rx="1" fill="#aea8a0"/>
    <rect x="401" y="247" width="118" height="62" rx="1" fill="#706458"/>
    {/* row 5 */}
    <rect x="1"   y="311" width="108" height="58" rx="1" fill="#9e9486"/>
    <rect x="111" y="311" width="88"  height="58" rx="1" fill="#b8b2a4"/>
    <rect x="201" y="311" width="142" height="58" rx="1" fill="#887c6e"/>
    <rect x="345" y="311" width="98"  height="58" rx="1" fill="#bab4a8"/>
    <rect x="445" y="311" width="74"  height="58" rx="1" fill="#786c5e"/>
    {/* row 6 */}
    <rect x="1"   y="371" width="82"  height="66" rx="1" fill="#a89e90"/>
    <rect x="85"  y="371" width="148" height="66" rx="1" fill="#c2bab0"/>
    <rect x="235" y="371" width="116" height="66" rx="1" fill="#86786a"/>
    <rect x="353" y="371" width="92"  height="66" rx="1" fill="#b0a8a0"/>
    <rect x="447" y="371" width="72"  height="66" rx="1" fill="#6e6258"/>
    {/* row 7 */}
    <rect x="1"   y="439" width="132" height="80" rx="1" fill="#b2ac9e"/>
    <rect x="135" y="439" width="96"  height="80" rx="1" fill="#7a6e60"/>
    <rect x="233" y="439" width="158" height="80" rx="1" fill="#bab4a8"/>
    <rect x="393" y="439" width="126" height="80" rx="1" fill="#928880"/>
    {/* vignette */}
    <rect width="520" height="520" fill="url(#stoneVig)"/>
  </svg>
);

// ── Step 2: Mount ─────────────────────────────────────────────────────────────
const MountMock = () => (
  <div style={{position:'absolute', inset:0, overflow:'hidden', borderRadius:18}}>
    <StoneWallBg/>
    {/* dark tint so ring reads clearly against stone */}
    <div style={{position:'absolute', inset:0, background:'rgba(5,6,7,0.36)'}}/>
    {/* Ring — centred */}
    <img src="assets/hero-product.webp" alt="Board mounted on wall" loading="lazy" style={{
      position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
      width:'82%', objectFit:'contain',
      filter:'drop-shadow(0 28px 60px rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(124,92,255,0.15))',
    }}/>
  </div>
);

const AutoDartsAccountMock = () => (
  <div style={{
    position:'absolute', inset:'6%',
    background:'linear-gradient(180deg, #15171c 0%, #0e1014 100%)',
    border:'1px solid var(--border)', borderRadius:18, overflow:'hidden',
    boxShadow:'0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,92,255,0.18)',
    display:'flex', flexDirection:'column',
  }}>
    {/* window chrome */}
    <div style={{display:'flex', alignItems:'center', gap:6, padding:'10px 14px', borderBottom:'1px solid var(--border-2)', background:'rgba(0,0,0,0.25)'}}>
      <span style={{width:10, height:10, borderRadius:99, background:'#ff5f57'}}/>
      <span style={{width:10, height:10, borderRadius:99, background:'#ffbd2e'}}/>
      <span style={{width:10, height:10, borderRadius:99, background:'#28c93f'}}/>
      <div style={{flex:1, textAlign:'center', fontFamily:'var(--mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.06em'}}>autodarts.io / login</div>
    </div>
    {/* body */}
    <div style={{flex:1, padding:'22px 22px 18px', display:'flex', flexDirection:'column', gap:14}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{width:28, height:28, borderRadius:8, background:'#7C5CFF', display:'flex', alignItems:'center', justifyContent:'center', color:'#0a0b10', fontFamily:'var(--sans)', fontWeight:800, fontSize:14}}>A</div>
        <div style={{fontFamily:'var(--sans)', fontWeight:700, fontSize:14}}>AutoDarts</div>
        <div style={{marginLeft:'auto', fontFamily:'var(--mono)', fontSize:10, color:'#22C55E', display:'flex', alignItems:'center', gap:6}}>
          <span style={{width:6, height:6, borderRadius:99, background:'#22C55E', boxShadow:'0 0 6px #22C55E'}}/>
          BOARD ONLINE
        </div>
      </div>
      <div style={{fontFamily:'var(--sans)', fontWeight:700, fontSize:18, letterSpacing:'-0.01em', marginTop:4}}>Sign in to your account</div>

      {/* email field */}
      <div>
        <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em', marginBottom:6}}>EMAIL</div>
        <div style={{padding:'10px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8, fontFamily:'var(--mono)', fontSize:12, color:'var(--text)'}}>
          you@dartcraft.com.au<span style={{display:'inline-block', width:1.5, height:12, background:'#7C5CFF', verticalAlign:'-2px', marginLeft:2, animation:'blink 1s steps(2) infinite'}}/>
        </div>
      </div>
      {/* password field */}
      <div>
        <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em', marginBottom:6}}>PASSWORD</div>
        <div style={{padding:'10px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8, fontFamily:'var(--mono)', fontSize:14, color:'var(--text-2)', letterSpacing:'2px'}}>••••••••••</div>
      </div>

      {/* sign in button */}
      <div style={{padding:'12px', background:'#7C5CFF', borderRadius:8, fontFamily:'var(--sans)', fontWeight:700, fontSize:13, color:'#0a0b10', textAlign:'center', marginTop:4}}>
        Sign in & link board
      </div>

      {/* board pairing chip */}
      <div style={{marginTop:'auto', padding:'10px 12px', background:'rgba(124,92,255,0.08)', border:'1px solid rgba(124,92,255,0.3)', borderRadius:8, display:'flex', alignItems:'center', gap:10}}>
        <div style={{width:24, height:24, borderRadius:6, background:'rgba(124,92,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:10, color:'#7C5CFF', fontWeight:700}}>↔</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.08em'}}>BOARD ID</div>
          <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--text)'}}>DC-7F2A · paired</div>
        </div>
        <div style={{fontFamily:'var(--mono)', fontSize:10, color:'#22C55E'}}>✓</div>
      </div>
    </div>
    <style>{`@keyframes blink{50%{opacity:0}}`}</style>
  </div>
);

// ── Mock: live AutoDarts game scoreboard with calibrated board ────────────
const PlayMock = () => (
  <div style={{
    position:'absolute', inset:'6%',
    background:'linear-gradient(180deg, #0e1014 0%, #0a0b10 100%)',
    border:'1px solid var(--border)', borderRadius:18, overflow:'hidden',
    boxShadow:'0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,92,255,0.18)',
    display:'grid', gridTemplateColumns:'1.1fr 1fr',
  }}>
    {/* Left: live calibrated board feed */}
    <div style={{position:'relative', borderRight:'1px solid var(--border-2)', background:'#08090d', overflow:'hidden'}}>
      <img src="assets/hero-product.webp" alt="Live board" loading="lazy" style={{
        position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
        filter:'brightness(0.85)',
      }}/>
      {/* Calibration crosshair */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none'}}>
        <circle cx="50" cy="50" r="22" fill="none" stroke="#7C5CFF" strokeWidth="0.4" strokeDasharray="1.5 1.5" opacity="0.85"/>
        <circle cx="50" cy="50" r="32" fill="none" stroke="#7C5CFF" strokeWidth="0.3" strokeDasharray="1 2" opacity="0.5"/>
        <line x1="16" y1="50" x2="28" y2="50" stroke="#7C5CFF" strokeWidth="0.4"/>
        <line x1="72" y1="50" x2="84" y2="50" stroke="#7C5CFF" strokeWidth="0.4"/>
        <line x1="50" y1="16" x2="50" y2="28" stroke="#7C5CFF" strokeWidth="0.4"/>
        <line x1="50" y1="72" x2="50" y2="84" stroke="#7C5CFF" strokeWidth="0.4"/>
        {/* dart hit markers */}
        <circle cx="48" cy="42" r="1.4" fill="#22C55E"/>
        <circle cx="53" cy="49" r="1.4" fill="#22C55E"/>
        <circle cx="46" cy="51" r="1.4" fill="#FF6B6B"/>
      </svg>
      {/* status chips */}
      <div style={{position:'absolute', top:10, left:10, fontFamily:'var(--mono)', fontSize:9, color:'#22C55E', display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.6)', padding:'4px 8px', borderRadius:99, border:'1px solid rgba(34,197,94,0.4)'}}>
        <span style={{width:6, height:6, borderRadius:99, background:'#22C55E', boxShadow:'0 0 6px #22C55E'}}/>
        LIVE · 60 FPS
      </div>
      <div style={{position:'absolute', top:10, right:10, fontFamily:'var(--mono)', fontSize:9, color:'var(--text-2)', background:'rgba(0,0,0,0.6)', padding:'4px 8px', borderRadius:99, border:'1px solid var(--border)'}}>
        CAL · OK
      </div>
      <div style={{position:'absolute', bottom:10, left:10, fontFamily:'var(--mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.08em'}}>
        CAM 01 · CAM 02 · CAM 03
      </div>
    </div>

    {/* Right: scoreboard panel */}
    <div style={{padding:'14px 14px 12px', display:'flex', flexDirection:'column', gap:10}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em'}}>X01 · 501</div>
        <div style={{marginLeft:'auto', fontFamily:'var(--mono)', fontSize:9, color:'var(--accent)', letterSpacing:'0.08em'}}>LEG 2 / 3</div>
      </div>

      {/* Player A — active */}
      <div style={{padding:'10px 12px', background:'rgba(124,92,255,0.1)', border:'1px solid rgba(124,92,255,0.4)', borderRadius:10}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{width:6, height:6, borderRadius:99, background:'#7C5CFF', boxShadow:'0 0 8px #7C5CFF'}}/>
            <div style={{fontFamily:'var(--sans)', fontWeight:700, fontSize:13}}>You</div>
          </div>
          <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--text-3)'}}>AVG 78.4</div>
        </div>
        <div style={{fontFamily:'var(--sans)', fontWeight:700, fontSize:34, letterSpacing:'-0.02em', lineHeight:1, marginTop:4}}>187</div>
        <div style={{display:'flex', gap:6, marginTop:8}}>
          <Pill>T20</Pill><Pill>20</Pill><Pill>5</Pill>
          <div style={{marginLeft:'auto', fontFamily:'var(--mono)', fontSize:10, color:'#22C55E'}}>+85</div>
        </div>
      </div>

      {/* Player B */}
      <div style={{padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:10}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontFamily:'var(--sans)', fontWeight:600, fontSize:13, color:'var(--text-2)'}}>Riley</div>
          <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--text-3)'}}>AVG 65.1</div>
        </div>
        <div style={{fontFamily:'var(--sans)', fontWeight:700, fontSize:24, letterSpacing:'-0.02em', lineHeight:1, marginTop:4, color:'var(--text-2)'}}>241</div>
      </div>

      {/* Last throw */}
      <div style={{marginTop:'auto', padding:'8px 10px', background:'rgba(0,0,0,0.4)', border:'1px solid var(--border-2)', borderRadius:8, fontFamily:'var(--mono)', fontSize:10, color:'var(--text-2)', display:'flex', justifyContent:'space-between'}}>
        <span style={{color:'var(--text-3)', letterSpacing:'0.06em'}}>LAST</span>
        <span><span style={{color:'#22C55E'}}>T20</span> · <span style={{color:'#22C55E'}}>20</span> · <span style={{color:'#FF6B6B'}}>5</span></span>
      </div>
    </div>
  </div>
);

const Pill = ({children}) => (
  <span style={{
    padding:'2px 8px', borderRadius:99, background:'rgba(124,92,255,0.15)', border:'1px solid rgba(124,92,255,0.35)',
    fontFamily:'var(--mono)', fontSize:10, color:'#c9bbff', letterSpacing:'0.04em'
  }}>{children}</span>
);

const ImageSlot = ({label, ratio='4/3', children, style={}}) => (
  <div style={{
    position:'relative', width:'100%', aspectRatio:ratio, borderRadius:14,
    background:'repeating-linear-gradient(135deg, #0d0f14 0 8px, #0a0c10 8px 16px)',
    border:'1px solid var(--border)', overflow:'hidden', ...style
  }}>
    {children}
    <div style={{
      position:'absolute', left:14, bottom:12, fontFamily:'var(--mono)', fontSize:11,
      color:'var(--text-3)', letterSpacing:'0.06em', textTransform:'uppercase'
    }}>// {label}</div>
  </div>
);

window.Visuals = { HeroVisual, StepVisual, ImageSlot, BoardWithRing };
