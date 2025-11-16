import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, ExternalLink, QrCode, Trash2, BarChart3, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeDetailModal } from "@/components/QRCodeDetailModal";
import { AnalyticsModal } from "@/components/AnalyticsModal";
import { TagSelector } from "@/components/TagSelector";
import { format } from "date-fns";

interface TagData {
    id: string;
    name: string;
    color: string;
}

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
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [tags, setTags] = useState<TagData[]>([]);
    const domain = import.meta.env.VITE_APP_DOMAIN || window.location.host;
    const shortUrl = `https://${domain}/${url.slug}`;
    const isDeleted = !!url.deleted_at;
    const isExpired = url.expiry_at && new Date(url.expiry_at) < new Date();

    useEffect(() => {
        fetchTags();
    }, [url.id]);

    const fetchTags = async () => {
        try {
            const { data, error } = await supabase.rpc("get_url_tags", {
                p_url_id: url.id,
            });

            if (error) throw error;
            setTags(data || []);
        } catch (error: any) {
            console.error("Error fetching tags:", error);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shortUrl);
        toast.success("Copied to clipboard!");
    };

    const handleDelete = async () => {
        setShowDeleteDialog(false);
        setLoading(true);
        try {
            const { error } = await supabase.rpc("soft_delete_url", { url_id: url.id });
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
            const { error } = await supabase.rpc("restore_url", { url_id: url.id });
            if (error) throw error;
            toast.success("URL restored successfully!");
            onUpdate?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to restore URL");
        } finally {
            setLoading(false);
        }
    };

    const handlePermanentDelete = async () => {
        setShowPermanentDeleteDialog(false);
        setLoading(true);
        try {
            const { error } = await supabase.rpc("permanent_delete_url", { url_id: url.id });
            if (error) throw error;
            toast.success("URL permanently deleted");
            onUpdate?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to permanently delete URL");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenQRModal = () => {
        setShowQRModal(true);
    };

    return (
        <Card className="p-6 transition-all duration-300">
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate">{url.title || url.slug}</h3>
                            {isDeleted && <span className="px-2 py-1 text-xs rounded-full bg-destructive/10 text-destructive">Deleted</span>}
                            {isExpired && <span className="px-2 py-1 text-xs rounded-full bg-warning/10 text-warning">Expired</span>}
                            {!url.is_public && <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">Private</span>}
                        </div>

                        <div className="flex items-center gap-2 text-sm mb-2">
                            <code className="px-2 py-1 bg-muted rounded text-primary font-mono">{shortUrl}</code>
                            <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-7 px-2">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>

                        <p className="text-sm text-muted-foreground truncate mb-2">→ {url.target_url}</p>

                        {url.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{url.description}</p>}

                        {!isDeleted && (
                            <div className="mt-2">
                                <TagSelector urlId={url.id} selectedTags={tags} onTagsChange={fetchTags} />
                            </div>
                        )}
                    </div>

                    <div className="text-right">
                        <button onClick={() => setShowAnalyticsModal(true)} className="flex items-center gap-2 text-2xl font-bold text-primary mb-1 hover:opacity-80 transition-opacity cursor-pointer">
                            <BarChart3 className="w-5 h-5" />
                            {url.click_count}
                        </button>
                        <p className="text-xs text-muted-foreground">clicks</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Created {format(new Date(url.created_at), "MMM d, yyyy")}</p>

                    <div className="flex items-center gap-2">
                        {isDeleted ? (
                            <>
                                <Button size="sm" variant="outline" onClick={handleRestore} disabled={loading} className="gap-1">
                                    <RotateCcw className="w-4 h-4" />
                                    Restore
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => setShowPermanentDeleteDialog(true)} disabled={loading} className="gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Delete Permanently
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button size="sm" variant="outline" onClick={() => setShowAnalyticsModal(true)} disabled={loading}>
                                    <BarChart3 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleOpenQRModal} disabled={loading}>
                                    <QrCode className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => window.open(shortUrl, "_blank")}>
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setShowDeleteDialog(true)} disabled={loading}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Soft Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete URL?</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this URL? You can restore it within 30 days.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Permanent Delete Dialog */}
            <Dialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Permanent Delete Warning
                        </DialogTitle>
                        <DialogDescription className="space-y-2">
                            <p className="font-semibold text-foreground">This will permanently delete this URL and all its analytics data.</p>
                            <p>
                                This action <strong>CANNOT be undone</strong>. Are you absolutely sure you want to continue?
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPermanentDeleteDialog(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handlePermanentDelete} disabled={loading}>
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QR Code Detail Modal */}
            <QRCodeDetailModal open={showQRModal} onOpenChange={setShowQRModal} url={shortUrl} filename={url.slug} />

            {/* Analytics Modal */}
            <AnalyticsModal open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal} urlId={url.id} urlSlug={url.slug} />
        </Card>
    );
};
