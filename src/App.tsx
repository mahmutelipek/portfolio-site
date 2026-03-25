import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { supabase } from './lib/supabase';
import { Home } from './pages/Home';
import { ProjectDetail } from './pages/ProjectDetail';
import { Admin } from './pages/Admin';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Extend window for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const [gaId, setGaId] = useState<string | null>(null);

  const lenis = useLenis();

  // Fetch GA ID and Initialize
  useEffect(() => {
    const fetchGA = async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'google_analytics_id').single();
      if (data?.value) {
        setGaId(data.value);
        
        // Inject Tag Manager Script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${data.value}`;
        script.async = true;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', data.value);
      }
    };
    fetchGA();
  }, []);

  // Track Page Views on Route Change
  useEffect(() => {
    if (window.gtag && gaId) {
      window.gtag('config', gaId, {
        page_path: location.pathname,
        page_title: document.title
      });
    }
  }, [location.pathname, gaId]);

  // Force scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [location.pathname, lenis]);

  // Disable browser's native scroll restoration behavior
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/works/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ReactLenis>
  );
}

export default App;
