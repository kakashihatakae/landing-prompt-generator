"use client";

import { useCallback, useState, useEffect } from "react";
import { Copy, Trash2, Check, Sparkles } from "lucide-react";
import { Project } from "@/lib/store";
import { useProjectStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const PROMPT_THEMES = [
  {
    label: "Frosted Metal",
    content: `# ⚡ 1. “FROSTED METAL” (Apple Hardware Feel)\n\nFeels like **machined aluminum + soft light diffusion**\n\n\`\`\`css\n.frosted-metal {\n  background: linear-gradient(\n    145deg,\n    rgba(255,255,255,0.06),\n    rgba(255,255,255,0.01)\n  );\n  border: 1px solid rgba(255,255,255,0.08);\n  box-shadow:\n    inset 0 1px 0 rgba(255,255,255,0.15),\n    inset 0 -1px 0 rgba(0,0,0,0.4),\n    0 20px 40px rgba(0,0,0,0.6);\n  backdrop-filter: blur(2px);\n}\n\`\`\`\n`
  },
  {
    label: "Neon Edge",
    content: `# ⚡ 2. “NEON EDGE” (Cyberpunk Minimal)\n\nInstead of glow everywhere → **only edges glow**\n\n\`\`\`css\n.neon-edge {\n  background: rgba(0,0,0,0.6);\n  border-radius: inherit;\n  position: relative;\n}\n\n.neon-edge::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  padding: 1px;\n  background: linear-gradient(\n    120deg,\n    transparent,\n    rgba(0,255,180,0.8),\n    transparent\n  );\n  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);\n  -webkit-mask-composite: xor;\n}\n\`\`\`\n`
  },
  {
    label: "Soft Depth",
    content: `# ⚡ 3. “SOFT DEPTH” (Linear / Notion Vibe)\n\nNo glass, no shine — just **perfect depth layering**\n\n\`\`\`css\n.soft-depth {\n  background: #0a0a0a;\n  border: 1px solid rgba(255,255,255,0.04);\n  box-shadow:\n    0 1px 0 rgba(255,255,255,0.04),\n    0 10px 30px rgba(0,0,0,0.8);\n}\n\`\`\`\n`
  },
  {
    label: "Aurora",
    content: `# ⚡ 4. “AURORA GRADIENT SURFACE” (Subtle Motion Feel)\n\nFeels alive without animation\n\n\`\`\`css\n.aurora-surface {\n  background: radial-gradient(\n      80% 120% at 20% 0%,\n      rgba(0,255,180,0.15),\n      transparent 60%\n    ),\n    radial-gradient(\n      80% 120% at 80% 100%,\n      rgba(100,100,255,0.12),\n      transparent 60%\n    ),\n    #000;\n  border: 1px solid rgba(255,255,255,0.06);\n}\n\`\`\`\n`
  },
  {
    label: "Glassless Glow",
    content: `# ⚡ 5. “GLASSLESS GLOW” (My Personal Favorite)\n\nNo blur at all — just **light physics illusion**\n\n\`\`\`css\n.glassless-glow {\n  background: rgba(255,255,255,0.02);\n  border: 1px solid rgba(255,255,255,0.06);\n  box-shadow:\n    0 0 0 1px rgba(255,255,255,0.03),\n    0 20px 60px rgba(0,0,0,0.8),\n    0 0 40px rgba(0,255,180,0.08);\n}\n\`\`\`\n`
  },
  {
    label: "Inner Light",
    content: `# ⚡ 6. “INNER LIGHT PANEL” (Luxury UI)\n\nFeels like **light is trapped inside the component**\n\n\`\`\`css\n.inner-light {\n  background: #050505;\n  border-radius: inherit;\n  position: relative;\n}\n\n.inner-light::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  box-shadow:\n    inset 0 0 40px rgba(255,255,255,0.06),\n    inset 0 0 80px rgba(0,255,180,0.05);\n  pointer-events: none;\n}\n\`\`\`\n`
  },
  {
    label: "Noise Texture",
    content: `# ⚡ 7. “NOISE TEXTURE SURFACE” (Editorial Premium)\n\nTiny detail → massive perceived quality jump\n\n\`\`\`css\n.noise-surface {\n  background: #000;\n  position: relative;\n}\n\n.noise-surface::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  opacity: 0.04;\n  background-image: url('/noise.png');\n  mix-blend-mode: overlay;\n  pointer-events: none;\n}\n\`\`\`\n`
  }
];

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

      {/* Themes */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Click to add a style theme
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_THEMES.map((theme) => (
            <button
              key={theme.label}
              onClick={() => {
                setValue((prev) => (prev ?  prev + theme.content : theme.content));
              }}
              className="px-3 py-1.5 text-xs rounded-md bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
