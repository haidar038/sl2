import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { GuestUrlMigrationModal } from "@/components/GuestUrlMigrationModal";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Sitemap from "./pages/Sitemap";
import Accessibility from "./pages/Accessibility";
import CookieSettings from "./pages/CookieSettings";
import NotFound from "./pages/NotFound";
import { SlugRouteGuard } from "./components/SlugRouteGuard";

const queryClient = new QueryClient();

// Initialize theme on app load
const initializeTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
    } else {
        // Default to system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
            document.documentElement.classList.add("dark");
        }
    }
};

const AppContent = () => {
    useEffect(() => {
        initializeTheme();
    }, []);

    return (
        <>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Static routes - these MUST match before dynamic routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="auth" element={<Auth />} />
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="terms" element={<Terms />} />
                        <Route path="sitemap" element={<Sitemap />} />
                        <Route path="accessibility" element={<Accessibility />} />
                        <Route path="cookies" element={<CookieSettings />} />
                        <Route
                            path="dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                        {/* Dynamic route for short URLs */}
                        <Route path=":slug" element={<SlugRouteGuard />} />
                        {/* Catch-all 404 route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <CookieConsent />
                    <GuestUrlMigrationModal />
                </AuthProvider>
            </BrowserRouter>
        </>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AppContent />
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
