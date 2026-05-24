const { useState, useEffect, useCallback } = React;

const App = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [dbPrices, setDbPrices] = useState({});

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(setDbPrices)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
    return () => clearTimeout(t);
  }, []);

  const onSelect = useCallback((id) => {
    setSelectedId(id);
    setTimeout(()=>{
      const el = document.getElementById('order');
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }, 50);
  }, []);

  return (
    <>
      <Sections.Header/>
      <main>
        <Sections.Hero/>
        <Sections.Marquee/>
        <Sections.ProductExplain/>
        <Sections.HowItWorks/>
        <Sections.Packages onSelect={onSelect} dbPrices={dbPrices}/>
        <Sections.FullSystemCallout onSelect={onSelect} dbPrices={dbPrices}/>
        <Sections.KitPhotos/>
        <Sections.Reviews/>
        <OrderBuilder selectedId={selectedId} onSelect={setSelectedId} dbPrices={dbPrices}/>
        <Sections.Shipping/>
        <Sections.FAQ/>
      </main>
      <Sections.Footer/>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
