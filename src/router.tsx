import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DesignerSignup from './components/DesignerSignup';
import App from './App';

// Create router configuration
export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />
    },
    {
        path: '/login',
        element: <LoginPage onLogin={() => { }} onSuperAdminLogin={() => { }} isOnline={true} />
    },
    {
        path: '/cadastro',
        element: <DesignerSignup />
    },
    {
        path: '/app',
        element: <App />
    },
    {
        path: '/:slug',
        element: <App /> // Will handle designer slug routing
    }
]);
