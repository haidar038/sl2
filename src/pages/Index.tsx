import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  Link as LinkIcon, 
  BarChart3, 
  QrCode, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Edge-powered redirects with global CDN for instant performance"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Detailed Analytics",
      description: "Track clicks, referrers, devices, and geographic data in real-time"
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "QR Codes",
      description: "Generate and download QR codes for all your short URLs instantly"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Enterprise-grade security with URL validation and abuse prevention"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Custom Aliases",
      description: "Create branded, memorable short links with custom slugs"
    },
    {
      icon: <LinkIcon className="w-6 h-6" />,
      title: "API Access",
      description: "Full REST API with authentication for automation and integrations"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "<50ms", label: "Avg Response" },
    { value: "Unlimited", label: "URLs" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Edge Computing</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            URL Shortener
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Built for Speed
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create, manage, and track short URLs with enterprise-grade analytics.
            Perfect for marketing campaigns, social media, and branded links.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" variant="hero" className="text-lg px-8 py-6 gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-16 border-t border-border">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to manage links
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features for individuals and teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground mb-4 transition-shadow duration-200 group-hover:shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up for free with email or magic link authentication. No credit card required."
              },
              {
                step: "02",
                title: "Shorten Your URLs",
                description: "Paste your long URL, customize the alias, and generate a short link instantly."
              },
              {
                step: "03",
                title: "Track & Optimize",
                description: "Monitor clicks, analyze traffic sources, and optimize your marketing campaigns."
              }
            ].map((step, index) => (
              <div
                key={index}
                className="group flex gap-6 items-start p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg transition-shadow duration-200 group-hover:shadow-md">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-12 text-center shadow-lg">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-primary-foreground mb-4">
                Ready to get started?
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-8">
                Join thousands of users who trust ShortLink for their link management
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 gap-2">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">ShortLink</span>
              </div>

              <div className="text-center md:text-right text-sm text-muted-foreground">
                <p>© 2025 ShortLink. Built with ❤️ for the web.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
