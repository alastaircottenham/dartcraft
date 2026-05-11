(() => {
  const { useState, useEffect, useRef } = React;
  const Container = ({ children, style = {}, className = "" }) => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 1280, margin: "0 auto", padding: "0 32px", ...style }, className }, children);
  const Eyebrow = ({ children, color = "var(--accent)" }) => /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--mono)",
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color,
    display: "inline-flex",
    alignItems: "center",
    gap: 10
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, background: color, borderRadius: 99 } }), children);
  const PillButton = ({ children, primary, onClick, href, style = {}, type, className = "" }) => {
    const base = {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "14px 22px",
      borderRadius: 99,
      fontFamily: "var(--sans)",
      fontWeight: 600,
      fontSize: 15,
      letterSpacing: "-0.005em",
      cursor: "pointer",
      border: "1px solid transparent",
      transition: "transform .15s ease, background .15s ease, color .15s ease"
    };
    const styles = primary ? { ...base, background: "#F5F5F0", color: "#0a0b10", ...style } : { ...base, background: "transparent", color: "var(--text)", border: "1px solid var(--border)", ...style };
    const Tag = href ? "a" : "button";
    return /* @__PURE__ */ React.createElement(
      Tag,
      {
        href,
        onClick,
        type,
        className,
        style: styles,
        onMouseEnter: (e) => e.currentTarget.style.transform = "translateY(-1px)",
        onMouseLeave: (e) => e.currentTarget.style.transform = "translateY(0)"
      },
      children
    );
  };
  const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    useEffect(() => {
      const onS = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", onS);
      return () => window.removeEventListener("scroll", onS);
    }, []);
    const navLinks = [
      { label: "How it works", href: "#how" },
      { label: "Kits", href: "#kits" },
      { label: "Order", href: "#order" },
      { label: "FAQ", href: "#faq" }
    ];
    return /* @__PURE__ */ React.createElement("header", { style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      transition: "all .25s ease",
      background: scrolled ? "rgba(5,6,7,0.72)" : "transparent",
      backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
      borderBottom: scrolled ? "1px solid var(--border-2)" : "1px solid transparent"
    } }, /* @__PURE__ */ React.createElement(Container, { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px" } }, /* @__PURE__ */ React.createElement("a", { href: "#top", style: { display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em" }, "aria-label": "DartCraft" }, /* @__PURE__ */ React.createElement("img", { src: "assets/dartcraft-logo.png", alt: "DartCraft", style: { height: 42, width: "auto", display: "block" } })), /* @__PURE__ */ React.createElement("nav", { style: { display: "flex", alignItems: "center", gap: 32 }, className: "dc-nav" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 28 }, className: "dc-nav-links" }, navLinks.map((l) => /* @__PURE__ */ React.createElement(
      "a",
      {
        key: l.href,
        href: l.href,
        style: {
          fontFamily: "var(--sans)",
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text)",
          opacity: 0.85,
          transition: "opacity .15s"
        },
        onMouseEnter: (e) => e.currentTarget.style.opacity = 1,
        onMouseLeave: (e) => e.currentTarget.style.opacity = 0.85
      },
      l.label
    ))), /* @__PURE__ */ React.createElement(PillButton, { primary: true, href: "#order", style: { padding: "10px 20px", fontSize: 14 }, className: "dc-build-btn" }, "Build your kit"), /* @__PURE__ */ React.createElement("button", { onClick: () => setOpen((o) => !o), className: "dc-burger", style: {
      display: "none",
      background: "transparent",
      border: "1px solid var(--border)",
      color: "var(--text)",
      width: 40,
      height: 40,
      borderRadius: 99,
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer"
    } }, open ? /* @__PURE__ */ React.createElement(Icons.Close, null) : /* @__PURE__ */ React.createElement(Icons.Menu, null)))), open && /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 32px 22px", background: "rgba(5,6,7,0.95)", borderTop: "1px solid var(--border-2)" }, className: "dc-mobile-menu" }, navLinks.map((l) => /* @__PURE__ */ React.createElement("a", { key: l.href, href: l.href, onClick: () => setOpen(false), style: {
      display: "block",
      padding: "14px 0",
      borderBottom: "1px solid var(--border-2)",
      fontFamily: "var(--sans)",
      fontSize: 18,
      fontWeight: 500
    } }, l.label)), /* @__PURE__ */ React.createElement("a", { href: "#order", onClick: () => setOpen(false), style: {
      display: "block",
      padding: "14px 0",
      fontFamily: "var(--sans)",
      fontSize: 18,
      fontWeight: 600,
      color: "var(--accent)"
    } }, "Build your kit \u2192")), /* @__PURE__ */ React.createElement("style", null, `
        @media (max-width: 820px){
          .dc-nav-links{display:none !important}
          .dc-burger{display:inline-flex !important}
          .dc-build-btn{display:none !important}
        }
      `));
  };
  const Hero = () => {
    return /* @__PURE__ */ React.createElement("section", { id: "top", style: { position: "relative", minHeight: "100vh", paddingTop: 120, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { "aria-hidden": true, style: {
      position: "absolute",
      top: "10%",
      left: "-10%",
      width: "70%",
      aspectRatio: "1/1",
      background: "radial-gradient(circle, rgba(124,92,255,0.18) 0%, transparent 60%)",
      filter: "blur(60px)",
      pointerEvents: "none"
    } }), /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 48, alignItems: "center", minHeight: "80vh" }, className: "dc-hero-grid" }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", aspectRatio: "1/1", maxWidth: 720, marginLeft: "-4%" }, className: "dc-hero-visual" }, /* @__PURE__ */ React.createElement(Visuals.HeroVisual, null)), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 520 }, className: "dc-hero-text" }, /* @__PURE__ */ React.createElement(Eyebrow, null, "AutoDarts-compatible \xB7 Built in Australia"), /* @__PURE__ */ React.createElement("h1", { style: {
      fontFamily: "var(--sans)",
      fontWeight: 700,
      fontSize: "clamp(40px, 5.4vw, 72px)",
      lineHeight: 1.02,
      letterSpacing: "-0.025em",
      margin: "18px 0 22px",
      textWrap: "balance"
    } }, "Turn your dartboard into an automatic scoring setup."), /* @__PURE__ */ React.createElement("p", { style: {
      fontSize: 17,
      lineHeight: 1.55,
      color: "var(--text-2)",
      maxWidth: 460,
      margin: "0 0 32px"
    } }, "Ready-to-ship hardware kits for AutoDarts users. Printed camera rings, LED lighting, cameras, or a full system with a pre-configured mini PC. ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, "DIY install required."), " Setup guidance included."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 } }, /* @__PURE__ */ React.createElement(PillButton, { primary: true, href: "#order" }, "Build your kit ", /* @__PURE__ */ React.createElement(Icons.Arrow, { size: 16 })), /* @__PURE__ */ React.createElement(PillButton, { href: "#kits" }, "See packages")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 26px", paddingTop: 24, borderTop: "1px solid var(--border-2)" } }, [
      { i: /* @__PURE__ */ React.createElement(Icons.Ship, { size: 16 }), t: "Ships from Australia" },
      { i: /* @__PURE__ */ React.createElement(Icons.Box, { size: 16 }), t: "DIY install" },
      { i: /* @__PURE__ */ React.createElement(Icons.Bolt, { size: 16 }), t: "AutoDarts-compatible" },
      { i: /* @__PURE__ */ React.createElement(Icons.Chip, { size: 16 }), t: "Full system available" }
    ].map((b, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)", fontSize: 13, fontFamily: "var(--sans)", fontWeight: 500 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)" } }, b.i), b.t)))))), /* @__PURE__ */ React.createElement("style", null, `
        @media (max-width: 980px){
          .dc-hero-grid{grid-template-columns: 1fr !important; gap: 24px !important}
          .dc-hero-visual{max-width: 520px !important; margin: 0 auto !important; aspect-ratio: 1/1 !important}
          .dc-hero-text{margin: 0 auto !important; text-align: left !important}
        }
      `));
  };
  const Marquee = () => /* @__PURE__ */ React.createElement("div", { style: {
    margin: "80px 0 0",
    padding: "18px 0",
    borderTop: "1px solid var(--border-2)",
    borderBottom: "1px solid var(--border-2)",
    overflow: "hidden",
    whiteSpace: "nowrap"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-block", animation: "dc-mq 40s linear infinite", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-2)" } }, Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ React.createElement("span", { key: i, style: { padding: "0 28px" } }, "AutoDarts-Compatible ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", margin: "0 18px" } }, "\u25CF"), " Australian Stock ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", margin: "0 18px" } }, "\u25CF"), " DIY Install ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", margin: "0 18px" } }, "\u25CF"), " Ready to Ship ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", margin: "0 18px" } }, "\u25CF")))), /* @__PURE__ */ React.createElement("style", null, `@keyframes dc-mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}`));
  const ProductExplain = () => {
    const features = [
      {
        icon: /* @__PURE__ */ React.createElement(Icons.Ring, { size: 22 }),
        title: "Clear kit options",
        body: "Choose the level that suits your setup, from a printed ring only through to a full system with the PC included."
      },
      {
        icon: /* @__PURE__ */ React.createElement(Icons.Box, { size: 22 }),
        title: "Matched components",
        body: "The ring, lighting, cameras, and full-system hardware are selected to work together for an AutoDarts-style setup."
      },
      {
        icon: /* @__PURE__ */ React.createElement(Icons.Bolt, { size: 22 }),
        title: "Setup guidance included",
        body: "Each kit includes guidance to help you understand what connects where and what needs to happen next."
      }
    ];
    return /* @__PURE__ */ React.createElement("section", { style: { padding: "140px 0 120px" } }, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 760, marginBottom: 80 } }, /* @__PURE__ */ React.createElement(Eyebrow, null, "AutoDarts setup made easier."), /* @__PURE__ */ React.createElement("h2", { style: {
      fontFamily: "var(--sans)",
      fontWeight: 700,
      fontSize: "clamp(34px, 4.6vw, 60px)",
      lineHeight: 1.05,
      letterSpacing: "-0.025em",
      margin: "18px 0 22px"
    } }, "Clear hardware kits for turning your dartboard into a smart scoring setup."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 17, lineHeight: 1.6, color: "var(--text-2)", maxWidth: 640 } }, "DartCraft gives you simple kit options depending on what you already have and how much setup you want to handle yourself. Choose the printed ring, add lighting and cameras, or go full system with the pre-configured mini PC included.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }, className: "dc-feat-grid" }, features.map((f, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 18,
      padding: "30px 28px",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      minHeight: 280
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 48,
      height: 48,
      borderRadius: 12,
      background: "rgba(124,92,255,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--accent)"
    } }, f.icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 600, fontSize: 20, lineHeight: 1.2, marginBottom: 10, letterSpacing: "-0.01em" } }, f.title), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-2)", fontSize: 15, lineHeight: 1.55 } }, f.body)), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" } }, "0", i + 1, "/03"))))), /* @__PURE__ */ React.createElement("style", null, `
        @media (max-width: 880px){.dc-feat-grid{grid-template-columns:1fr !important}}
      `));
  };
  const HowItWorks = () => {
    const steps = [
      { n: "01", t: "Assemble ring & install LED lighting", d: "Slot the printed ring sections together and fit the LED strip into the integrated channel for clean, even diffused lighting." },
      { n: "02", t: "Mount the ring", d: "Position the assembled ring around your dartboard area so the three camera mounts sit evenly around the board, following the digital setup guide." },
      { n: "03", t: "Connect to the pre-configured PC", d: "Plug the three cameras into the included mini PC \u2014 already configured to recognise the kit on first boot. Connect the LED lighting to a power point. You'll need a monitor connected at this stage to complete initial setup and calibration." },
      { n: "04", t: "Set up your AutoDarts account", d: "Sign up to AutoDarts on the mini PC and claim your board to link it to your account." },
      { n: "05", t: "Calibrate and play", d: "Run the AutoDarts calibration routine to align the cameras with your board, then throw your first leg." }
    ];
    const [active, setActive] = useState(0);
    const [progress, setProgress] = useState(0);
    const sectionRef = useRef(null);
    const N = steps.length;
    useEffect(() => {
      const onScroll = () => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrolled = -rect.top;
        const total = el.offsetHeight - vh;
        const t = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));
        setProgress(t);
        const idx = Math.min(N - 1, Math.max(0, Math.floor(t * N - 1e-4)));
        setActive(idx < 0 ? 0 : idx);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [N]);
    return /* @__PURE__ */ React.createElement("section", { id: "how", ref: sectionRef, style: {
      position: "relative",
      // Sized so each step gets ~0.7 viewports of scroll — short enough that
      // step 1 appears immediately on entry, long enough that each step has a
      // distinct "moment" before the next replaces it.
      height: `calc(${N * 0.7 + 0.3} * 100vh)`,
      borderTop: "1px solid var(--border-2)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "sticky",
      top: 0,
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }, className: "dc-how-stage" }, /* @__PURE__ */ React.createElement(Container, { style: { paddingTop: "clamp(110px, 14vh, 160px)", paddingBottom: 16 }, className: "dc-how-header" }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 880 } }, /* @__PURE__ */ React.createElement(Eyebrow, null, "How the setup works"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(28px, 3.4vw, 44px)", lineHeight: 1.04, letterSpacing: "-0.025em", margin: "12px 0 16px" } }, "Five steps from box to first leg.")), /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden", maxWidth: 880 } }, /* @__PURE__ */ React.createElement("div", { style: {
      height: "100%",
      width: `${progress * 100}%`,
      borderRadius: 99,
      background: "linear-gradient(90deg, var(--accent), #a78bfa)",
      boxShadow: "0 0 12px 2px rgba(124,92,255,0.7)",
      transition: "width .1s linear"
    } }))), /* @__PURE__ */ React.createElement(Container, { style: { flex: 1, display: "flex", alignItems: "center", paddingBottom: "clamp(40px, 6vh, 80px)" }, className: "dc-how-content" }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", width: "100%" }, className: "dc-how-grid" }, /* @__PURE__ */ React.createElement("div", { className: "dc-how-text", style: { position: "relative", height: 260, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
      transform: `translateY(${-active * 260}px)`,
      transition: "transform .55s cubic-bezier(.22,.61,.36,1)"
    } }, steps.map((s, i) => {
      const isActive = active === i;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: {
        height: 260,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: 28,
        borderLeft: `2px solid ${isActive ? "var(--accent)" : "var(--border-2)"}`,
        opacity: isActive ? 1 : 0.28,
        transition: "opacity .4s ease, border-color .4s ease"
      } }, /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(24px, 2.6vw, 34px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 14px" } }, s.t), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 16, lineHeight: 1.55, color: "var(--text-2)", margin: 0, maxWidth: 480 } }, s.d));
    }))), /* @__PURE__ */ React.createElement("div", { className: "dc-how-visual" }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, padding: 32, position: "relative", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "dc-how-img", style: { width: "100%", height: "55vw", maxHeight: 460, minHeight: 180, overflow: "hidden", borderRadius: 10, position: "relative" } }, /* @__PURE__ */ React.createElement(Visuals.StepVisual, { step: active })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-2)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em" } }, "STEP ", steps[active].n, " / 0", N))))))), /* @__PURE__ */ React.createElement("style", null, `
        @media (max-width: 980px){
          .dc-how-grid{grid-template-columns:1fr !important; gap:12px !important}
          .dc-how-text{min-height:auto !important; height:260px !important; order:2}
          .dc-how-visual{width:100%; max-width:420px; margin:0 auto; order:1; flex-shrink:0}
          .dc-how-visual > div{padding:20px !important}
          .dc-how-img{height:220px !important; min-height:unset !important}
          .dc-how-header{padding-top:105px !important; padding-bottom:6px !important}
          .dc-how-header h2{font-size:22px !important; margin-top:8px !important}
          .dc-how-content{align-items:flex-start !important; padding-top:10px !important; padding-bottom:20px !important}
        }
      `));
  };
  const PACKAGES = [
    {
      id: "ring-only",
      name: "DartCraft Ring with Camera Mounts",
      price: 150,
      badge: null,
      bestFor: "Tech-savvy DIY users who already have cameras, lighting, and a computer.",
      includes: ["Custom 3D-printed ring", "Integrated camera mounts", "Designed for standard dartboard setups"],
      excludes: ["LED lighting", "Cameras", "PC", "Keyboard or mouse", "Speaker", "Dartboard"],
      cta: "Select ring only"
    },
    {
      id: "ring-led",
      name: "DartCraft Ring + LED Lighting",
      price: 199,
      badge: null,
      bestFor: "Users who want the printed ring and clean lighting handled.",
      includes: ["Printed ring with camera mounts", "LED strip lighting"],
      excludes: ["Cameras", "PC", "Keyboard or mouse", "Speaker", "Dartboard"],
      cta: "Select ring + lighting"
    },
    {
      id: "ring-led-cameras",
      name: "DartCraft Ring + LED + Cameras",
      price: 299,
      badge: "Most popular",
      bestFor: "Users who already have a spare computer and can configure AutoDarts themselves.",
      includes: ["Printed ring with camera mounts", "LED lighting", "Cameras for AutoDarts tracking"],
      excludes: ["PC", "Keyboard or mouse", "Speaker", "Dartboard"],
      cta: "Select camera kit"
    },
    {
      id: "full-system",
      name: "Full AutoDarts System",
      price: 599,
      badge: "Easiest setup",
      bestFor: "Users who want the easiest setup option with the least technical work.",
      includes: ["Printed ring with camera mounts", "LED lighting", "Cameras", "Mini PC pre-configured for AutoDarts", "Wireless keyboard with touchpad", "Speaker", "Digital setup guide"],
      excludes: ["Dartboard", "Monitor / display", "In-home installation"],
      cta: "Select full system"
    }
  ];
  window.PACKAGES = PACKAGES;
  function packageStockLabel(qty) {
    if (qty <= 0) return "Sold out";
    if (qty <= 2) return `${qty} left`;
    if (qty <= 5) return "Low stock";
    return "In stock";
  }
  const StockPill = ({ state }) => {
    const map = {
      "In stock": { bg: "rgba(34,197,94,0.12)", c: "#22C55E" },
      "Low stock": { bg: "rgba(245,158,11,0.12)", c: "#F59E0B" },
      "Sold out": { bg: "rgba(239,68,68,0.12)", c: "#ef4444" }
    };
    const isLeftLabel = typeof state === "string" && state.endsWith(" left");
    const s = isLeftLabel ? map["Low stock"] : map[state] || map["In stock"];
    return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--mono)", letterSpacing: "0.05em", textTransform: "uppercase", color: s.c, background: s.bg, padding: "4px 10px", borderRadius: 99 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, background: s.c, borderRadius: 99 } }), state);
  };
  window.StockPill = StockPill;
  const Packages = ({ onSelect, dbPrices = {} }) => {
    const [stockQty, setStockQty] = useState({});
    useEffect(() => {
      fetch("/api/stock").then((r) => r.json()).then(setStockQty).catch(() => {
      });
    }, []);
    return /* @__PURE__ */ React.createElement("section", { id: "kits", style: { padding: "140px 0 120px", borderTop: "1px solid var(--border-2)" } }, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "flex-end", marginBottom: 60 }, className: "dc-pkg-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Eyebrow, null, "Start simple or go all in"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(34px, 4.6vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.025em", margin: "18px 0 0" } }, "Choose the kit that matches your setup.")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 17, lineHeight: 1.6, color: "var(--text-2)", margin: 0 } }, "Already have cameras and a computer? Start with the printed ring. Want the easiest path? Choose the full system with cameras, lighting, mini PC, keyboard, speaker, and digital setup guide.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }, className: "dc-pkg-grid" }, PACKAGES.map((p, i) => {
      const isEasiest = p.badge === "Easiest setup";
      const isMostPopular = p.badge === "Most popular";
      const borderColor = isEasiest ? "rgba(0,212,200,0.5)" : isMostPopular ? "rgba(124,92,255,0.4)" : "var(--border)";
      const badgeBg = isEasiest ? "#00d4c8" : "var(--accent)";
      return /* @__PURE__ */ React.createElement("div", { key: p.id, style: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "var(--card)",
        border: `1px solid ${borderColor}`,
        borderRadius: 18,
        padding: "26px 22px",
        minHeight: 540
      } }, p.badge && /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        top: -10,
        left: 18,
        background: badgeBg,
        color: "#0a0b10",
        padding: "5px 11px",
        borderRadius: 99,
        fontFamily: "var(--sans)",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      } }, isEasiest && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12 } }, "\u2726"), p.badge), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 8 } }, "0", i + 1), /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 21, lineHeight: 1.15, letterSpacing: "-0.015em", margin: "0 0 14px", minHeight: "2.4em" } }, p.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 38, letterSpacing: "-0.02em" } }, "$", dbPrices[p.id] ?? p.price), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-3)", fontSize: 13 } }, "AUD")), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, typeof stockQty[p.id] === "number" && /* @__PURE__ */ React.createElement(StockPill, { state: packageStockLabel(stockQty[p.id]) })), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, lineHeight: 1.5, color: "var(--text-2)", margin: "0 0 18px", minHeight: "4.5em" } }, p.bestFor), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, paddingTop: 14, borderTop: "1px solid var(--border-2)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 } }, "INCLUDES"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 7 } }, p.includes.map((it) => /* @__PURE__ */ React.createElement("li", { key: it, style: { display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "var(--text)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", marginTop: 2, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(Icons.Check, { size: 14 })), it))), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 } }, "NOT INCLUDED"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6 } }, p.excludes.map((it) => /* @__PURE__ */ React.createElement("li", { key: it, style: { display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "var(--text-3)" } }, /* @__PURE__ */ React.createElement("span", { style: { marginTop: 2, flexShrink: 0, opacity: 0.5 } }, /* @__PURE__ */ React.createElement(Icons.Minus, { size: 14 })), it)))), /* @__PURE__ */ React.createElement("button", { onClick: () => onSelect(p.id), style: {
        marginTop: "auto",
        padding: "13px 18px",
        borderRadius: 99,
        background: isEasiest ? "#00d4c8" : isMostPopular ? "var(--accent)" : "#F5F5F0",
        color: "#0a0b10",
        border: "none",
        fontFamily: "var(--sans)",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      } }, p.cta, " ", /* @__PURE__ */ React.createElement(Icons.Arrow, { size: 14 })));
    }))), /* @__PURE__ */ React.createElement("style", null, `
        @media (max-width: 1100px){.dc-pkg-grid{grid-template-columns: repeat(2, 1fr) !important}}
        @media (max-width: 600px){.dc-pkg-grid{grid-template-columns: 1fr !important} .dc-pkg-head{grid-template-columns: 1fr !important}}
      `));
  };
  const FullSystemCallout = ({ onSelect, dbPrices = {} }) => {
    const fullPrice = dbPrices["full-system"] ?? 599;
    return /* @__PURE__ */ React.createElement("section", { style: { padding: "80px 0", position: "relative" } }, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: {
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(135deg, #15131f 0%, #0a0b10 100%)",
      border: "1px solid var(--border)",
      borderRadius: 24,
      padding: "56px 56px",
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: 48,
      alignItems: "center"
    }, className: "dc-full-grid" }, /* @__PURE__ */ React.createElement("div", { "aria-hidden": true, style: { position: "absolute", right: "-10%", top: "-30%", width: "50%", aspectRatio: "1/1", background: "radial-gradient(circle, rgba(124,92,255,0.25) 0%, transparent 60%)", filter: "blur(40px)" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(Eyebrow, null, "Easiest setup"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(28px, 3.6vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "14px 0 18px" } }, "Want the least technical setup? Choose the full system."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 16, lineHeight: 1.6, color: "var(--text-2)", maxWidth: 520, margin: "0 0 28px" } }, "The full system includes the printed ring, LED lighting, cameras, and a mini PC already prepared to run AutoDarts. You still need to mount the hardware, connect everything, and complete final calibration, but the most technical sourcing and setup work is reduced."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 30 } }, ["Pre-configured mini PC", "Wireless keyboard with touchpad", "Speaker included", "Digital setup guide"].map((t) => /* @__PURE__ */ React.createElement("div", { key: t, style: { display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "var(--text)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", marginTop: 2 } }, /* @__PURE__ */ React.createElement(Icons.Check, { size: 14 })), t))), /* @__PURE__ */ React.createElement(PillButton, { primary: true, onClick: () => onSelect("full-system") }, "Build full system order ", /* @__PURE__ */ React.createElement(Icons.Arrow, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
      background: "#0a0b10",
      border: "1px solid var(--border)",
      borderRadius: 18,
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 14
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" } }, "FULL SYSTEM \xB7 IN THE BOX"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 18 } }, "$", fullPrice)), [
      { i: /* @__PURE__ */ React.createElement(Icons.Ring, { size: 18 }), t: "Printed ring + camera mounts" },
      { i: /* @__PURE__ */ React.createElement(Icons.LED, { size: 18 }), t: "LED strip lighting" },
      { i: /* @__PURE__ */ React.createElement(Icons.Cam, { size: 18 }), t: "Cameras for tracking" },
      { i: /* @__PURE__ */ React.createElement(Icons.Chip, { size: 18 }), t: "Mini PC, pre-configured" },
      { i: /* @__PURE__ */ React.createElement(Icons.Box, { size: 18 }), t: "Keyboard, speaker, digital guide" }
    ].map((r, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "#15171c", border: "1px solid var(--border-2)", borderRadius: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--accent)" } }, r.i), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontFamily: "var(--sans)", fontWeight: 500 } }, r.t))))))), /* @__PURE__ */ React.createElement("style", null, `
      @media (max-width: 880px){
        .dc-full-grid{grid-template-columns:1fr !important; padding:36px 28px !important; gap:28px !important}
      }
    `));
  };
  const KIT_PHOTOS = [
    {
      src: "assets/gallery-1-camera-mount.webp",
      label: "Camera Mount",
      alt: "DartCraft 3D-printed camera mount bracket integrated into AutoDarts camera ring",
      caption: "Precision-printed camera mount bracket integrated into the ring. Holds the camera at the correct angle for accurate dart tracking."
    },
    {
      src: "assets/gallery-2-ring-segments.webp",
      label: "Ring segments",
      alt: "DartCraft AutoDarts camera ring printed segments assembled around a dartboard",
      caption: "The ring ships as printed segments that screw together. Camera come preinstalled."
    },
    {
      src: "assets/gallery-3-mount-foot.webp",
      label: "Mount foot",
      alt: "Low-profile mount foot for DartCraft AutoDarts ring with screw covers",
      caption: "Low-profile mount foot sits flush against the surface including covers to hide visible screws."
    },
    {
      src: "assets/gallery-4-cabinet-front.webp",
      label: "Setup Example",
      alt: "DartCraft AutoDarts hardware kit mounted to a dartboard cabinet \u2014 example setup",
      caption: "Example setup mounted to backing. Dartboard, and surroundings not included or supplied by DartCraft."
    },
    {
      src: "assets/gallery-5-wall-mount-angle.webp",
      label: "Ring \u2014 side profile",
      alt: "Side profile of DartCraft AutoDarts camera ring mounted to dartboard \u2014 low-profile design",
      caption: "Low-profile design sits flush against the board. Minimal obstruction to gameplay."
    },
    {
      src: "assets/gallery-6-wall-mount.webp",
      label: "Setup Example",
      alt: "DartCraft AutoDarts system wall mount installation example \u2014 camera ring and LED lighting",
      caption: "Example wall mount install. Dartboard and surroundings not included or supplied by DartCraft."
    }
  ];
  const KitPhotos = () => /* @__PURE__ */ React.createElement("section", { style: { padding: "100px 0 80px", borderTop: "1px solid var(--border-2)" } }, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 52 } }, /* @__PURE__ */ React.createElement(Eyebrow, null, "Real builds"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(28px, 3.8vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.025em", margin: "16px 0 12px" } }, "See the kit up close"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 16, lineHeight: 1.6, color: "var(--text-2)", maxWidth: 600, margin: 0 } }, "Real photos of DartCraft parts, assembled rings, and example installs so you can see how the system comes together before ordering.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }, className: "dc-photos-grid" }, KIT_PHOTOS.map((photo, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "dc-photo-frame", style: { position: "relative", border: "1px solid var(--border)", borderRadius: "14px 14px 0 0", overflow: "hidden" } }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: photo.src,
      alt: photo.alt || photo.label,
      loading: "lazy",
      style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "rgba(10,11,16,0.75)",
    backdropFilter: "blur(6px)",
    padding: "4px 10px",
    borderRadius: 99,
    fontFamily: "var(--mono)",
    fontSize: 10,
    letterSpacing: "0.06em",
    color: "var(--text-2)",
    textTransform: "uppercase"
  } }, photo.label)), /* @__PURE__ */ React.createElement("div", { style: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border)",
    borderTop: "none",
    borderRadius: "0 0 14px 14px",
    padding: "12px 16px"
  } }, /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-3)", fontStyle: "italic" } }, photo.caption))))), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 24, fontSize: 13, lineHeight: 1.6, color: "var(--text-3)", fontStyle: "italic" } }, "Example installs may show dartboards or surrounding setups for demonstration only. Check each kit option for exactly what is included.")), /* @__PURE__ */ React.createElement("style", null, `
      .dc-photo-frame { width: 100%; aspect-ratio: 4/3; }
      @media (max-width: 900px) { .dc-photos-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      @media (max-width: 560px) { .dc-photos-grid { grid-template-columns: 1fr !important; } }
    `));
  const Shipping = () => /* @__PURE__ */ React.createElement("section", { style: { padding: "100px 0", borderTop: "1px solid var(--border-2)" } }, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }, className: "dc-ship-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Eyebrow, null, "Shipping & availability"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "18px 0 18px" } }, "Ships from Australia."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 16, lineHeight: 1.6, color: "var(--text-2)", margin: "0 0 24px", maxWidth: 480 } }, "DartCraft kits ship from Australia, making them a faster and easier option for Australian AutoDarts users compared with ordering from overseas. We currently ship within Australia only."), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 } }, ["Australian-based stock", "Faster local shipping for Australian customers", "Orders ship once payment has been received", "Tracking provided when available", "Stock is limited \u2014 if a kit is unavailable, more units may be built and restocked"].map((t) => /* @__PURE__ */ React.createElement("li", { key: t, style: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", marginTop: 3 } }, /* @__PURE__ */ React.createElement(Icons.Check, { size: 14 })), t)))), /* @__PURE__ */ React.createElement("div", { className: "dc-ship-map-card", style: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    aspectRatio: "4/4",
    background: "#0a0b10",
    border: "1px solid var(--border)",
    padding: 32,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  } }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 400 360", width: "100%", height: "100%", style: { position: "absolute", inset: 0 } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "aug", cx: "50%", cy: "50%", r: "65%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#1a1530", stopOpacity: "0.6" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#050607", stopOpacity: "0" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "auline", x1: "0", y1: "0", x2: "1", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#9B7AFF", stopOpacity: "0.9" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#5B8AFF", stopOpacity: "0.6" }))), /* @__PURE__ */ React.createElement("rect", { width: "400", height: "360", fill: "url(#aug)" }), /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "\n              M 41 250\n              Q 54 257 66 256\n              Q 83 252 100 245\n              Q 113 244 124 245\n              Q 148 237 170 227\n              Q 188 224 201 228\n              Q 219 231 237 232\n              Q 241 244 244 256\n              Q 241 261 239 261\n              Q 251 272 263 282\n              Q 267 285 270 287\n              Q 284 285 298 285\n              Q 306 292 311 295\n              Q 319 287 327 282\n              Q 334 280 341 279\n              Q 347 261 352 245\n              Q 355 241 357 237\n              Q 363 222 368 211\n              Q 371 201 373 195\n              Q 371 188 368 185\n              Q 367 175 362 160\n              Q 350 149 335 124\n              Q 326 113 314 107\n              Q 306 90 303 77\n              L 303 26\n              Q 283 27 264 40\n              L 252 90\n              Q 239 90 226 90\n              L 226 43\n              Q 202 38 177 43\n              Q 162 57 153 71\n              Q 128 83 115 88\n              Q 107 92 103 94\n              Q 85 106 72 117\n              Q 62 119 55 120\n              Q 42 126 34 131\n              Q 30 146 30 160\n              Q 26 165 25 171\n              Q 32 184 37 197\n              Q 44 213 47 227\n              Q 44 234 42 241\n              Q 41 246 41 250 Z",
      fill: "rgba(124,92,255,0.07)",
      stroke: "url(#auline)",
      strokeWidth: "1.5",
      strokeLinejoin: "round"
    }
  ), /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "M 295 308 Q 311 304 327 311 Q 332 324 323 337 Q 311 343 300 337 Q 291 325 295 317 Q 294 312 295 308 Z",
      fill: "rgba(124,92,255,0.07)",
      stroke: "url(#auline)",
      strokeWidth: "1.5"
    }
  ), /* @__PURE__ */ React.createElement("g", { transform: "translate(49 226)" }, /* @__PURE__ */ React.createElement("circle", { r: "22", fill: "rgba(124,92,255,0.10)" }), /* @__PURE__ */ React.createElement("circle", { r: "11", fill: "rgba(124,92,255,0.28)" }), /* @__PURE__ */ React.createElement("circle", { r: "4.5", fill: "#7C5CFF" })), /* @__PURE__ */ React.createElement("circle", { cx: "352", cy: "245", r: "3", fill: "#7C5CFF", opacity: "0.7" }), /* @__PURE__ */ React.createElement("circle", { cx: "298", cy: "283", r: "3", fill: "#7C5CFF", opacity: "0.7" }), /* @__PURE__ */ React.createElement("circle", { cx: "368", cy: "185", r: "3", fill: "#7C5CFF", opacity: "0.7" }), /* @__PURE__ */ React.createElement("circle", { cx: "244", cy: "255", r: "3", fill: "#7C5CFF", opacity: "0.7" }), /* @__PURE__ */ React.createElement("circle", { cx: "177", cy: "43", r: "3", fill: "#7C5CFF", opacity: "0.7" }), /* @__PURE__ */ React.createElement("circle", { cx: "318", cy: "330", r: "3", fill: "#7C5CFF", opacity: "0.7" }), /* @__PURE__ */ React.createElement("path", { d: "M49 226 Q200 210 352 245", fill: "none", stroke: "#7C5CFF", strokeDasharray: "3 6", strokeWidth: "1", opacity: "0.45" }), /* @__PURE__ */ React.createElement("path", { d: "M49 226 Q175 290 298 283", fill: "none", stroke: "#7C5CFF", strokeDasharray: "3 6", strokeWidth: "1", opacity: "0.45" }), /* @__PURE__ */ React.createElement("path", { d: "M49 226 Q210 170 368 185", fill: "none", stroke: "#7C5CFF", strokeDasharray: "3 6", strokeWidth: "1", opacity: "0.45" }), /* @__PURE__ */ React.createElement("path", { d: "M49 226 Q145 240 244 255", fill: "none", stroke: "#7C5CFF", strokeDasharray: "3 6", strokeWidth: "1", opacity: "0.45" }), /* @__PURE__ */ React.createElement("path", { d: "M49 226 Q110 120 177 43", fill: "none", stroke: "#7C5CFF", strokeDasharray: "3 6", strokeWidth: "1", opacity: "0.45" }), /* @__PURE__ */ React.createElement("path", { d: "M49 226 Q185 310 318 330", fill: "none", stroke: "#7C5CFF", strokeDasharray: "3 6", strokeWidth: "1", opacity: "0.45" }), /* @__PURE__ */ React.createElement("path", { d: "M49 226 Q180 130 306 86", fill: "none", stroke: "#7C5CFF", strokeDasharray: "3 6", strokeWidth: "1", opacity: "0.45" }), /* @__PURE__ */ React.createElement("circle", { cx: "306", cy: "86", r: "3", fill: "#7C5CFF", opacity: "0.7" })), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" } }, "SHIPS WITHIN"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.08em" } }, "AU ONLY")), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 48, letterSpacing: "-0.02em" } }, "Australia"), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-2)", fontSize: 13, marginTop: 4 } }, "NSW \xB7 VIC \xB7 QLD \xB7 WA \xB7 SA \xB7 TAS \xB7 ACT \xB7 NT"))))), /* @__PURE__ */ React.createElement("style", null, `
      @media (max-width: 880px){
        .dc-ship-grid{grid-template-columns:1fr !important; gap:32px !important}
        .dc-ship-map-card{display:none !important}
      }
    `));
  const FAQ = () => {
    const faqs = [
      { q: "What is AutoDarts?", a: "AutoDarts is a smart dart scoring system that uses cameras and software to detect where darts land and keep score automatically." },
      { q: "Is this a complete dartboard setup?", a: "No. These kits are designed to upgrade your existing dartboard setup. The dartboard itself is not included unless specifically stated." },
      { q: "Do I need to install it myself?", a: "Yes. DIY installation is required. The ring needs to be mounted to your dartboard area, and the system may require adjustment and calibration." },
      { q: "Do I need a computer?", a: "Yes, AutoDarts requires a computer to run. The full system includes a pre-configured mini PC. Other options require you to supply and configure your own computer." },
      { q: "What is included in the full system?", a: "The full system includes the printed ring, LED lighting, cameras, pre-configured mini PC, wireless keyboard with touchpad, speaker, and a digital setup guide sent with your order confirmation." },
      { q: "Does the full system include a monitor or display?", a: /* @__PURE__ */ React.createElement(React.Fragment, null, "No \u2014 a monitor or display is not included. Most setups use a monitor connected to the mini PC for the full experience, and there are lots of creative ways people mount displays near their board. For setup ideas and inspiration, the AutoDarts Discord community is a great resource: ", /* @__PURE__ */ React.createElement("a", { href: "https://discord.com/invite/autodarts", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--accent)", borderBottom: "1px solid currentColor" } }, "discord.com/invite/autodarts"), ". If mounting a monitor isn't practical, you can also control the system from a laptop or iPad through the AutoDarts website instead.") },
      { q: "Is support included?", a: "Basic setup guidance is included. If customers run into issues, they can reach out for help where possible. The AutoDarts community is also a useful support resource." },
      { q: "Where do the kits ship from?", a: "DartCraft kits ship from Perth, WA. We currently ship within Australia only." }
    ];
    const [open, setOpen] = useState(0);
    return /* @__PURE__ */ React.createElement("section", { id: "faq", style: { padding: "120px 0", borderTop: "1px solid var(--border-2)" } }, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 60, alignItems: "flex-start" }, className: "dc-faq-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Eyebrow, null, "Questions"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(34px, 4.4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.025em", margin: "18px 0 18px" } }, "Answers, before you order."), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-2)", fontSize: 15, lineHeight: 1.6, maxWidth: 340 } }, "Still unsure? Email ", /* @__PURE__ */ React.createElement("a", { href: "mailto:hello@dartcraft.com.au", style: { color: "var(--accent)", borderBottom: "1px solid currentColor" } }, "hello@dartcraft.com.au"), " and we'll come back to you.")), /* @__PURE__ */ React.createElement("div", null, faqs.map((f, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { borderTop: "1px solid var(--border-2)", borderBottom: i === faqs.length - 1 ? "1px solid var(--border-2)" : "none" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpen(open === i ? -1 : i), style: {
      width: "100%",
      textAlign: "left",
      background: "none",
      border: "none",
      color: "var(--text)",
      padding: "24px 0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
      cursor: "pointer",
      fontFamily: "var(--sans)",
      fontWeight: 600,
      fontSize: 18,
      letterSpacing: "-0.01em"
    } }, /* @__PURE__ */ React.createElement("span", null, f.q), /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0, transition: "transform .25s", transform: open === i ? "rotate(45deg)" : "rotate(0deg)", color: "var(--accent)" } }, /* @__PURE__ */ React.createElement(Icons.Plus, { size: 20 }))), /* @__PURE__ */ React.createElement("div", { style: {
      maxHeight: open === i ? 200 : 0,
      overflow: "hidden",
      transition: "max-height .3s ease",
      color: "var(--text-2)"
    } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, lineHeight: 1.65, margin: "0 0 24px", maxWidth: 560 } }, f.a))))))), /* @__PURE__ */ React.createElement("style", null, `@media (max-width: 880px){.dc-faq-grid{grid-template-columns:1fr !important; gap:24px !important}}`));
  };
  const Footer = () => /* @__PURE__ */ React.createElement("footer", { style: { padding: "80px 0 40px", borderTop: "1px solid var(--border-2)", background: "#08090c" } }, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 48, marginBottom: 60 }, className: "dc-foot-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 18 } }, /* @__PURE__ */ React.createElement("img", { src: "assets/dartcraft-logo.png", alt: "DartCraft", style: { height: 54, width: "auto", display: "block" } })), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, margin: "0 0 18px", maxWidth: 420 } }, "DartCraft sells AutoDarts-compatible hardware kits for DIY smart dartboard setups. Products ship from Australia. Dartboard and in-home installation are not included unless specifically stated."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", color: "var(--text-3)", fontSize: 13 } }, /* @__PURE__ */ React.createElement(Icons.Pin, { size: 14 }), " Australia \xB7 ships AU-wide")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 18, textTransform: "uppercase" } }, "Site"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 } }, [["How it works", "#how"], ["Kits", "#kits"], ["Order", "#order"], ["FAQ", "#faq"]].map(([l, h]) => /* @__PURE__ */ React.createElement("li", { key: h }, /* @__PURE__ */ React.createElement("a", { href: h, style: { color: "var(--text)", fontSize: 14, opacity: 0.85 } }, l))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 18, textTransform: "uppercase" } }, "Contact"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "mailto:hello@dartcraft.com.au", style: { fontSize: 14 } }, "hello@dartcraft.com.au")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/terms", style: { fontSize: 14, color: "var(--text)", opacity: 0.85 } }, "Terms of sale")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/privacy", style: { fontSize: 14, color: "var(--text)", opacity: 0.85 } }, "Privacy policy")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/submit-review", style: { fontSize: 14, color: "var(--text)", opacity: 0.85 } }, "Leave a review"))))), /* @__PURE__ */ React.createElement("div", { style: { paddingTop: 24, borderTop: "1px solid var(--border-2)", display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", color: "var(--text-3)", fontSize: 12 } }, /* @__PURE__ */ React.createElement("div", null, "\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " DartCraft. All rights reserved."), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 600, textAlign: "right" } }, "AutoDarts is a third-party platform. DartCraft sells compatible hardware kits and does not claim official affiliation unless stated."))), /* @__PURE__ */ React.createElement("style", null, `@media (max-width: 880px){.dc-foot-grid{grid-template-columns:1fr !important; gap:32px !important}}`));
  const PRODUCT_LABELS = {
    "ring-only": "DartCraft Ring with Camera Mounts",
    "ring-led": "DartCraft Ring + LED Lighting",
    "ring-led-cameras": "DartCraft Ring + LED + Cameras",
    "full-system": "Full AutoDarts System"
  };
  const StarRating = ({ rating }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 3 } }, [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ React.createElement("span", { key: i, style: { fontSize: 15, color: i <= rating ? "#f59e0b" : "rgba(255,255,255,0.12)" } }, i <= rating ? "\u2605" : "\u2606")));
  const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [lightbox, setLightbox] = useState(null);
    useEffect(() => {
      fetch("/api/reviews").then((r) => r.json()).then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoaded(true);
      }).catch(() => setLoaded(true));
    }, []);
    useEffect(() => {
      if (!lightbox) return;
      const onKey = (e) => {
        if (e.key === "Escape") setLightbox(null);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [lightbox]);
    if (!loaded || !reviews.length) return null;
    return /* @__PURE__ */ React.createElement("section", { style: { padding: "100px 0", borderTop: "1px solid var(--border-2)" } }, lightbox && /* @__PURE__ */ React.createElement("div", { onClick: () => setLightbox(null), style: {
      position: "fixed",
      inset: 0,
      zIndex: 1e3,
      background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      cursor: "zoom-out"
    } }, /* @__PURE__ */ React.createElement("img", { src: lightbox, alt: "", style: {
      maxWidth: "90vw",
      maxHeight: "88vh",
      borderRadius: 14,
      boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      objectFit: "contain"
    } }), /* @__PURE__ */ React.createElement("button", { onClick: () => setLightbox(null), style: {
      position: "fixed",
      top: 20,
      right: 24,
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.15)",
      color: "#fff",
      borderRadius: 99,
      width: 38,
      height: 38,
      fontSize: 18,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, "\u2715")), /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 52 } }, /* @__PURE__ */ React.createElement(Eyebrow, null, "Customer reviews"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.07, letterSpacing: "-0.025em", margin: "18px 0 0", maxWidth: 540 } }, "What our customers say.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }, className: "dc-reviews-grid" }, reviews.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.id, style: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 18,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    } }, r.photo_url ? /* @__PURE__ */ React.createElement("div", { onClick: () => setLightbox(r.photo_url), style: {
      width: "100%",
      height: 200,
      overflow: "hidden",
      cursor: "zoom-in",
      flexShrink: 0,
      position: "relative"
    } }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: r.photo_url,
        alt: "",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          transition: "transform 0.3s ease"
        },
        onMouseEnter: (e) => e.currentTarget.style.transform = "scale(1.04)",
        onMouseLeave: (e) => e.currentTarget.style.transform = "scale(1)"
      }
    ), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      bottom: 8,
      right: 8,
      background: "rgba(0,0,0,0.55)",
      borderRadius: 6,
      padding: "3px 7px",
      fontFamily: "var(--mono)",
      fontSize: 10,
      color: "rgba(255,255,255,0.7)",
      letterSpacing: "0.06em",
      backdropFilter: "blur(4px)"
    } }, "tap to enlarge")) : /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      height: 200,
      flexShrink: 0,
      background: "#0e0f14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement("img", { src: "/assets/dartcraft-logo.png", alt: "DartCraft", style: {
      height: 52,
      width: "auto",
      opacity: 0.25
    } })), /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 26px", display: "flex", flexDirection: "column", gap: 14, flex: 1 } }, /* @__PURE__ */ React.createElement(StarRating, { rating: r.rating }), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, color: "var(--text-2)", lineHeight: 1.65, margin: 0, flex: 1 } }, '"', r.review, '"'), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--border-2)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14 } }, r.name), r.product_id && PRODUCT_LABELS[r.product_id] && /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" } }, PRODUCT_LABELS[r.product_id]), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 } }, r.display_date && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" } }, r.display_date), r.verified_purchase && /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--mono)",
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 99,
      color: "#22c55e",
      border: "1px solid rgba(34,197,94,0.3)",
      background: "rgba(34,197,94,0.08)",
      letterSpacing: "0.06em"
    } }, "Verified purchase")))))))));
  };
  window.Sections = { Header, Hero, Marquee, ProductExplain, HowItWorks, Packages, FullSystemCallout, KitPhotos, Reviews, Shipping, FAQ, Footer, PillButton, Container, Eyebrow };
})();
