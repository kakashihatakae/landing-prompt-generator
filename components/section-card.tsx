"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Copy,
  Trash2,
  ImageIcon,
  Palette,
  Sparkles,
} from "lucide-react";
import { Section } from "@/lib/store";
import { useProjectStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SectionCardProps {
  projectId: string;
  section: Section;
}

export function SectionCard({ projectId, section }: SectionCardProps) {
  const { updateSection, deleteSection, duplicateSection } = useProjectStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState(section.description);
  const [imageUrl, setImageUrl] = useState(section.image_url || "");
  const [imageDescription, setImageDescription] = useState(section.image_description || "");
  const [styleNotes, setStyleNotes] = useState(section.style_notes || "");
  const [animationNotes, setAnimationNotes] = useState(section.animation_notes || "");
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        description !== section.description ||
        imageUrl !== (section.image_url || "") ||
        imageDescription !== (section.image_description || "") ||
        styleNotes !== (section.style_notes || "") ||
        animationNotes !== (section.animation_notes || "")
      ) {
        setIsSaving(true);
        updateSection(projectId, section.id, {
          description,
          image_url: imageUrl || null,
          image_description: imageDescription || null,
          style_notes: styleNotes || null,
          animation_notes: animationNotes || null,
        });
        setTimeout(() => setIsSaving(false), 300);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    description,
    imageUrl,
    imageDescription,
    styleNotes,
    animationNotes,
    projectId,
    section.id,
    section.description,
    section.image_url,
    section.image_description,
    section.style_notes,
    section.animation_notes,
    updateSection,
  ]);

  const handleDuplicate = useCallback(() => {
    duplicateSection(projectId, section.id);
  }, [projectId, section.id, duplicateSection]);

  const handleDelete = useCallback(() => {
    if (confirm(`Are you sure you want to delete the "${section.name}" section?`)) {
      deleteSection(projectId, section.id);
    }
  }, [projectId, section.id, section.name, deleteSection]);

  const previewText = section.description.slice(0, 80) + (section.description.length > 80 ? "..." : "");
  const hasContent = section.description || section.image_url || section.style_notes || section.animation_notes;

  return (
    <div
      className={`border rounded-xl transition-all duration-200 ${
        isExpanded
          ? "border-primary/30 bg-card"
          : "border-border bg-card/50 hover:border-border/80"
      }`}
    >
      {/* Collapsed Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
      >
        {/* Drag Handle (placeholder for future DnD) */}
        <div className="text-muted-foreground hover:text-foreground cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Section Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">{section.name}</h3>
            <span className="text-xs text-muted-foreground capitalize">{section.type}</span>
            {hasContent && (
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" title="Has content" />
            )}
          </div>
          {!isExpanded && section.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{previewText}</p>
          )}
        </div>

        {/* Expand/Collapse */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">
          {/* Saving indicator */}
          <div className="flex justify-end pt-2">
            {isSaving && (
              <span className="text-xs text-primary animate-pulse">Saving...</span>
            )}
          </div>

          {/* Section Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the layout, tone, and purpose of this section..."
              className="min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-y focus:border-ring focus:ring-1 focus:ring-ring text-sm"
            />
          </div>

          {/* Image Reference */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Image Reference
              </label>
            </div>
            <div className="space-y-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring text-sm"
              />
              <Textarea
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="What should the image represent?"
                className="min-h-[60px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-y focus:border-ring focus:ring-1 focus:ring-ring text-sm"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-primary" />
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Style Notes
                </label>
              </div>
              <Textarea
                value={styleNotes}
                onChange={(e) => setStyleNotes(e.target.value)}
                placeholder="Colors, typography..."
                className="min-h-[80px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-y focus:border-ring focus:ring-1 focus:ring-ring text-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Animation Notes
                </label>
              </div>
              <Textarea
                value={animationNotes}
                onChange={(e) => setAnimationNotes(e.target.value)}
                placeholder="Transitions, effects..."
                className="min-h-[80px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-y focus:border-ring focus:ring-1 focus:ring-ring text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDuplicate}
                  className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Duplicate
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate section</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete section</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
