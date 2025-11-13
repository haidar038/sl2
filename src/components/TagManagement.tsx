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
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Trash2, Loader2, Edit2, X } from "lucide-react";
import { toast } from "sonner";

interface TagData {
  id: string;
  name: string;
  color: string;
  created_at: string;
  url_count?: number;
}

const PRESET_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#22c55e', label: 'Green' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#d946ef', label: 'Fuchsia' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f43f5e', label: 'Rose' },
];

export const TagManagement = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#3b82f6");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTags();
  }, [user]);

  const fetchTags = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch tags with URL count
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (tagsError) throw tagsError;

      // Get URL count for each tag
      const tagsWithCount = await Promise.all(
        (tagsData || []).map(async (tag) => {
          const { count } = await supabase
            .from('url_tags')
            .select('*', { count: 'exact', head: true })
            .eq('tag_id', tag.id);

          return { ...tag, url_count: count || 0 };
        })
      );

      setTags(tagsWithCount);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tag?: TagData) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
      setTagColor(tag.color);
    } else {
      setEditingTag(null);
      setTagName('');
      setTagColor('#3b82f6');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTag(null);
    setTagName('');
    setTagColor('#3b82f6');
  };

  const handleSubmit = async () => {
    if (!tagName.trim()) {
      toast.error('Please enter a tag name');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTag) {
        // Update existing tag
        const { error } = await supabase
          .from('tags')
          .update({ name: tagName.trim(), color: tagColor })
          .eq('id', editingTag.id);

        if (error) throw error;
        toast.success('Tag updated successfully');
      } else {
        // Create new tag
        const { error } = await supabase
          .from('tags')
          .insert({
            owner_id: user!.id,
            name: tagName.trim(),
            color: tagColor,
          });

        if (error) {
          if (error.code === '23505') {
            toast.error('A tag with this name already exists');
            return;
          }
          throw error;
        }
        toast.success('Tag created successfully');
      }

      handleCloseDialog();
      fetchTags();
    } catch (error: any) {
      console.error('Error saving tag:', error);
      toast.error(error.message || 'Failed to save tag');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTag = async (tag: TagData) => {
    if (tag.url_count && tag.url_count > 0) {
      if (!confirm(`This tag is used on ${tag.url_count} URL(s). Delete anyway? The tag will be removed from all URLs.`)) {
        return;
      }
    } else {
      if (!confirm(`Delete tag "${tag.name}"?`)) {
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tag.id);

      if (error) throw error;

      toast.success('Tag deleted successfully');
      fetchTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tag Management
            </CardTitle>
            <CardDescription>
              Create and manage tags to organize your URLs
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
                <DialogDescription>
                  {editingTag ? 'Update tag details' : 'Create a new tag to organize your URLs'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tag_name">Tag Name</Label>
                  <Input
                    id="tag_name"
                    placeholder="e.g., Work, Personal, Important"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-9 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          tagColor === color.value
                            ? 'border-foreground scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setTagColor(color.value)}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor="custom_color" className="text-sm">Custom:</Label>
                    <Input
                      id="custom_color"
                      type="color"
                      value={tagColor}
                      onChange={(e) => setTagColor(e.target.value)}
                      className="w-16 h-8 p-1 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">{tagColor}</span>
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Preview:</p>
                  <Badge style={{ backgroundColor: tagColor, color: 'white' }}>
                    {tagName || 'Tag Name'}
                  </Badge>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTag ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tags yet</p>
            <p className="text-sm">Create your first tag to organize your URLs</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    style={{ backgroundColor: tag.color, color: 'white' }}
                    className="font-medium"
                  >
                    {tag.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {tag.url_count || 0} {tag.url_count === 1 ? 'URL' : 'URLs'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenDialog(tag)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTag(tag)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
