"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Page } from "@/lib/store";
import { useProjectStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";

interface PageDescriptionEditorProps {
  projectId: string;
  page: Page;
}

export function PageDescriptionEditor({ projectId, page }: PageDescriptionEditorProps) {
  const { updatePage } = useProjectStore();
  const [description, setDescription] = useState(page.pageDescription);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when page changes
  useEffect(() => {
    setDescription(page.pageDescription);
  }, [page.pageDescription]);

  // Debounced save
  useEffect(() => {
    if (description === page.pageDescription) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      updatePage(projectId, page.id, { pageDescription: description })
        .then(() => setIsSaving(false))
        .catch(() => setIsSaving(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [description, projectId, page.id, page.pageDescription, updatePage]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Page Description
        </h2>
        {isSaving && (
          <span className="text-xs text-primary animate-pulse">Saving...</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Describe the purpose and content of this {page.isLandingPage ? "landing page" : "page"}
      </p>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={`Describe what this ${page.isLandingPage ? "landing page" : "page"} should contain...\n\nExample:\n- Main entry point for the product\n- Focus on conversion and key benefits\n- Target audience: Small business owners`}
        className="min-h-[120px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-y focus:border-ring focus:ring-1 focus:ring-ring text-sm"
      />
    </div>
  );
}
