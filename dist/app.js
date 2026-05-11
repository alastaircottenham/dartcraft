(() => {
  const { useState, useEffect, useCallback } = React;
  const App = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [dbPrices, setDbPrices] = useState({});
    useEffect(() => {
      fetch("/api/packages").then((r) => r.json()).then(setDbPrices).catch(() => {
      });
    }, []);
    const onSelect = useCallback((id) => {
      setSelectedId(id);
      setTimeout(() => {
        const el = document.getElementById("order");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }, []);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Sections.Header, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(Sections.Hero, null), /* @__PURE__ */ React.createElement(Sections.Marquee, null), /* @__PURE__ */ React.createElement(Sections.ProductExplain, null), /* @__PURE__ */ React.createElement(Sections.HowItWorks, null), /* @__PURE__ */ React.createElement(Sections.Packages, { onSelect, dbPrices }), /* @__PURE__ */ React.createElement(Sections.FullSystemCallout, { onSelect, dbPrices }), /* @__PURE__ */ React.createElement(Sections.KitPhotos, null), /* @__PURE__ */ React.createElement(Sections.Reviews, null), /* @__PURE__ */ React.createElement(OrderBuilder, { selectedId, onSelect: setSelectedId, dbPrices }), /* @__PURE__ */ React.createElement(Sections.Shipping, null), /* @__PURE__ */ React.createElement(Sections.FAQ, null)), /* @__PURE__ */ React.createElement(Sections.Footer, null));
  };
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
