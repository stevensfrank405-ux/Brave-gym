import React, { useEffect, Component } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { GymProvider, useGym } from "./context/GymContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Error Boundary to prevent blank screen crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0D0D0D',
          color: '#F5F5F3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#f59e0b' }}>
            ⚠️ Something Went Wrong
          </h1>
          <p style={{ marginBottom: '1rem', opacity: 0.7 }}>
            The application encountered an unexpected error.
          </p>
          <pre style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '1rem',
            borderRadius: '0.5rem',
            maxWidth: '600px',
            width: '100%',
            overflow: 'auto',
            fontSize: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              background: '#f59e0b',
              color: '#000',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Public Pages
import Home from "./pages/public/Home";
import Programs from "./pages/public/Programs";
import Trainers from "./pages/public/Trainers";
import Pricing from "./pages/public/Pricing";
import Gallery from "./pages/public/Gallery";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Authenticated Pages
import UserDashboard from "./pages/dashboard/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Guard for Admin
function AdminRouteGuard({ children }) {
  const { currentUser } = useGym();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Protected Route Guard for Member
function MemberRouteGuard({ children }) {
  const { currentUser } = useGym();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  // Admins only use the dedicated /admin panel
  if (currentUser.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function LayoutContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-[#F5F5F3]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Portal Routes */}
          <Route
            path="/dashboard"
            element={
              <MemberRouteGuard>
                <UserDashboard />
              </MemberRouteGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <AdminDashboard />
              </AdminRouteGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* Hide the massive public marketing footer on the admin workstation */}
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <GymProvider>
        <BrowserRouter>
          <ScrollToTop />
          <LayoutContent />
        </BrowserRouter>
      </GymProvider>
    </ErrorBoundary>
  );
}
