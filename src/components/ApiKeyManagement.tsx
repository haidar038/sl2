import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Trash2, Plus, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  rate_limit: number;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export const ApiKeyManagement = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyRate, setNewKeyRate] = useState("100");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ key: string; name: string } | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  const fetchApiKeys = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    // Generate a secure random API key: sl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const randomBytes = new Uint8Array(24);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `sl_${randomString}`;
  };

  const hashApiKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    const rateLimit = parseInt(newKeyRate);
    if (isNaN(rateLimit) || rateLimit < 1 || rateLimit > 10000) {
      toast.error('Rate limit must be between 1 and 10,000');
      return;
    }

    setCreating(true);
    try {
      // Generate the API key
      const apiKey = generateApiKey();
      const keyHash = await hashApiKey(apiKey);
      const keyPrefix = apiKey.substring(0, 10); // sl_xxxxxxxx

      // Store in database
      const { error } = await supabase
        .from('api_keys')
        .insert({
          owner_id: user!.id,
          name: newKeyName,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          rate_limit: rateLimit,
          permissions: { create: true, read: true },
        });

      if (error) throw error;

      toast.success('API key created successfully!');
      setNewlyCreatedKey({ key: apiKey, name: newKeyName });
      setNewKeyName('');
      setNewKeyRate('100');
      setDialogOpen(false);
      fetchApiKeys();
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete API key "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('API key deleted successfully');
      fetchApiKeys();
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const dismissNewKey = () => {
    setNewlyCreatedKey(null);
    setShowNewKey(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Management
            </CardTitle>
            <CardDescription>
              Create and manage API keys for programmatic access to ShortLink
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key for accessing ShortLink programmatically. The full key will only be shown once.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key_name">Name</Label>
                  <Input
                    id="key_name"
                    placeholder="e.g., Production Server"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    A descriptive name to identify this API key
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate_limit">Rate Limit (requests/hour)</Label>
                  <Input
                    id="rate_limit"
                    type="number"
                    placeholder="100"
                    value={newKeyRate}
                    onChange={(e) => setNewKeyRate(e.target.value)}
                    min="1"
                    max="10000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of API requests per hour
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateApiKey} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Show newly created key */}
        {newlyCreatedKey && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">API Key Created Successfully!</CardTitle>
              <CardDescription>
                This is your API key for <strong>{newlyCreatedKey.name}</strong>. Copy it now - you won't be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newlyCreatedKey.key}
                      type={showNewKey ? "text" : "password"}
                      readOnly
                      className="font-mono pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowNewKey(!showNewKey)}
                        className="h-7 w-7 p-0"
                      >
                        {showNewKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(newlyCreatedKey.key, 'new')}
                        className="h-7 w-7 p-0"
                      >
                        {copiedId === 'new' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={dismissNewKey}>
                  I've copied the key
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No API keys yet</p>
            <p className="text-sm">Create your first API key to get started</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {key.key_prefix}••••••••
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.key_prefix, key.id)}
                          className="h-7 w-7 p-0"
                        >
                          {copiedId === key.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{key.rate_limit}/hour</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.last_used_at
                        ? formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {key.is_active ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteApiKey(key.id, key.name)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">API Documentation</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Use your API key in the Authorization header:
          </p>
          <code className="text-xs bg-background px-3 py-2 rounded block">
            Authorization: Bearer YOUR_API_KEY
          </code>
        </div>
      </CardContent>
    </Card>
  );
};
