import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DesignerSignup from './components/DesignerSignup';
import AppContent from './AppContent'; // Will be the current App.tsx renamed

const AppRouter = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <Routes>
            {/* Landing Page - Main route */}
            <Route path="/" element={<LandingPage />} />

            {/* Login Page */}
            <Route path="/login" element={<LoginPage onLogin={() => { }} onSuperAdminLogin={() => { }} isOnline={true} />} />

            {/* Signup Page */}
            <Route path="/cadastro" element={<DesignerSignup />} />

            {/* App Content - Dashboard and booking */}
            <Route path="/app/*" element={<AppContent />} />

            {/* Designer Slug Route - for client booking */}
            <Route path="/:slug" element={<DesignerSlugHandler />} />
        </Routes>
    );
};

// Handler for designer slug routes
const DesignerSlugHandler = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Save slug to localStorage and redirect to app
        if (slug) {
            localStorage.setItem('designerSlug', slug);
            navigate('/app');
        }
    }, [slug, navigate]);

    return null;
};

export default AppRouter;
