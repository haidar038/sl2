import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "shortlink_cookie_consent";
const CONSENT_TIMESTAMP = "shortlink_consent_timestamp";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    localStorage.setItem(CONSENT_TIMESTAMP, new Date().toISOString());
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    localStorage.setItem(CONSENT_TIMESTAMP, new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto max-w-6xl">
        <div className="relative bg-card border border-border rounded-lg shadow-2xl p-6 backdrop-blur-sm">
          {/* Close button */}
          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pr-8">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cookie className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Cookie Consent</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies and similar technologies to enhance your browsing experience,
                analyze site traffic, and provide essential functionality. This includes
                analytics to help us understand how you use ShortLink and improve our service.
                {" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Learn more about our privacy practices
                </Link>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="w-full sm:w-auto"
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                className="w-full sm:w-auto"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export helper functions for checking consent status
export const getCookieConsent = (): "accepted" | "declined" | null => {
  const consent = localStorage.getItem(CONSENT_KEY);
  return consent as "accepted" | "declined" | null;
};

export const hasCookieConsent = (): boolean => {
  return localStorage.getItem(CONSENT_KEY) !== null;
};

export const resetCookieConsent = (): void => {
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(CONSENT_TIMESTAMP);
};
