import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { Home } from './pages/Home';
import { ProjectDetail } from './pages/ProjectDetail';
import { Admin } from './pages/Admin';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  const lenis = useLenis();

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
