import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateUrlDialog } from "@/components/CreateUrlDialog";
import { UrlCard } from "@/components/UrlCard";
import { Navbar } from "@/components/Navbar";
import { Search, Link as LinkIcon, BarChart3, Tag, ChevronLeft, ChevronRight, CheckSquare, Square, Trash2, Download, Tags } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

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

export default function Dashboard() {
    const { user } = useAuth();
    const [urls, setUrls] = useState<Url[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"active" | "deleted">("active");
    const [fetchError, setFetchError] = useState(false);
    const [tags, setTags] = useState<TagData[]>([]);
    const [selectedTagId, setSelectedTagId] = useState<string>("all");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
    const [bulkMode, setBulkMode] = useState(false);

    const fetchUrls = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setFetchError(false);
        try {
            let query: any = supabase.from("urls").select("id, slug, target_url, title, description, is_public, click_count, created_at, deleted_at, expiry_at").eq("owner_id", user.id).eq("is_guest", false);

            // Filter by tag if selected
            if (selectedTagId !== "all") {
                // Get URL IDs that have this tag
                const { data: urlTagsData, error: urlTagsError } = await supabase.from("url_tags").select("url_id").eq("tag_id", selectedTagId);

                if (urlTagsError) throw urlTagsError;

                const urlIds = urlTagsData?.map((ut) => ut.url_id) || [];
                if (urlIds.length > 0) {
                    query = query.in("id", urlIds);
                } else {
                    // No URLs with this tag
                    setUrls([]);
                    setLoading(false);
                    return;
                }
            }

            query = query.order("created_at", { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            setUrls(data || []);
            setCurrentPage(1); // Reset to first page when data changes
        } catch (error: any) {
            console.error("Failed to fetch URLs:", error);
            setFetchError(true);
            toast.error(error.message || "Failed to fetch URLs");
        } finally {
            setLoading(false);
        }
    }, [user?.id, selectedTagId]);

    useEffect(() => {
        fetchUrls();
        fetchTags();
    }, [fetchUrls]);

    const fetchTags = async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase.from("tags").select("id, name, color").eq("owner_id", user.id).order("name");

            if (error) throw error;
            setTags(data || []);
        } catch (error: any) {
            console.error("Error fetching tags:", error);
        }
    };

    const filteredUrls = urls
        .filter((url) => {
            if (filter === "active") return !url.deleted_at;
            return !!url.deleted_at;
        })
        .filter((url) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return url.slug.toLowerCase().includes(query) || url.target_url.toLowerCase().includes(query) || url.title?.toLowerCase().includes(query) || url.description?.toLowerCase().includes(query);
        });

    // Pagination
    const totalPages = Math.ceil(filteredUrls.length / pageSize);
    const paginatedUrls = filteredUrls.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalClicks = urls.reduce((sum, url) => sum + url.click_count, 0);
    const activeUrls = urls.filter((url) => !url.deleted_at).length;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageSizeChange = (size: string) => {
        setPageSize(parseInt(size));
        setCurrentPage(1);
    };

    // Bulk operations handlers
    const toggleBulkMode = () => {
        setBulkMode(!bulkMode);
        setSelectedUrls(new Set());
    };

    const toggleSelectUrl = (urlId: string) => {
        const newSelected = new Set(selectedUrls);
        if (newSelected.has(urlId)) {
            newSelected.delete(urlId);
        } else {
            newSelected.add(urlId);
        }
        setSelectedUrls(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedUrls.size === paginatedUrls.length) {
            setSelectedUrls(new Set());
        } else {
            setSelectedUrls(new Set(paginatedUrls.map((url) => url.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUrls.size === 0) return;

        if (!confirm(`Delete ${selectedUrls.size} selected URL(s)?`)) return;

        setLoading(true);
        try {
            const urlIds = Array.from(selectedUrls);

            for (const urlId of urlIds) {
                const { error } = await supabase.rpc("soft_delete_url", { url_id: urlId });
                if (error) throw error;
            }

            toast.success(`${selectedUrls.size} URL(s) deleted successfully`);
            setSelectedUrls(new Set());
            fetchUrls();
        } catch (error: any) {
            console.error("Error in bulk delete:", error);
            toast.error("Failed to delete some URLs");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkExport = () => {
        if (selectedUrls.size === 0) return;

        try {
            const selectedUrlsData = urls.filter((url) => selectedUrls.has(url.id));

            const headers = ["Slug", "Target URL", "Title", "Description", "Clicks", "Created", "Is Public", "Expiry"];
            const rows = selectedUrlsData.map((url) => [
                url.slug,
                url.target_url,
                url.title || "",
                url.description || "",
                url.click_count.toString(),
                format(new Date(url.created_at), "yyyy-MM-dd HH:mm:ss"),
                url.is_public ? "Yes" : "No",
                url.expiry_at ? format(new Date(url.expiry_at), "yyyy-MM-dd HH:mm:ss") : "",
            ]);

            const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            link.setAttribute("href", url);
            link.setAttribute("download", `urls-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
            link.style.visibility = "hidden";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Exported ${selectedUrls.size} URL(s) to CSV`);
        } catch (error) {
            console.error("Error exporting URLs:", error);
            toast.error("Failed to export URLs");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                            <p className="text-muted-foreground">Welcome back{user?.email && `, ${user.email}`}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant={bulkMode ? "default" : "outline"} onClick={toggleBulkMode} size="lg" className="gap-2">
                                {bulkMode ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                {bulkMode ? "Exit Bulk Mode" : "Bulk Select"}
                            </Button>
                            <CreateUrlDialog onUrlCreated={fetchUrls} />
                        </div>
                    </div>

                    {/* Bulk Actions Toolbar */}
                    {bulkMode && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                                        {selectedUrls.size === paginatedUrls.length ? "Deselect All" : "Select All"}
                                    </Button>
                                    <span className="text-sm font-medium">{selectedUrls.size} selected</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={handleBulkExport} disabled={selectedUrls.size === 0} className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Export
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selectedUrls.size === 0} className="gap-2">
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-card p-6 rounded-lg border border-border shadow-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <LinkIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{activeUrls}</p>
                                    <p className="text-sm text-muted-foreground">Active URLs</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border shadow-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{totalClicks}</p>
                                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border shadow-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-info" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{activeUrls > 0 ? Math.round(totalClicks / activeUrls) : 0}</p>
                                    <p className="text-sm text-muted-foreground">Avg per URL</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search URLs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                            </div>

                            <div className="flex gap-2">
                                <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                                    <SelectTrigger className="w-[180px]">
                                        <Tag className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Filter by tag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tags</SelectItem>
                                        {tags.map((tag) => (
                                            <SelectItem key={tag.id} value={tag.id}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                                    {tag.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                                    <TabsList>
                                        <TabsTrigger value="active">Active</TabsTrigger>
                                        <TabsTrigger value="deleted">Deleted</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {filteredUrls.length > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Show</span>
                                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                        <SelectTrigger className="w-[70px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-muted-foreground">
                                        of {filteredUrls.length} {filteredUrls.length === 1 ? "URL" : "URLs"}
                                    </span>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* URLs List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    ) : fetchError ? (
                        <div className="text-center py-12 bg-card rounded-lg border border-destructive/50">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-destructive" />
                            <p className="text-lg font-medium mb-2 text-destructive">Failed to load URLs</p>
                            <p className="text-muted-foreground mb-6">There was an error loading your URLs. Please check your connection and try again.</p>
                            <Button onClick={fetchUrls} variant="outline">
                                Retry
                            </Button>
                        </div>
                    ) : filteredUrls.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-lg border border-border">
                            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium mb-2">No URLs found</p>
                            <p className="text-muted-foreground mb-6">{searchQuery ? "Try adjusting your search query" : filter === "active" ? "Create your first short URL to get started" : "No deleted URLs to show"}</p>
                            {!searchQuery && filter === "active" && <CreateUrlDialog onUrlCreated={fetchUrls} />}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {paginatedUrls.map((url) => (
                                    <div key={url.id} className="flex items-start gap-3">
                                        {bulkMode && (
                                            <div className="pt-6">
                                                <Checkbox checked={selectedUrls.has(url.id)} onCheckedChange={() => toggleSelectUrl(url.id)} className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <UrlCard url={url} onUpdate={fetchUrls} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground px-4">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
