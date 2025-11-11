import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateQRCode, downloadQRCode, type QRCodeFormat } from "@/lib/qrCode";
import { toast } from "sonner";

interface QRCodeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  filename: string;
}

export const QRCodeDetailModal = ({ open, onOpenChange, url, filename }: QRCodeDetailModalProps) => {
  const [qrCodePNG, setQrCodePNG] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<QRCodeFormat | null>(null);

  useEffect(() => {
    if (open) {
      generateQRCode(url, 'png', 512).then(setQrCodePNG);
    }
  }, [open, url]);

  const handleDownload = async (format: QRCodeFormat) => {
    setDownloadingFormat(format);
    setLoading(true);
    try {
      const qrData = await generateQRCode(url, format, 1024);
      downloadQRCode(qrData, filename, format);
      toast.success(`QR code downloaded as ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error(`Failed to generate ${format.toUpperCase()} QR code`);
    } finally {
      setLoading(false);
      setDownloadingFormat(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code Details</DialogTitle>
          <DialogDescription>
            Download your QR code in different formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Preview */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            {qrCodePNG ? (
              <img
                src={qrCodePNG}
                alt="QR Code"
                className="w-64 h-64"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* URL Display */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Short URL</p>
            <code className="block px-3 py-2 bg-muted rounded text-sm break-all">
              {url}
            </code>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Download as:</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownload('png')}
                disabled={loading}
                className="gap-2"
              >
                {downloadingFormat === 'png' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                PNG
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload('jpg')}
                disabled={loading}
                className="gap-2"
              >
                {downloadingFormat === 'jpg' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                JPG
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload('svg')}
                disabled={loading}
                className="gap-2"
              >
                {downloadingFormat === 'svg' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                SVG
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
