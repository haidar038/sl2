import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, QrCode, Trash2, BarChart3, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateQRCode, downloadQRCode } from "@/lib/qrCode";
import { format } from "date-fns";

interface Url {
  id: string;
  slug: string;
  target_url: string;
  title: string | null;
  description: string | null;
  is_public: boolean;
  click_count: number;
  created_at: string;
  deleted_at: string | null;
  expiry_at: string | null;
}

interface UrlCardProps {
  url: Url;
  onUpdate?: () => void;
}

export const UrlCard = ({ url, onUpdate }: UrlCardProps) => {
  const [loading, setLoading] = useState(false);
  const shortUrl = `${window.location.origin}/s/${url.slug}`;
  const isDeleted = !!url.deleted_at;
  const isExpired = url.expiry_at && new Date(url.expiry_at) < new Date();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this URL?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('soft_delete_url', { url_id: url.id });
      if (error) throw error;
      toast.success("URL deleted successfully. You can restore it within 30 days.");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete URL");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('restore_url', { url_id: url.id });
      if (error) throw error;
      toast.success("URL restored successfully!");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to restore URL");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const qrDataUrl = await generateQRCode(shortUrl);
      downloadQRCode(qrDataUrl, url.slug);
      toast.success("QR code downloaded!");
    } catch (error) {
      toast.error("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`p-6 ${isDeleted || isExpired ? 'opacity-60' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate">
                {url.title || url.slug}
              </h3>
              {isDeleted && (
                <span className="px-2 py-1 text-xs rounded-full bg-destructive/10 text-destructive">
                  Deleted
                </span>
              )}
              {isExpired && (
                <span className="px-2 py-1 text-xs rounded-full bg-warning/10 text-warning">
                  Expired
                </span>
              )}
              {!url.is_public && (
                <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                  Private
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm mb-2">
              <code className="px-2 py-1 bg-muted rounded text-primary font-mono">
                {shortUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-7 px-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground truncate mb-2">
              → {url.target_url}
            </p>

            {url.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {url.description}
              </p>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-1">
              <BarChart3 className="w-5 h-5" />
              {url.click_count}
            </div>
            <p className="text-xs text-muted-foreground">clicks</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Created {format(new Date(url.created_at), 'MMM d, yyyy')}
          </p>

          <div className="flex items-center gap-2">
            {isDeleted ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRestore}
                disabled={loading}
                className="gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Restore
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateQR}
                  disabled={loading}
                >
                  <QrCode className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(shortUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
