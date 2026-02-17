"use client";

import { useCallback, useState, useEffect } from "react";
import { Copy, Trash2, Check, Sparkles } from "lucide-react";
import { Project } from "@/lib/store";
import { useProjectStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GlobalPromptEditorProps {
  project: Project;
}

export function GlobalPromptEditor({ project }: GlobalPromptEditorProps) {
  const { updateProject } = useProjectStore();
  const [value, setValue] = useState(project.globalPrompt);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== project.globalPrompt) {
        setIsSaving(true);
        updateProject(project.id, { globalPrompt: value });
        setTimeout(() => setIsSaving(false), 300);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, project.id, project.globalPrompt, updateProject]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const handleClear = useCallback(() => {
    if (confirm("Are you sure you want to clear the global prompt?")) {
      setValue("");
      updateProject(project.id, { globalPrompt: "" });
    }
  }, [project.id, updateProject]);

  const characterCount = value.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Global Prompt
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            High-level instructions for the landing page generator
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1.5 text-secondary" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy to clipboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!value}
                className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear prompt</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Editor */}
      <div className="relative group">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe the overall style, tone, target audience, and key messaging for your landing page...&#10;&#10;Example:&#10;- Modern SaaS landing page&#10;- Target audience: startup founders&#10;- Tone: Professional but friendly&#10;- Primary color: Blue (#3B82F6)&#10;- Key message: Save time, automate workflows"
          className="min-h-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-y focus:border-ring focus:ring-1 focus:ring-ring font-mono text-sm leading-relaxed"
        />
        
        {/* Character counter & save indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          {isSaving && (
            <span className="text-xs text-primary animate-pulse">Saving...</span>
          )}
          <span className={`text-xs ${characterCount > 2000 ? "text-destructive" : "text-muted-foreground"}`}>
            {characterCount.toLocaleString()} chars
          </span>
        </div>
      </div>

      {/* Tips */}
      <div className="flex flex-wrap gap-2">
        {["Modern SaaS", "E-commerce", "Portfolio", "Mobile App"].map((template) => (
          <button
            key={template}
            onClick={() => {
              const templateText = `Create a ${template.toLowerCase()} landing page with clean design, clear CTAs, and modern aesthetics.`;
              setValue((prev) => (prev ? prev + "\n\n" + templateText : templateText));
            }}
            className="px-3 py-1.5 text-xs rounded-md bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
          >
            + {template}
          </button>
        ))}
      </div>
    </div>
  );
}
