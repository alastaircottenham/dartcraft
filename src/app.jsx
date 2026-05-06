const { useState, useCallback } = React;

const App = () => {
  const [selectedId, setSelectedId] = useState('ring-led-cameras');

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
        <Sections.Packages onSelect={onSelect}/>
        <Sections.FullSystemCallout onSelect={onSelect}/>
        <Sections.BeforeYouOrder/>
        <OrderBuilder selectedId={selectedId} onSelect={setSelectedId}/>
        <Sections.Shipping/>
        <Sections.FAQ/>
      </main>
      <Sections.Footer/>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
