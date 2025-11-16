import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  getOrCreateGuestSessionId,
  addGuestUrl,
  isRateLimited,
  incrementRateLimit,
  getRemainingUrlQuota,
  getTimeUntilReset,
} from "@/lib/guestSession";
import { generateSlug, sanitizeUrl } from "@/lib/slugGenerator";
import { generateQRCode, downloadQRCode } from "@/lib/qrCode";

export function DemoUrlShortener() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    slug: string;
    shortUrl: string;
    qrCode: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Check rate limit
    if (isRateLimited()) {
      const hoursUntilReset = Math.ceil(getTimeUntilReset());
      toast.error(
        `Rate limit reached. Try again in ${hoursUntilReset} hour${hoursUntilReset > 1 ? "s" : ""} or sign up for unlimited access.`
      );
      return;
    }

    setLoading(true);

    try {
      // Sanitize URL
      let sanitized: string;
      try {
        sanitized = sanitizeUrl(url);
      } catch (error) {
        toast.error("Invalid URL. Only http:// and https:// URLs are allowed.");
        setLoading(false);
        return;
      }

      // Generate slug
      let slug = generateSlug();

      // Get or create guest session ID
      const sessionId = getOrCreateGuestSessionId();

      // Calculate expiry (7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      // Check if slug exists (collision handling)
      const { data: existingUrl } = await supabase
        .from("urls")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();

      // If slug exists, regenerate (rare collision)
      if (existingUrl) {
        slug = generateSlug(8); // Use longer slug for retry
      }

      // Create URL in database
      const { data, error } = await supabase
        .from("urls")
        .insert({
          slug,
          target_url: sanitized,
          title: `Demo Link - ${slug}`,
          is_public: true,
          is_guest: true,
          guest_session_id: sessionId,
          guest_created_at: new Date().toISOString(),
          expiry_at: expiryDate.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating guest URL:", error);
        toast.error("Failed to create short link. Please try again.");
        return;
      }

      // Generate QR code
      const shortUrl = `${window.location.origin}/${slug}`;
      const qrCode = await generateQRCode(shortUrl);

      // Store in localStorage
      addGuestUrl({
        slug,
        targetUrl: sanitized,
        createdAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString(),
      });

      // Increment rate limit
      incrementRateLimit();

      // Set result
      setResult({
        slug,
        shortUrl,
        qrCode,
      });

      // Reset form
      setUrl("");

      toast.success("Short link created! Sign up to keep it forever.");
    } catch (error) {
      console.error("Error in demo URL creation:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownloadQR = () => {
    if (!result) return;
    downloadQRCode(result.qrCode, `qr-${result.slug}.png`);
  };

  const remainingQuota = getRemainingUrlQuota();
  const isLimited = isRateLimited();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Demo Badge */}
      <div className="flex items-center justify-center gap-2">
        <Badge variant="secondary" className="px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Try Without Signing Up
        </Badge>
      </div>

      {/* Main Form */}
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-primary/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-3">
            <label htmlFor="demo-url" className="text-sm font-medium">
              Paste your long URL here
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="demo-url"
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-12 text-base"
                  disabled={loading || isLimited}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading || isLimited || !url.trim()}
                className="px-8"
              >
                {loading ? "Creating..." : "Shorten"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>

          {/* Rate Limit Info */}
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-muted-foreground">
              {isLimited ? (
                <span className="text-orange-500 font-medium">
                  Rate limit reached. Please sign up for unlimited access.
                </span>
              ) : (
                <>
                  <span className="font-medium">{remainingQuota}</span> demo
                  link{remainingQuota !== 1 ? "s" : ""} remaining.
                  <span className="ml-1">Demo links expire in 7 days.</span>
                  <Link
                    to="/auth"
                    className="ml-1 text-primary hover:underline font-medium"
                  >
                    Sign up for unlimited access
                  </Link>
                </>
              )}
            </div>
          </div>
        </form>
      </Card>

      {/* Result Display */}
      {result && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 animate-in slide-in-from-bottom duration-500">
          <div className="space-y-4">
            {/* Success Header */}
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <h3 className="font-semibold">Your short link is ready!</h3>
            </div>

            {/* Short URL Display */}
            <div className="flex items-center gap-2 p-4 bg-card rounded-lg border border-border">
              <Input
                readOnly
                value={result.shortUrl}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-lg font-medium"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>

            {/* CTA to Sign Up */}
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">
                    Love it? Sign up to keep this link forever!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get custom aliases, detailed analytics, and unlimited links
                  </p>
                </div>
              </div>
              <Link to="/auth">
                <Button className="whitespace-nowrap">
                  Sign Up Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
