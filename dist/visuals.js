(() => {
  const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const Dartboard = ({ size = 600, showDarts = false }) => {
    const cx = size / 2, cy = size / 2;
    const R = size * 0.42;
    const k = R / 170;
    const rBull = 6 * k;
    const r25 = 15 * k;
    const rTrIn = 99 * k;
    const rTrOut = 107 * k;
    const rDbIn = 162 * k;
    const rDbOut = 170 * k;
    const rNum = 188 * k;
    const segPath = (rIn, rOut, a1, a2) => {
      const p = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      const [x1, y1] = p(a1, rOut);
      const [x2, y2] = p(a2, rOut);
      const [x3, y3] = p(a2, rIn);
      const [x4, y4] = p(a1, rIn);
      return `M${x1} ${y1} A${rOut} ${rOut} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${rIn} ${rIn} 0 0 0 ${x4} ${y4} Z`;
    };
    return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("circle", { cx, cy, r: rNum + 6 * k, fill: "#0a0a0a", stroke: "#1a1a1a", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: rNum - 4 * k, fill: "#0a0a0a" }), NUMBERS.map((n, i) => {
      const a1 = (-99 + i * 18) * Math.PI / 180;
      const a2 = (-81 + i * 18) * Math.PI / 180;
      const isLight = i % 2 === 1;
      const baseFill = isLight ? "#e9d8a8" : "#0d0d0d";
      return /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("path", { d: segPath(rTrOut, rDbIn, a1, a2), fill: baseFill, stroke: "rgba(0,0,0,0.4)", strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("path", { d: segPath(rTrIn, rTrOut, a1, a2), fill: isLight ? "#1a8f3d" : "#c52121", stroke: "rgba(0,0,0,0.3)", strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("path", { d: segPath(r25, rTrIn, a1, a2), fill: baseFill, stroke: "rgba(0,0,0,0.4)", strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("path", { d: segPath(rDbIn, rDbOut, a1, a2), fill: isLight ? "#1a8f3d" : "#c52121", stroke: "rgba(0,0,0,0.3)", strokeWidth: "0.5" }));
    }), Array.from({ length: 20 }).map((_, i) => {
      const a = (-99 + i * 18) * Math.PI / 180;
      return /* @__PURE__ */ React.createElement(
        "line",
        {
          key: i,
          x1: cx + Math.cos(a) * r25,
          y1: cy + Math.sin(a) * r25,
          x2: cx + Math.cos(a) * rDbOut,
          y2: cy + Math.sin(a) * rDbOut,
          stroke: "rgba(220,220,220,0.55)",
          strokeWidth: "1"
        }
      );
    }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: rTrIn, fill: "none", stroke: "rgba(220,220,220,0.55)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: rTrOut, fill: "none", stroke: "rgba(220,220,220,0.55)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: rDbIn, fill: "none", stroke: "rgba(220,220,220,0.55)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: rDbOut, fill: "none", stroke: "rgba(220,220,220,0.55)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: r25, fill: "#1a8f3d" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: rBull, fill: "#c52121" }), NUMBERS.map((n, i) => {
      const a = (-90 + i * 18) * Math.PI / 180;
      const x = cx + Math.cos(a) * rNum;
      const y = cy + Math.sin(a) * rNum;
      return /* @__PURE__ */ React.createElement(
        "text",
        {
          key: i,
          x,
          y,
          fill: "#f5f5f0",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: "700",
          fontSize: 14 * k,
          textAnchor: "middle",
          dominantBaseline: "central"
        },
        n
      );
    }), showDarts && /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement(Dart, { x: cx + 10 * k, y: cy - 28 * k, angle: -30 }), /* @__PURE__ */ React.createElement(Dart, { x: cx - 18 * k, y: cy + 8 * k, angle: 20 }), /* @__PURE__ */ React.createElement(Dart, { x: cx + 22 * k, y: cy + 12 * k, angle: -60 })));
  };
  const Dart = ({ x, y, angle }) => /* @__PURE__ */ React.createElement("g", { transform: `translate(${x} ${y}) rotate(${angle})` }, /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "0", x2: "40", y2: "0", stroke: "#c0c0c0", strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("polygon", { points: "0,-2 0,2 -3,0", fill: "#7C5CFF" }), /* @__PURE__ */ React.createElement("polygon", { points: "40,-3 40,3 46,0", fill: "#3a3a3a" }));
  const BoardWithRing = ({ size = 720, glow = 1, showCameras = true, highlight, showDarts = false, showLabels = true }) => {
    const cx = size / 2, cy = size / 2;
    const Rout = size * 0.47;
    const Rband = size * 0.435;
    const Rinner = size * 0.34;
    const Rmount = size * 0.455;
    const mounts = [
      { a: -90, label: "CAM 01" },
      // 12 o'clock
      { a: 90, label: "CAM 02" },
      // 6 o'clock
      { a: 120, label: "CAM 03" }
      // 7 o'clock
    ];
    return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${size} ${size}`, width: "100%", height: "100%", style: { display: "block", overflow: "visible" } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "ledGlow", cx: "50%", cy: "50%", r: "50%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "rgba(255,255,255,0.0)" }), /* @__PURE__ */ React.createElement("stop", { offset: `${Rinner / Rout * 100}%`, stopColor: "rgba(255,255,255,0.0)" }), /* @__PURE__ */ React.createElement("stop", { offset: `${Rinner / Rout * 100 + 1}%`, stopColor: "rgba(255,255,255,0.85)" }), /* @__PURE__ */ React.createElement("stop", { offset: `${Rband / Rout * 100 - 1}%`, stopColor: "rgba(255,255,255,0.92)" }), /* @__PURE__ */ React.createElement("stop", { offset: `${Rband / Rout * 100}%`, stopColor: "rgba(255,255,255,0.0)" })), /* @__PURE__ */ React.createElement("radialGradient", { id: "ambient", cx: "50%", cy: "50%", r: "80%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "rgba(124,92,255,0.18)" }), /* @__PURE__ */ React.createElement("stop", { offset: "55%", stopColor: "rgba(124,92,255,0.05)" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "rgba(0,0,0,0)" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "hoop", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#2a2a2a" }), /* @__PURE__ */ React.createElement("stop", { offset: "50%", stopColor: "#0c0c0c" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#1a1a1a" })), /* @__PURE__ */ React.createElement("radialGradient", { id: "frost", cx: "50%", cy: "50%", r: "50%" }, /* @__PURE__ */ React.createElement("stop", { offset: `${Rinner / Rout * 100}%`, stopColor: "#0a0a0a" }), /* @__PURE__ */ React.createElement("stop", { offset: `${Rband / Rout * 100}%`, stopColor: "#000000" })), /* @__PURE__ */ React.createElement("path", { id: "ringTextTop", d: `M ${cx - (Rband + Rinner) / 2} ${cy} A ${(Rband + Rinner) / 2} ${(Rband + Rinner) / 2} 0 0 1 ${cx + (Rband + Rinner) / 2} ${cy}`, fill: "none" }), /* @__PURE__ */ React.createElement("path", { id: "ringTextBot", d: `M ${cx - (Rband + Rinner) / 2} ${cy} A ${(Rband + Rinner) / 2} ${(Rband + Rinner) / 2} 0 0 0 ${cx + (Rband + Rinner) / 2} ${cy}`, fill: "none" }), /* @__PURE__ */ React.createElement("filter", { id: "softGlow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, /* @__PURE__ */ React.createElement("feGaussianBlur", { stdDeviation: "6" }))), /* @__PURE__ */ React.createElement("rect", { width: size, height: size, fill: "url(#ambient)" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: Rout, fill: "url(#hoop)", stroke: "rgba(255,255,255,0.06)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: Rband, fill: "url(#frost)" }), /* @__PURE__ */ React.createElement("g", { style: { filter: `opacity(${glow})` } }, /* @__PURE__ */ React.createElement(
      "circle",
      {
        cx,
        cy,
        r: Rinner + 8,
        fill: "none",
        stroke: "rgba(255,255,255,0.35)",
        strokeWidth: "14",
        opacity: "0.5",
        filter: "url(#softGlow)"
      }
    )), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: Rinner, fill: "#0a0b10" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: Rinner, fill: "none", stroke: "rgba(0,0,0,0.6)", strokeWidth: "3" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: Rinner - 3, fill: "none", stroke: "rgba(255,255,255,0.04)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("g", { transform: `translate(${cx - Rinner} ${cy - Rinner}) scale(${Rinner * 2 / size})` }, /* @__PURE__ */ React.createElement(Dartboard, { size, showDarts })), /* @__PURE__ */ React.createElement("g", { fontFamily: "Space Grotesk, sans-serif", fontWeight: "700", fill: "#ffffff" }, /* @__PURE__ */ React.createElement("text", { fontSize: size * 0.038, letterSpacing: size * 8e-3 }, /* @__PURE__ */ React.createElement("textPath", { href: "#ringTextTop", startOffset: "50%", textAnchor: "middle" }, "DARTCRAFT")), /* @__PURE__ */ React.createElement("text", { fontSize: size * 0.024, letterSpacing: size * 6e-3, opacity: "0.85" }, /* @__PURE__ */ React.createElement("textPath", { href: "#ringTextBot", startOffset: "50%", textAnchor: "middle" }, "AUTODARTS \xB7 COMPATIBLE"))), showCameras && mounts.map((m, i) => {
      const a = m.a * Math.PI / 180;
      const mx = cx + Math.cos(a) * Rmount;
      const my = cy + Math.sin(a) * Rmount;
      const isHi = highlight === "cameras";
      return /* @__PURE__ */ React.createElement("g", { key: i, transform: `translate(${mx} ${my}) rotate(${m.a + 90})` }, /* @__PURE__ */ React.createElement(
        "rect",
        {
          x: -size * 0.04,
          y: -size * 0.022,
          width: size * 0.08,
          height: size * 0.044,
          rx: size * 8e-3,
          fill: "#0a0a0a",
          stroke: "rgba(255,255,255,0.08)"
        }
      ), /* @__PURE__ */ React.createElement(
        "rect",
        {
          x: -size * 0.025,
          y: -size * 0.018,
          width: size * 0.05,
          height: size * 0.036,
          rx: size * 5e-3,
          fill: "#111",
          stroke: isHi ? "#7C5CFF" : "rgba(255,255,255,0.12)",
          strokeWidth: isHi ? 1.5 : 1
        }
      ), /* @__PURE__ */ React.createElement("circle", { r: size * 0.011, fill: "#000", stroke: isHi ? "#7C5CFF" : "rgba(255,255,255,0.3)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { r: size * 5e-3, fill: isHi ? "#7C5CFF" : "#222" }), isHi && /* @__PURE__ */ React.createElement("circle", { r: size * 0.018, fill: "none", stroke: "#7C5CFF", strokeWidth: "1", opacity: "0.5" }));
    }), highlight === "calibrate" && /* @__PURE__ */ React.createElement("g", { stroke: "#7C5CFF", strokeWidth: "1", opacity: "0.85" }, /* @__PURE__ */ React.createElement("circle", { cx, cy, r: Rinner * 0.5, fill: "none", strokeDasharray: "3 4" }), /* @__PURE__ */ React.createElement("circle", { cx, cy, r: Rinner * 0.7, fill: "none", strokeDasharray: "2 6", opacity: "0.5" }), /* @__PURE__ */ React.createElement("line", { x1: cx - Rinner * 0.85, y1: cy, x2: cx - Rinner * 0.5, y2: cy, strokeDasharray: "2 4" }), /* @__PURE__ */ React.createElement("line", { x1: cx + Rinner * 0.5, y1: cy, x2: cx + Rinner * 0.85, y2: cy, strokeDasharray: "2 4" }), /* @__PURE__ */ React.createElement("line", { x1: cx, y1: cy - Rinner * 0.85, x2: cx, y2: cy - Rinner * 0.5, strokeDasharray: "2 4" }), /* @__PURE__ */ React.createElement("line", { x1: cx, y1: cy + Rinner * 0.5, x2: cx, y2: cy + Rinner * 0.85, strokeDasharray: "2 4" }), /* @__PURE__ */ React.createElement("text", { x: cx + Rinner * 0.55, y: cy - 4, fill: "#7C5CFF", fontFamily: "JetBrains Mono, monospace", fontSize: size * 0.018 }, "CAL \xB7 OK")), highlight === "led" && /* @__PURE__ */ React.createElement(
      "circle",
      {
        cx,
        cy,
        r: (Rband + Rinner) / 2,
        fill: "none",
        stroke: "#7C5CFF",
        strokeWidth: Rband - Rinner,
        opacity: "0.18"
      }
    ), highlight === "mount" && /* @__PURE__ */ React.createElement("g", null, [-90, 90, 120].map((d, i) => {
      const a = d * Math.PI / 180;
      return /* @__PURE__ */ React.createElement(
        "circle",
        {
          key: i,
          cx: cx + Math.cos(a) * Rout,
          cy: cy + Math.sin(a) * Rout,
          r: size * 0.04,
          fill: "none",
          stroke: "#7C5CFF",
          strokeDasharray: "2 3",
          opacity: "0.7"
        }
      );
    })));
  };
  const HeroVisual = () => /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: "8%",
    borderRadius: "50%",
    background: "radial-gradient(circle at 50% 50%, rgba(124,92,255,0.35), rgba(124,92,255,0.08) 45%, rgba(0,0,0,0) 70%)",
    filter: "blur(20px)",
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: "18%",
    borderRadius: "50%",
    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)",
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "assets/hero-product.png",
      alt: "Dartcraft AutoDarts ring around a Winmau dartboard",
      style: {
        position: "relative",
        width: "100%",
        height: "auto",
        maxWidth: 780,
        objectFit: "contain",
        filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.6)) drop-shadow(0 0 60px rgba(124,92,255,0.25))"
      }
    }
  ));
  const StepPhoto = ({ src, alt = "" }) => /* @__PURE__ */ React.createElement("img", { src, alt, style: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  } });
  const StepVisual = ({ step }) => /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: "100%", overflow: "hidden" } }, step === 0 && /* @__PURE__ */ React.createElement(StepPhoto, { src: "assets/step1-assemble.png", alt: "Ring assembly with LED lighting" }), step === 1 && /* @__PURE__ */ React.createElement(StepPhoto, { src: "assets/step2-mount.png", alt: "Ring mounted on dartboard" }), step === 2 && /* @__PURE__ */ React.createElement(StepPhoto, { src: "assets/step3-connect.png", alt: "Connected to mini PC" }), step === 3 && /* @__PURE__ */ React.createElement(AutoDartsAccountMock, null), step === 4 && /* @__PURE__ */ React.createElement(StepPhoto, { src: "assets/step5-play.png", alt: "AutoDarts calibrated and ready to play" }));
  const AutoDartsAccountMock = () => /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: "6%",
    background: "linear-gradient(180deg, #15171c 0%, #0e1014 100%)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,92,255,0.18)",
    display: "flex",
    flexDirection: "column"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid var(--border-2)", background: "rgba(0,0,0,0.25)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 99, background: "#ff5f57" } }), /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 99, background: "#ffbd2e" } }), /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 99, background: "#28c93f" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, textAlign: "center", fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" } }, "autodarts.io / login")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "22px 22px 18px", display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 28, height: 28, borderRadius: 8, background: "#7C5CFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0b10", fontFamily: "var(--sans)", fontWeight: 800, fontSize: 14 } }, "A"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14 } }, "AutoDarts"), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10, color: "#22C55E", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: 99, background: "#22C55E", boxShadow: "0 0 6px #22C55E" } }), "BOARD ONLINE")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", marginTop: 4 } }, "Sign in to your account"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 6 } }, "EMAIL"), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" } }, "you@dartcraft.com.au", /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 1.5, height: 12, background: "#7C5CFF", verticalAlign: "-2px", marginLeft: 2, animation: "blink 1s steps(2) infinite" } }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 6 } }, "PASSWORD"), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 14, color: "var(--text-2)", letterSpacing: "2px" } }, "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022")), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px", background: "#7C5CFF", borderRadius: 8, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "#0a0b10", textAlign: "center", marginTop: 4 } }, "Sign in & link board"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", padding: "10px 12px", background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.3)", borderRadius: 8, display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 24, height: 24, borderRadius: 6, background: "rgba(124,92,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 10, color: "#7C5CFF", fontWeight: 700 } }, "\u2194"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.08em" } }, "BOARD ID"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)" } }, "DC-7F2A \xB7 paired")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 10, color: "#22C55E" } }, "\u2713"))), /* @__PURE__ */ React.createElement("style", null, `@keyframes blink{50%{opacity:0}}`));
  const ImageSlot = ({ label, ratio = "4/3", children, style = {} }) => /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    width: "100%",
    aspectRatio: ratio,
    borderRadius: 14,
    background: "repeating-linear-gradient(135deg, #0d0f14 0 8px, #0a0c10 8px 16px)",
    border: "1px solid var(--border)",
    overflow: "hidden",
    ...style
  } }, children, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 14,
    bottom: 12,
    fontFamily: "var(--mono)",
    fontSize: 11,
    color: "var(--text-3)",
    letterSpacing: "0.06em",
    textTransform: "uppercase"
  } }, "// ", label));
  window.Visuals = { HeroVisual, StepVisual, ImageSlot, BoardWithRing };
})();
