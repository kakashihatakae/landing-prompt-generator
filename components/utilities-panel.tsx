"use client";

import { useMemo, useState, useCallback } from "react";
import { Copy, Download, Check, FileCode, Eye, EyeOff, Send, Loader2, Code, X } from "lucide-react";
import { Project, Section } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UtilitiesPanelProps {
  project: Project;
}

function generateFullPrompt(project: Project): string {
  const sections = [...project.sections]
    .sort((a, b) => a.order - b.order)
    .filter((s) => s.description);

  let prompt = "";

  // Global prompt
  if (project.globalPrompt.trim()) {
    prompt += `# Global Instructions\n\n${project.globalPrompt.trim()}\n\n`;
    prompt += `---\n\n`;
  }

  // Sections
  if (sections.length > 0) {
    prompt += `# Landing Page Sections\n\n`;

    sections.forEach((section, index) => {
      prompt += `## ${index + 1}. ${section.name}\n\n`;
      prompt += `${section.description.trim()}\n\n`;

      if (section.image_url || section.image_description) {
        prompt += `### Image\n`;
        if (section.image_url) {
          prompt += `- URL: ${section.image_url}\n`;
        }
        if (section.image_description) {
          prompt += `- Description: ${section.image_description}\n`;
        }
        prompt += `\n`;
      }

      if (section.style_notes) {
        prompt += `### Style\n${section.style_notes}\n\n`;
      }

      if (section.animation_notes) {
        prompt += `### Animations\n${section.animation_notes}\n\n`;
      }

      if (index < sections.length - 1) {
        prompt += `---\n\n`;
      }
    });
  }

  return prompt.trim();
}

function generateJSON(project: Project): string {
  const exportData = {
    name: project.name,
    status: project.status,
    globalPrompt: project.globalPrompt,
    sections: [...project.sections]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        name: s.name,
        type: s.type,
        description: s.description,
        imageUrl: s.image_url,
        imageDescription: s.image_description,
        styleNotes: s.style_notes,
        animationNotes: s.animation_notes,
      })),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

export function UtilitiesPanel({ project }: UtilitiesPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPrompt = useMemo(() => generateFullPrompt(project), [project]);
  const jsonExport = useMemo(() => generateJSON(project), [project]);

  const handleCopyPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullPrompt]);

  const handleCopyJSON = useCallback(async () => {
    await navigator.clipboard.writeText(jsonExport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [jsonExport]);

  const handleDownloadJSON = useCallback(() => {
    const blob = new Blob([jsonExport], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-prompt.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [jsonExport, project.name]);

  const handleDownloadMarkdown = useCallback(() => {
    const blob = new Blob([fullPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-prompt.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fullPrompt, project.name]);

  const handleGenerate = useCallback(async () => {
    if (!fullPrompt) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate");
      }

      const data = await response.json();
      setGeneratedCode(data.content);
      setShowResponseModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  }, [fullPrompt]);

  const handleCopyCode = useCallback(async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedCode]);

  const handleDownloadCode = useCallback(() => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-landing.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedCode, project.name]);

  const hasContent = fullPrompt.length > 0;

  return (
    <>
      <aside className="w-[360px] min-w-[360px] bg-background border-l border-border flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center px-4">
          <FileCode className="h-4 w-4 text-primary mr-2" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Preview
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toggle & Actions */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPrompt}
                    disabled={!hasContent}
                    className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 mr-1.5 text-secondary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Copy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy prompt to clipboard</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Preview Area */}
            <div className="flex-1 overflow-hidden">
              <Textarea
                value={hasContent ? fullPrompt : "Add content to see preview..."}
                readOnly
                className="h-full min-h-[300px] bg-card border-0 text-foreground text-sm font-mono resize-none focus:ring-0"
              />
            </div>

          {/* Generate Button - Prominent */}
          <div className="p-3 border-t border-border bg-primary/5">
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={!hasContent || isGenerating}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
            {error && (
              <p className="text-xs text-destructive mt-2 text-center">{error}</p>
            )}
          </div>
        </div>
      </aside>

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Generated Landing Page
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResponseModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {generatedCode ? (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
                  <span className="text-xs text-muted-foreground">
                    HTML / CSS Code
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-7 text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1.5 text-secondary" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1.5" />
                          Copy Code
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadCode}
                      className="h-7 text-xs"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download .html
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={generatedCode}
                  readOnly
                  className="flex-1 min-h-0 bg-card border-0 text-foreground text-sm font-mono resize-none focus:ring-0 rounded-none"
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                No code generated yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
