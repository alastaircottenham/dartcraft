(() => {
  const { useState, useEffect, useRef } = React;
  const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
  const Field = ({ label, error, children, hint, span = 1 }) => /* @__PURE__ */ React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 8, gridColumn: `span ${span}` } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--sans)", fontWeight: 500, fontSize: 13, color: "var(--text-2)" } }, label), children, hint && !error && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--text-3)" } }, hint), error && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#ef4444" } }, error));
  const inputStyle = (err) => ({
    background: "#0a0b10",
    border: `1px solid ${err ? "#ef4444" : "var(--border)"}`,
    borderRadius: 12,
    padding: "13px 16px",
    color: "var(--text)",
    fontSize: 15,
    fontFamily: "var(--body)",
    width: "100%",
    outline: "none",
    transition: "border .15s"
  });
  function stockLabel(qty) {
    if (qty <= 0) return { text: "Sold out", color: "#ef4444" };
    if (qty <= 2) return { text: `${qty} left`, color: "#f59e0b" };
    if (qty <= 5) return { text: "Low stock", color: "#f59e0b" };
    return { text: "In stock", color: "#22c55e" };
  }
  const NotifyForm = ({ packageId, packageName }) => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const submit = async (e) => {
      e.preventDefault();
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        setErrorMsg("Enter a valid email address");
        return;
      }
      setStatus("loading");
      setErrorMsg("");
      try {
        const res = await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), packageId })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setStatus("success");
        } else {
          setErrorMsg(data.error || "Something went wrong.");
          setStatus("error");
        }
      } catch {
        setErrorMsg("Something went wrong.");
        setStatus("error");
      }
    };
    if (status === "success") {
      return /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 22px 16px", fontSize: 13, color: "#22c55e", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", null, "\u2713"), " We'll email you when ", packageName, " is back in stock.");
    }
    return /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 22px 16px" } }, /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 8px", fontSize: 12, color: "var(--text-3)", fontFamily: "var(--mono)", letterSpacing: "0.04em", textTransform: "uppercase" } }, "Notify me when available"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        placeholder: "your@email.com",
        value: email,
        onChange: (e) => {
          setEmail(e.target.value);
          setErrorMsg("");
          setStatus("idle");
        },
        onKeyDown: (e) => e.key === "Enter" && submit(e),
        style: {
          flex: 1,
          minWidth: 160,
          background: "#0a0b10",
          border: `1px solid ${errorMsg ? "#ef4444" : "var(--border)"}`,
          borderRadius: 10,
          padding: "9px 14px",
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "var(--body)",
          outline: "none"
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: submit,
        disabled: status === "loading",
        style: {
          padding: "9px 18px",
          background: "var(--accent)",
          color: "#0a0b10",
          border: "none",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          fontFamily: "var(--sans)",
          flexShrink: 0,
          opacity: status === "loading" ? 0.7 : 1
        }
      },
      status === "loading" ? "..." : "Notify me"
    )), errorMsg && /* @__PURE__ */ React.createElement("p", { style: { margin: "6px 0 0", fontSize: 12, color: "#ef4444" } }, errorMsg));
  };
  const Spinner = () => /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(10,11,16,0.3)",
    borderTopColor: "#0a0b10",
    borderRadius: "50%",
    animation: "dc-spin 0.6s linear infinite"
  } });
  const SHIPPING_AUD = 19.95;
  const OrderBuilder = ({ selectedId, onSelect, dbPrices = {} }) => {
    const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      street: "",
      suburb: "",
      state: "",
      postcode: "",
      notes: "",
      diy: false,
      terms: false
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");
    const [stockQty, setStockQty] = useState({});
    const [promoInput, setPromoInput] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [promoStatus, setPromoStatus] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const streetRef = useRef(null);
    const acRef = useRef(null);
    useEffect(() => {
      let active = true;
      const attach = () => {
        if (!streetRef.current || !window.google?.maps?.places) return;
        if (acRef.current) return;
        const ac = new window.google.maps.places.Autocomplete(streetRef.current, {
          componentRestrictions: { country: "au" },
          fields: ["address_components"],
          types: ["address"]
        });
        acRef.current = ac;
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place.address_components) return;
          let num = "", route = "", suburb = "", state = "", postcode = "";
          for (const c of place.address_components) {
            const t = c.types[0];
            if (t === "street_number") num = c.long_name;
            else if (t === "route") route = c.long_name;
            else if (t === "locality") suburb = c.long_name;
            else if (t === "administrative_area_level_1") state = c.short_name;
            else if (t === "postal_code") postcode = c.long_name;
          }
          if (num || route) setForm((f) => ({ ...f, street: `${num} ${route}`.trim() }));
          if (suburb) setForm((f) => ({ ...f, suburb }));
          if (state && AU_STATES.includes(state)) setForm((f) => ({ ...f, state }));
          if (postcode) setForm((f) => ({ ...f, postcode }));
          setErrors((prev) => ({ ...prev, street: void 0, suburb: void 0, state: void 0, postcode: void 0 }));
        });
      };
      const load = async () => {
        if (window.google?.maps?.places) {
          attach();
          return;
        }
        try {
          const { googleMapsApiKey } = await fetch("/api/config").then((r) => r.json());
          if (!googleMapsApiKey || !active) return;
          window.__dcMapsInit = () => {
            if (active) attach();
          };
          const s = document.createElement("script");
          s.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=__dcMapsInit`;
          s.async = true;
          document.head.appendChild(s);
        } catch {
        }
      };
      load();
      return () => {
        active = false;
      };
    }, []);
    useEffect(() => {
      fetch("/api/stock").then((r) => r.json()).then((data) => {
        setStockQty(data);
        onSelect((cur) => {
          if (cur !== null) return cur;
          const preferred = "ring-led-cameras";
          if (typeof data[preferred] === "number" && data[preferred] > 0) return preferred;
          const first = PACKAGES.find((p) => typeof data[p.id] === "number" && data[p.id] > 0);
          return first ? first.id : null;
        });
      }).catch(() => {
      });
    }, []);
    useEffect(() => {
      setPromoInput("");
      setPromoCode("");
      setPromoStatus(null);
    }, [selectedId]);
    const pkg = PACKAGES.find((p) => p.id === selectedId) ?? null;
    const pkgPrice = pkg ? dbPrices[pkg.id] ?? pkg.price : 0;
    const freeShipping = promoStatus?.valid && promoStatus?.freeShipping;
    const shippingAud = freeShipping ? 0 : SHIPPING_AUD;
    const discountAud = promoStatus?.valid && promoStatus.discountCents && !freeShipping ? promoStatus.discountCents / 100 : 0;
    const total = pkgPrice + shippingAud - discountAud;
    const currentStock = pkg ? stockQty[pkg.id] : void 0;
    const isSoldOut = typeof currentStock === "number" && currentStock <= 0;
    const applyPromo = async () => {
      const code = promoInput.trim().toUpperCase();
      if (!code) return;
      setPromoLoading(true);
      setPromoStatus(null);
      setPromoCode("");
      try {
        const res = await fetch("/api/validate-promo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, packageId: pkg.id })
        });
        const data = await res.json();
        if (data.valid) {
          setPromoCode(code);
          setPromoStatus(data);
        } else setPromoStatus({ valid: false });
      } catch {
        setPromoStatus({ valid: false });
      } finally {
        setPromoLoading(false);
      }
    };
    const validate = () => {
      const e = {};
      if (!form.name.trim()) e.name = "Required";
      if (!form.email.trim()) e.email = "Required";
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
      if (!form.phone.trim()) e.phone = "Required";
      if (!form.street.trim()) e.street = "Required";
      if (!form.suburb.trim()) e.suburb = "Required";
      if (!form.state) e.state = "Required";
      if (!form.postcode.trim()) e.postcode = "Required";
      else if (!/^\d{4}$/.test(form.postcode.trim())) e.postcode = "4-digit postcode";
      if (!form.diy) e.diy = "Please acknowledge";
      if (!form.terms) e.terms = "Please acknowledge";
      return e;
    };
    const update = (k, v) => {
      setForm((f) => ({ ...f, [k]: v }));
      if (errors[k]) setErrors((prev) => ({ ...prev, [k]: void 0 }));
    };
    const submit = async (e) => {
      e.preventDefault();
      setApiError("");
      const errs = validate();
      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }
      if (!selectedId) {
        setApiError("Please select a package.");
        return;
      }
      if (isSoldOut) {
        setApiError("This package is currently out of stock.");
        return;
      }
      setSubmitting(true);
      try {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: pkg.id,
            name: form.name,
            email: form.email,
            phone: form.phone,
            street: form.street,
            suburb: form.suburb,
            state: form.state,
            postcode: form.postcode,
            notes: form.notes,
            promoCode: promoCode || void 0
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setApiError(data.error || "Something went wrong. Please try again.");
          setSubmitting(false);
          return;
        }
        window.location.href = data.url;
      } catch {
        setApiError("Network error. Please check your connection and try again.");
        setSubmitting(false);
      }
    };
    return /* @__PURE__ */ React.createElement("section", { id: "order", style: { padding: "140px 0 120px", borderTop: "1px solid var(--border-2)", background: "linear-gradient(180deg, transparent 0%, #07080b 100%)" } }, /* @__PURE__ */ React.createElement(Sections.Container, null, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 760, marginBottom: 50 } }, /* @__PURE__ */ React.createElement(Sections.Eyebrow, null, "Order builder"), /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(34px, 4.6vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.025em", margin: "18px 0 18px" } }, "Build your DartCraft kit."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 17, lineHeight: 1.6, color: "var(--text-2)", maxWidth: 560 } }, "Choose the package that suits your setup. Full payment is required at checkout. Orders will be shipped once payment is received.")), /* @__PURE__ */ React.createElement("form", { onSubmit: submit, style: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, alignItems: "flex-start" }, className: "dc-order-grid" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28 } }, /* @__PURE__ */ React.createElement(SectionHead, { num: "01", title: "Choose your kit" }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, PACKAGES.map((p) => {
      const qty = stockQty[p.id];
      const soldOut = typeof qty === "number" && qty <= 0;
      const sl = typeof qty === "number" ? stockLabel(qty) : null;
      const isSelected = selectedId === p.id;
      return /* @__PURE__ */ React.createElement("div", { key: p.id, style: { border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, borderRadius: 14, overflow: "hidden", transition: "border-color .15s" } }, /* @__PURE__ */ React.createElement("label", { style: {
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 18,
        padding: "20px 22px",
        cursor: soldOut ? "not-allowed" : "pointer",
        background: isSelected ? "rgba(124,92,255,0.06)" : "#0a0b10",
        opacity: soldOut ? 0.5 : 1,
        transition: "all .15s"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 22,
        height: 22,
        borderRadius: 99,
        border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      } }, isSelected && /* @__PURE__ */ React.createElement("div", { style: { width: 10, height: 10, borderRadius: 99, background: "var(--accent)" } })), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "radio",
          name: "pkg",
          value: p.id,
          checked: isSelected,
          onChange: () => !soldOut && onSelect(p.id),
          style: { display: "none" },
          disabled: soldOut
        }
      ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--sans)", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" } }, p.name), p.badge && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase", background: "var(--accent)", color: "#0a0b10", padding: "2px 7px", borderRadius: 99, fontWeight: 600 } }, p.badge), sl && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: sl.color, padding: "2px 7px", borderRadius: 99, border: `1px solid ${sl.color}`, fontWeight: 600 } }, sl.text)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-2)", lineHeight: 1.45 } }, p.bestFor)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em" } }, "$", dbPrices[p.id] ?? p.price), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-3)" } }, "AUD"))), soldOut && /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--border)", background: "#0a0b10" } }, /* @__PURE__ */ React.createElement(NotifyForm, { packageId: p.id, packageName: p.name })));
    }))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28 } }, /* @__PURE__ */ React.createElement(SectionHead, { num: "02", title: "Your details" }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }, className: "dc-details-grid" }, /* @__PURE__ */ React.createElement(Field, { label: "Full name", error: errors.name, span: 2 }, /* @__PURE__ */ React.createElement("input", { style: inputStyle(errors.name), value: form.name, onChange: (e) => update("name", e.target.value), placeholder: "Jane Smith" })), /* @__PURE__ */ React.createElement(Field, { label: "Email", error: errors.email }, /* @__PURE__ */ React.createElement("input", { type: "email", style: inputStyle(errors.email), value: form.email, onChange: (e) => update("email", e.target.value), placeholder: "jane@example.com" })), /* @__PURE__ */ React.createElement(Field, { label: "Phone", error: errors.phone }, /* @__PURE__ */ React.createElement("input", { style: inputStyle(errors.phone), value: form.phone, onChange: (e) => update("phone", e.target.value), placeholder: "0400 000 000" })))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28 } }, /* @__PURE__ */ React.createElement(SectionHead, { num: "03", title: "Shipping address", tag: "Australia only" }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 18 }, className: "dc-ship-fields" }, /* @__PURE__ */ React.createElement(Field, { label: "Street address", error: errors.street, span: 3, hint: "Start typing to search and auto-fill your address" }, /* @__PURE__ */ React.createElement("input", { ref: streetRef, style: inputStyle(errors.street), value: form.street, onChange: (e) => update("street", e.target.value), placeholder: "42 Wallaby Way", autoComplete: "off" })), /* @__PURE__ */ React.createElement(Field, { label: "Suburb", error: errors.suburb, span: 2 }, /* @__PURE__ */ React.createElement("input", { style: inputStyle(errors.suburb), value: form.suburb, onChange: (e) => update("suburb", e.target.value), placeholder: "Sydney" })), /* @__PURE__ */ React.createElement(Field, { label: "Postcode", error: errors.postcode }, /* @__PURE__ */ React.createElement("input", { style: inputStyle(errors.postcode), value: form.postcode, onChange: (e) => update("postcode", e.target.value), placeholder: "2000", maxLength: 4 })), /* @__PURE__ */ React.createElement(Field, { label: "State", error: errors.state }, /* @__PURE__ */ React.createElement(
      "select",
      {
        style: { ...inputStyle(errors.state), appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='none' stroke='%23A5ABB8' stroke-width='1.5' d='M1 1l5 5 5-5'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" },
        value: form.state,
        onChange: (e) => update("state", e.target.value)
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Select\u2026"),
      AU_STATES.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s))
    )), /* @__PURE__ */ React.createElement(Field, { label: "Country", span: 2 }, /* @__PURE__ */ React.createElement("input", { style: { ...inputStyle(false), background: "#06070a", color: "var(--text-2)" }, value: "Australia", disabled: true })))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28 } }, /* @__PURE__ */ React.createElement(SectionHead, { num: "04", title: "Notes (optional)" }), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        style: { ...inputStyle(false), minHeight: 100, resize: "vertical", fontFamily: "var(--body)" },
        placeholder: "Anything else we should know? Delivery instructions, preferred contact details, or other order notes...",
        value: form.notes,
        onChange: (e) => update("notes", e.target.value)
      }
    ))), /* @__PURE__ */ React.createElement("aside", { style: { position: "sticky", top: 100 }, className: "dc-order-aside" }, /* @__PURE__ */ React.createElement("div", { style: {
      background: "linear-gradient(180deg, #15131f 0%, #0a0b10 100%)",
      border: "1px solid var(--border)",
      borderRadius: 18,
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 22
    } }, pkg ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 } }, "Your order"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.015em", lineHeight: 1.2 } }, pkg.name), pkg.badge && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase", background: "var(--accent)", color: "#0a0b10", padding: "3px 8px", borderRadius: 99, fontWeight: 600 } }, pkg.badge))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--border-2)", paddingTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 10 } }, "INCLUDED"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 } }, pkg.includes.map((it) => /* @__PURE__ */ React.createElement("li", { key: it, style: { display: "flex", gap: 8, fontSize: 13, color: "var(--text)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)", flexShrink: 0, marginTop: 2 } }, /* @__PURE__ */ React.createElement(Icons.Check, { size: 13 })), it)))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--border-2)", paddingTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 10 } }, "NOT INCLUDED"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 } }, pkg.excludes.map((it) => /* @__PURE__ */ React.createElement("li", { key: it, style: { display: "flex", gap: 8, fontSize: 12, color: "var(--text-3)" } }, /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0, marginTop: 2, opacity: 0.5 } }, /* @__PURE__ */ React.createElement(Icons.Minus, { size: 12 })), it))))) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0 24px", gap: 14, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 48, height: 48, borderRadius: 99, background: "rgba(124,92,255,0.1)", border: "1px solid rgba(124,92,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icons.Lock, { size: 20, style: { color: "rgba(124,92,255,0.6)" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 600, fontSize: 15, color: "var(--text-2)", marginBottom: 6 } }, "No package selected"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 } }, "Choose a kit on the left", /* @__PURE__ */ React.createElement("br", null), "to see pricing and checkout."))), pkg && /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--border-2)", paddingTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 10 } }, "PROMO CODE"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: promoInput,
        onChange: (e) => {
          setPromoInput(e.target.value.toUpperCase());
          setPromoStatus(null);
          setPromoCode("");
        },
        onKeyDown: (e) => e.key === "Enter" && applyPromo(),
        placeholder: "Enter code",
        style: { ...inputStyle(promoStatus?.valid === false), flex: 1, fontSize: 13, padding: "10px 14px", fontFamily: "var(--mono)", letterSpacing: "0.05em" }
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: applyPromo, disabled: promoLoading || !promoInput.trim(), style: {
      padding: "10px 16px",
      borderRadius: 12,
      border: "1px solid var(--border)",
      background: "rgba(255,255,255,0.05)",
      color: "var(--text)",
      fontFamily: "var(--sans)",
      fontWeight: 600,
      fontSize: 13,
      cursor: promoLoading || !promoInput.trim() ? "not-allowed" : "pointer",
      whiteSpace: "nowrap",
      opacity: promoLoading || !promoInput.trim() ? 0.45 : 1
    } }, promoLoading ? "\u2026" : "Apply")), promoStatus?.valid && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 7, fontSize: 12, color: "#22c55e" } }, "\u2713 ", promoStatus.discountDisplay, " applied"), promoStatus?.valid === false && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 7, fontSize: 12, color: "#ef4444" } }, "Invalid or expired code")), pkg && /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--border-2)", paddingTop: 18, display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(Row, { k: "Subtotal", v: `$${pkgPrice}.00` }), /* @__PURE__ */ React.createElement(Row, { k: "Shipping (AU)", v: freeShipping ? "$0.00" : "$19.95", discount: freeShipping }), freeShipping && /* @__PURE__ */ React.createElement(Row, { k: `Promo (${promoCode})`, v: "Free shipping", discount: true }), discountAud > 0 && /* @__PURE__ */ React.createElement(Row, { k: `Promo (${promoCode})`, v: `\u2212$${discountAud.toFixed(2)}`, discount: true }), /* @__PURE__ */ React.createElement(Row, { k: "GST", v: "Included", muted: true }), /* @__PURE__ */ React.createElement("div", { style: { height: 1, background: "var(--border-2)", margin: "6px 0" } }), /* @__PURE__ */ React.createElement(Row, { k: "Total", v: `$${total.toFixed(2)} AUD`, big: true })), selectedId && /* @__PURE__ */ React.createElement(React.Fragment, null, isSoldOut && /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: 13, color: "#ef4444" } }, "This package is currently out of stock. Please select another option."), apiError && /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: 13, color: "#ef4444" } }, apiError), /* @__PURE__ */ React.createElement("label", { style: { display: "flex", gap: 12, alignItems: "flex-start", padding: "14px", background: "rgba(245,158,11,0.06)", border: `1px solid ${errors.diy ? "#ef4444" : "rgba(245,158,11,0.2)"}`, borderRadius: 10, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: form.diy, onChange: (e) => update("diy", e.target.checked), style: {
      marginTop: 2,
      width: 18,
      height: 18,
      accentColor: "#7C5CFF",
      cursor: "pointer",
      flexShrink: 0
    } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, lineHeight: 1.5, color: "var(--text-2)" } }, "I understand this is a ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, "DIY install hardware kit"), ". Dartboard, monitor/display, and in-home installation are not included.")), errors.diy && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#ef4444", marginTop: -12, display: "block" } }, errors.diy), /* @__PURE__ */ React.createElement("label", { style: { display: "flex", gap: 12, alignItems: "flex-start", padding: "14px", background: "rgba(245,158,11,0.06)", border: `1px solid ${errors.terms ? "#ef4444" : "rgba(245,158,11,0.2)"}`, borderRadius: 10, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: form.terms, onChange: (e) => update("terms", e.target.checked), style: {
      marginTop: 2,
      width: 18,
      height: 18,
      accentColor: "#7C5CFF",
      cursor: "pointer",
      flexShrink: 0
    } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, lineHeight: 1.5, color: "var(--text-2)" } }, "I have read and agree to the", " ", /* @__PURE__ */ React.createElement("a", { href: "/terms", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--accent)", textDecoration: "underline" }, onClick: (e) => e.stopPropagation() }, "Terms of Sale"), ".")), errors.terms && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#ef4444", marginTop: -12, display: "block" } }, errors.terms), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: submitting || isSoldOut, style: {
      padding: "16px",
      borderRadius: 99,
      border: "none",
      cursor: submitting || isSoldOut ? "not-allowed" : "pointer",
      background: submitting || isSoldOut ? "rgba(245,245,240,0.35)" : "#F5F5F0",
      color: "#0a0b10",
      fontFamily: "var(--sans)",
      fontWeight: 700,
      fontSize: 15,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10
    } }, submitting ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Spinner, null), " Redirecting to Stripe\u2026") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icons.Lock, { size: 15 }), " Pay $", total.toFixed(2), " \u2014 Secure checkout")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--mono)", letterSpacing: "0.06em" } }, "FULL PAYMENT REQUIRED \xB7 STRIPE SECURED")))))), /* @__PURE__ */ React.createElement("style", null, `
        @keyframes dc-spin { to { transform: rotate(360deg); } }
        @media (max-width: 980px){
          .dc-order-grid{grid-template-columns:1fr !important}
          .dc-order-aside{position:relative !important; top:auto !important}
        }
        @media (max-width: 600px){
          .dc-ship-fields{grid-template-columns:1fr !important}
          .dc-ship-fields > label{grid-column: span 1 !important}
          .dc-details-grid{grid-template-columns:1fr !important}
          .dc-details-grid > label{grid-column: span 1 !important}
        }
        input::placeholder, textarea::placeholder { color: var(--text-3); }
        input:focus, select:focus, textarea:focus { border-color: var(--accent) !important; }
        .pac-container { background:#13141a; border:1px solid var(--border); border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.5); margin-top:4px; font-family:var(--body); }
        .pac-item { padding:10px 14px; color:var(--text-2); border-top:1px solid var(--border-2); cursor:pointer; font-size:14px; }
        .pac-item:first-child { border-top:none; }
        .pac-item:hover, .pac-item-selected { background:rgba(124,92,255,0.1); color:var(--text); }
        .pac-item-query { color:var(--text); font-size:14px; }
        .pac-matched { color:var(--accent); font-weight:600; }
        .pac-icon { display:none; }
      `));
  };
  const SectionHead = ({ num, title, tag }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "rgba(124,92,255,0.12)",
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--mono)",
    fontSize: 12,
    fontWeight: 600
  } }, num), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--sans)", fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em", flex: 1 } }, title), tag && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontFamily: "var(--mono)", letterSpacing: "0.06em", color: "var(--text-3)", textTransform: "uppercase" } }, tag));
  const Row = ({ k, v, big, muted, discount }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: big ? 15 : 13, color: big ? "var(--text)" : "var(--text-2)", fontFamily: big ? "var(--sans)" : "var(--body)", fontWeight: big ? 600 : 400 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: big ? 22 : 14, fontWeight: big ? 700 : 500, color: discount ? "#22c55e" : muted ? "var(--text-3)" : "var(--text)", fontFamily: "var(--sans)", letterSpacing: big ? "-0.02em" : "0" } }, v));
  window.OrderBuilder = OrderBuilder;
})();
