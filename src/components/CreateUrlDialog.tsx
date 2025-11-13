import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Sparkles, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug, isValidSlug, sanitizeUrl } from "@/lib/slugGenerator";
import { toast } from "sonner";
import { z } from "zod";

const urlSchema = z.object({
  target_url: z.string().url("Please enter a valid URL"),
  slug: z.string().optional(),
  title: z.string().max(200, "Title too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  is_public: z.boolean().default(true),
  expiry_at: z.string().optional(),
});

interface CreateUrlDialogProps {
  onUrlCreated?: () => void;
}

export const CreateUrlDialog = ({ onUrlCreated }: CreateUrlDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    target_url: "",
    slug: "",
    title: "",
    description: "",
    is_public: true,
    expiry_at: "",
    require_password: false,
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validatedData = urlSchema.parse({
        ...formData,
        slug: formData.slug || undefined,
        title: formData.title || undefined,
        description: formData.description || undefined,
        expiry_at: formData.expiry_at || undefined,
      });

      // Sanitize URL
      const sanitizedUrl = sanitizeUrl(validatedData.target_url);

      // Generate slug if not provided
      let finalSlug = validatedData.slug || generateSlug();
      
      // Validate custom slug
      if (validatedData.slug && !isValidSlug(validatedData.slug)) {
        toast.error("Invalid slug format. Use only letters, numbers, hyphens, and underscores.");
        setLoading(false);
        return;
      }

      // Check slug availability
      const { data: existingUrl } = await supabase
        .from('urls')
        .select('slug')
        .eq('slug', finalSlug)
        .maybeSingle();

      if (existingUrl) {
        // If custom slug exists, show error
        if (validatedData.slug) {
          toast.error("This slug is already taken. Please choose another one.");
          setLoading(false);
          return;
        }
        // If auto-generated slug exists (rare collision), generate new one
        finalSlug = generateSlug(8);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate password if required
      if (formData.require_password) {
        if (!formData.password || formData.password.length < 4) {
          toast.error("Password must be at least 4 characters long");
          setLoading(false);
          return;
        }
      }

      // Create URL
      const { data: newUrl, error } = await supabase.from('urls').insert({
        owner_id: user.id,
        slug: finalSlug,
        target_url: sanitizedUrl,
        title: validatedData.title,
        description: validatedData.description,
        is_public: validatedData.is_public,
        expiry_at: validatedData.expiry_at || null,
      }).select().single();

      if (error) throw error;

      // Set password if required
      if (formData.require_password && formData.password && newUrl) {
        const { error: passwordError } = await supabase.rpc('set_url_password', {
          p_url_id: newUrl.id,
          p_password: formData.password
        });

        if (passwordError) {
          console.error('Error setting password:', passwordError);
          toast.error('URL created but failed to set password');
        }
      }

      toast.success("Short URL created successfully!");
      setOpen(false);
      setFormData({
        target_url: "",
        slug: "",
        title: "",
        description: "",
        is_public: true,
        expiry_at: "",
        require_password: false,
        password: "",
      });
      onUrlCreated?.();
    } catch (error: any) {
      console.error("Error creating URL:", error);
      toast.error(error.message || "Failed to create short URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create Short URL
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Short URL
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target_url">Destination URL *</Label>
            <Input
              id="target_url"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={formData.target_url}
              onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Custom Alias (optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{import.meta.env.VITE_APP_DOMAIN || window.location.host}/</span>
              <Input
                id="slug"
                placeholder="my-link"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                pattern="[a-zA-Z0-9_-]{3,50}"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate. Use only letters, numbers, hyphens, and underscores.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="My awesome link"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description to remember what this link is for..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_public" className="cursor-pointer">
              Public Link
            </Label>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_at">Expiration Date (optional)</Label>
            <Input
              id="expiry_at"
              type="datetime-local"
              value={formData.expiry_at}
              onChange={(e) => setFormData({ ...formData, expiry_at: e.target.value })}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="require_password" className="cursor-pointer">
                  Password Protection
                </Label>
              </div>
              <Switch
                id="require_password"
                checked={formData.require_password}
                onCheckedChange={(checked) => setFormData({ ...formData, require_password: checked, password: checked ? formData.password : "" })}
              />
            </div>

            {formData.require_password && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={4}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Users will need this password to access the link
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Short URL"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
