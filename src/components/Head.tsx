export const Head = () => {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {/* Fonts */}
      <link rel="preconnect" href="https://static.parastorage.com" />
      {/* Font preloads */}
      <link rel="preload" href="/fonts/leaguespartan/v15/kJEqBuEW6A0lliaV_m88ja5TwvZwLZmXD4Zh.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      {/* Ensure page is visible */}
      <style>{`
        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          display: block;
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </>
  );
};
