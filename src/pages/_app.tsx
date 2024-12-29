//import { AnalysisProvider } from '../context/AnalysisContext';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

/*function MyApp({ Component, pageProps }) {
  return (
    <AnalysisProvider>
      <Component {...pageProps} />
    </AnalysisProvider>
  );
}*/

export default MyApp; 