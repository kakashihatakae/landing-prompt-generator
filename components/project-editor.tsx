"use client";

import { useEffect, useCallback, useState } from "react";
import { Save, Check, Clock, AlertCircle } from "lucide-react";
import { Project, useProjectStore } from "@/lib/store";
import { GlobalPromptEditor } from "@/components/global-prompt-editor";
import { SectionBuilder } from "@/components/section-builder";
import { UtilitiesPanel } from "@/components/utilities-panel";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectEditorProps {
  project: Project;
}

function formatLastSaved(timestamp: number | null): string {
  if (!timestamp) return "Never saved";
  
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60000) {
    return "Just now";
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  return new Date(timestamp).toLocaleDateString();
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  const { saveProject, lastSavedAt, hasUnsavedChanges, isLoading } = useProjectStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedCheck, setShowSavedCheck] = useState(false);

  // Manual save handler
  const handleSave = useCallback(async () => {
    if (isSaving || isLoading) return;
    
    setIsSaving(true);
    try {
      await saveProject(project.id);
      setShowSavedCheck(true);
      setTimeout(() => setShowSavedCheck(false), 2000);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  }, [project.id, saveProject, isSaving, isLoading]);

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        handleSave();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, handleSave]);

  // Save on Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className="flex-1 flex min-w-0 bg-background">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background">
          <div className="flex items-center min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">
              {project.name}
            </h1>
            <span
              className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                project.status === "ready"
                  ? "bg-secondary/10 text-secondary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {project.status === "ready" ? "Ready" : "Draft"}
            </span>
            
            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <span className="ml-3 flex items-center gap-1 text-xs text-amber-500 shrink-0">
                <AlertCircle className="h-3.5 w-3.5" />
                Unsaved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Last saved timestamp */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last saved: {formatLastSaved(lastSavedAt)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {lastSavedAt ? new Date(lastSavedAt).toLocaleString() : "Never saved"}
              </TooltipContent>
            </Tooltip>

            {/* Save button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || isLoading || !hasUnsavedChanges}
                  className="h-8 gap-1.5"
                >
                  {showSavedCheck ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      {isSaving ? "Saving..." : "Save"}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasUnsavedChanges ? "Save changes (Ctrl+S)" : "All changes saved"}
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {/* Global Prompt Editor */}
            <GlobalPromptEditor project={project} />

            {/* Section Builder */}
            <SectionBuilder project={project} />
          </div>
        </div>
      </div>

      {/* Right Utilities Panel */}
      <UtilitiesPanel project={project} />
    </div>
  );
}
