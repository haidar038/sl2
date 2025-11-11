import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="text-center p-8">
          <h1 className="text-8xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">404</h1>
          <p className="text-2xl font-semibold mb-2">Oops! Page not found</p>
          <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Button asChild size="lg" className="gap-2">
            <a href="/">
              <Home className="w-4 h-4" />
              Return to Home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
