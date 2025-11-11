import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateUrlDialog } from "@/components/CreateUrlDialog";
import { UrlCard } from "@/components/UrlCard";
import { Navbar } from "@/components/Navbar";
import { LogOut, Search, Link as LinkIcon, BarChart3 } from "lucide-react";
import { toast } from "sonner";

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
  const { user, signOut } = useAuth();
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'active' | 'deleted'>('active');
  const [fetchError, setFetchError] = useState(false);

  const fetchUrls = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(false);
    try {
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUrls(data || []);
    } catch (error: any) {
      console.error("Failed to fetch URLs:", error);
      setFetchError(true);
      toast.error(error.message || "Failed to fetch URLs");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleLogout = async () => {
    await signOut();
  };

  const filteredUrls = urls
    .filter(url => {
      if (filter === 'active') return !url.deleted_at;
      return !!url.deleted_at;
    })
    .filter(url => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        url.slug.toLowerCase().includes(query) ||
        url.target_url.toLowerCase().includes(query) ||
        url.title?.toLowerCase().includes(query) ||
        url.description?.toLowerCase().includes(query)
      );
    });

  const totalClicks = urls.reduce((sum, url) => sum + url.click_count, 0);
  const activeUrls = urls.filter(url => !url.deleted_at).length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back{user?.email && `, ${user.email}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CreateUrlDialog onUrlCreated={fetchUrls} />
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

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
                  <p className="text-2xl font-bold">
                    {activeUrls > 0 ? Math.round(totalClicks / activeUrls) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg per URL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search URLs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="deleted">Deleted</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
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
              <p className="text-muted-foreground mb-6">
                There was an error loading your URLs. Please check your connection and try again.
              </p>
              <Button onClick={fetchUrls} variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <LinkIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No URLs found</p>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : filter === 'active'
                  ? "Create your first short URL to get started"
                  : "No deleted URLs to show"}
              </p>
              {!searchQuery && filter === 'active' && (
                <CreateUrlDialog onUrlCreated={fetchUrls} />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUrls.map((url) => (
                <UrlCard key={url.id} url={url} onUpdate={fetchUrls} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
