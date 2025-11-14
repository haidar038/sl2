import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Map, Link as LinkIcon, Shield, FileText, Settings, User, BarChart3 } from "lucide-react";

export default function Sitemap() {
  const sitemapSections = [
    {
      title: "Main Pages",
      icon: <Map className="w-5 h-5" />,
      links: [
        { path: "/", label: "Home", description: "Landing page and product overview" },
        { path: "/auth", label: "Sign In / Sign Up", description: "Authentication and account creation" },
        { path: "/dashboard", label: "Dashboard", description: "Manage your shortened URLs" },
      ]
    },
    {
      title: "Account & Settings",
      icon: <User className="w-5 h-5" />,
      links: [
        { path: "/profile", label: "Profile", description: "View and edit your profile information" },
        { path: "/settings", label: "Settings", description: "Account settings and preferences" },
      ]
    },
    {
      title: "Legal & Policies",
      icon: <Shield className="w-5 h-5" />,
      links: [
        { path: "/privacy", label: "Privacy Policy", description: "How we handle your data" },
        { path: "/terms", label: "Terms of Service", description: "Terms and conditions of use" },
        { path: "/cookies", label: "Cookie Settings", description: "Manage your cookie preferences" },
      ]
    },
    {
      title: "Help & Support",
      icon: <FileText className="w-5 h-5" />,
      links: [
        { path: "/accessibility", label: "Accessibility", description: "Our commitment to accessibility" },
        { path: "/sitemap", label: "Sitemap", description: "Complete site navigation (current page)" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Map className="w-4 h-4" />
              <span className="text-sm font-medium">Site Navigation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sitemap</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Quick access to all pages and features of ShortLink. Navigate to any section of our site from here.
            </p>
          </div>

          {/* Sitemap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sitemapSections.map((section, index) => (
              <div
                key={index}
                className="bg-card rounded-lg border border-border p-6 hover:border-primary/30 transition-all duration-200"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>

                {/* Links */}
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.path}
                        className="block p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <LinkIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {link.label}
                            </div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {link.description}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  If you can't find what you're looking for, please don't hesitate to contact us. We're here to help!
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Contact Support
                  </a>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors text-sm font-medium"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* XML Sitemap Note */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Looking for the XML sitemap for search engines?{" "}
              <a href="/sitemap.xml" className="text-primary hover:underline">
                Click here
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
