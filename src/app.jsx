const { useState, useEffect, useCallback } = React;

const App = () => {
  const [selectedId, setSelectedId] = useState('ring-led-cameras');
  const [dbPrices, setDbPrices] = useState({});

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(setDbPrices)
      .catch(() => {});
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
        <Sections.BeforeYouOrder/>
        <OrderBuilder selectedId={selectedId} onSelect={setSelectedId} dbPrices={dbPrices}/>
        <Sections.Shipping/>
        <Sections.FAQ/>
      </main>
      <Sections.Footer/>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
