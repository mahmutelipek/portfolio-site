import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import { Home } from './pages/Home';
import { ProjectDetail } from './pages/ProjectDetail';
import { Admin } from './pages/Admin';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  // Force scroll to top on route change or hard refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
    <ReactLenis root>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ReactLenis>
  );
}

export default App;
