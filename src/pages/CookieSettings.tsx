import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Cookie, Shield, BarChart3, Settings as SettingsIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const CONSENT_KEY = "shortlink_cookie_consent";
const PREFERENCES_KEY = "shortlink_cookie_preferences";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieSettings() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
    marketing: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({
          ...parsed,
          necessary: true, // Ensure necessary is always true
        });
      } catch (error) {
        console.error("Failed to parse cookie preferences", error);
      }
    }
  }, []);

  const handleToggle = (category: keyof CookiePreferences) => {
    if (category === "necessary") return; // Cannot toggle necessary cookies

    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
    setHasChanges(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    localStorage.setItem(CONSENT_KEY, "customized");
    setHasChanges(false);
    toast.success("Cookie preferences saved successfully");
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allAccepted));
    localStorage.setItem(CONSENT_KEY, "accepted");
    setHasChanges(false);
    toast.success("All cookies accepted");
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(onlyNecessary));
    localStorage.setItem(CONSENT_KEY, "declined");
    setHasChanges(false);
    toast.success("Optional cookies rejected");
  };

  const cookieCategories = [
    {
      id: "necessary" as keyof CookiePreferences,
      title: "Necessary Cookies",
      icon: <Shield className="w-5 h-5" />,
      description: "These cookies are essential for the website to function properly. They enable core functionality such as security, authentication, and session management. These cookies cannot be disabled.",
      examples: ["Authentication tokens", "Session management", "Security settings", "CSRF protection"],
      required: true,
    },
    {
      id: "functional" as keyof CookiePreferences,
      title: "Functional Cookies",
      icon: <SettingsIcon className="w-5 h-5" />,
      description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.",
      examples: ["Theme preferences (dark/light mode)", "Language settings", "Layout preferences", "Remember login state"],
      required: false,
    },
    {
      id: "analytics" as keyof CookiePreferences,
      title: "Analytics Cookies",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: ["Page views and navigation patterns", "Feature usage statistics", "Performance metrics", "Error tracking"],
      required: false,
    },
    {
      id: "marketing" as keyof CookiePreferences,
      title: "Marketing Cookies",
      icon: <Cookie className="w-5 h-5" />,
      description: "These cookies are used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.",
      examples: ["Ad targeting", "Social media sharing", "Campaign tracking", "Conversion tracking"],
      required: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Cookie className="w-4 h-4" />
              <span className="text-sm font-medium">Privacy Control</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Settings</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Manage your cookie preferences and control how we use cookies to improve your experience.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAcceptAll} variant="default" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Accept All Cookies
              </Button>
              <Button onClick={handleRejectAll} variant="outline" className="gap-2">
                Reject Optional Cookies
              </Button>
              {hasChanges && (
                <Button onClick={handleSavePreferences} variant="default" className="gap-2">
                  Save Custom Preferences
                </Button>
              )}
            </div>
          </div>

          {/* Cookie Categories */}
          <div className="space-y-4">
            {cookieCategories.map((category) => (
              <div
                key={category.id}
                className="bg-card rounded-lg border border-border p-6 hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{category.title}</h3>
                        {category.required && (
                          <span className="text-xs text-muted-foreground">Always Active</span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>

                    {/* Examples */}
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary hover:underline mb-2">
                        View examples
                      </summary>
                      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                        {category.examples.map((example, index) => (
                          <li key={index}>{example}</li>
                        ))}
                      </ul>
                    </details>
                  </div>

                  {/* Toggle */}
                  <div className="flex-shrink-0">
                    <Switch
                      checked={preferences[category.id]}
                      onCheckedChange={() => handleToggle(category.id)}
                      disabled={category.required}
                      aria-label={`Toggle ${category.title}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">About Cookies</h3>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                Cookies are small text files that are placed on your device when you visit our website.
                They help us provide you with a better experience by remembering your preferences and
                understanding how you use our site.
              </p>
              <p>
                You can change your cookie preferences at any time by returning to this page. Please note
                that disabling certain cookies may affect your experience and some features may not work
                as expected.
              </p>
              <p>
                For more information about how we use cookies and protect your privacy, please read our{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </div>

          {/* Save Button (Bottom) */}
          {hasChanges && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleSavePreferences}
                size="lg"
                className="w-full sm:w-auto gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Save Preferences
              </Button>
            </div>
          )}

          {/* Browser Settings */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              You can also manage cookies through your browser settings.{" "}
              <a
                href="https://www.allaboutcookies.org/how-to-manage-cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn how to manage cookies in your browser
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
