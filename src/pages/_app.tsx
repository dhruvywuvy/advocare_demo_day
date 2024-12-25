import { AnalysisProvider } from '../context/AnalysisContext';

function MyApp({ Component, pageProps }) {
  return (
    <AnalysisProvider>
      <Component {...pageProps} />
    </AnalysisProvider>
  );
}

export default MyApp; 