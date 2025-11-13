import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TagData {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  urlId: string;
  selectedTags: TagData[];
  onTagsChange?: () => void;
}

export const TagSelector = ({ urlId, selectedTags, onTagsChange }: TagSelectorProps) => {
  const { user } = useAuth();
  const [allTags, setAllTags] = useState<TagData[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllTags();
  }, [user]);

  const fetchAllTags = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setAllTags(data || []);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleToggleTag = async (tag: TagData) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);

    setLoading(true);
    try {
      if (isSelected) {
        // Remove tag
        const { error } = await supabase.rpc('remove_tag_from_url', {
          p_url_id: urlId,
          p_tag_id: tag.id
        });

        if (error) throw error;
        toast.success(`Removed tag "${tag.name}"`);
      } else {
        // Add tag
        const { error } = await supabase.rpc('assign_tag_to_url', {
          p_url_id: urlId,
          p_tag_id: tag.id
        });

        if (error) throw error;
        toast.success(`Added tag "${tag.name}"`);
      }

      onTagsChange?.();
    } catch (error: any) {
      console.error('Error toggling tag:', error);
      toast.error(error.message || 'Failed to update tags');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tag: TagData, e: React.MouseEvent) => {
    e.stopPropagation();
    await handleToggleTag(tag);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.color, color: 'white' }}
          className="pr-1 cursor-pointer hover:opacity-80"
          onClick={(e) => handleRemoveTag(tag, e)}
        >
          {tag.name}
          <X className="ml-1 h-3 w-3" />
        </Badge>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            disabled={loading}
          >
            <Tag className="mr-1 h-3 w-3" />
            {selectedTags.length === 0 ? 'Add tag' : 'Edit'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandEmpty>
              <div className="p-4 text-center text-sm text-muted-foreground">
                No tags found.
                <br />
                <span className="text-xs">Create tags in Settings</span>
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {allTags.map((tag) => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                return (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleToggleTag(tag)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Badge
                      style={{ backgroundColor: tag.color, color: 'white' }}
                      className="text-xs"
                    >
                      {tag.name}
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
