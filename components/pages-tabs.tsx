"use client";

import { useState, useCallback } from "react";
import { Plus, X, Home, FileText } from "lucide-react";
import { Page, Project } from "@/lib/store";
import { useProjectStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PagesTabsProps {
  project: Project;
}

export function PagesTabs({ project }: PagesTabsProps) {
  const { activePageId, setActivePage, addPage, deletePage } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  const sortedPages = [...project.pages].sort((a, b) => a.pageOrder - b.pageOrder);
  const activePage = sortedPages.find((p) => p.id === activePageId);

  const handleAddPage = useCallback(() => {
    if (newPageName.trim()) {
      addPage(project.id, newPageName.trim());
      setNewPageName("");
      setIsAdding(false);
    }
  }, [newPageName, project.id, addPage]);

  const handleDeletePage = useCallback((pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const page = sortedPages.find((p) => p.id === pageId);
    if (page?.isLandingPage) return; // Cannot delete landing page
    setPageToDelete(pageId);
  }, [sortedPages]);

  const confirmDelete = useCallback(() => {
    if (pageToDelete) {
      deletePage(project.id, pageToDelete);
      setPageToDelete(null);
    }
  }, [pageToDelete, project.id, deletePage]);

  return (
    <>
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-muted/30 overflow-x-auto">
        {sortedPages.map((page) => (
          <Tooltip key={page.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActivePage(page.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  activePageId === page.id
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                {page.isLandingPage ? (
                  <Home className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                <span>{page.name}</span>
                {!page.isLandingPage && (
                  <span
                    onClick={(e) => handleDeletePage(page.id, e)}
                    className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {page.isLandingPage ? "Main landing page" : `Page: ${page.name}`}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Add Page Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-background/50"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Page
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add a new page</TooltipContent>
        </Tooltip>
      </div>

      {/* Add Page Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new page for your landing site.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Page Name</label>
              <Input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="e.g., About, Pricing, Contact"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPage();
                }}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setNewPageName("");
              }}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPage}
              disabled={!newPageName.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Add Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this page? All sections on this page will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPageToDelete(null)}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
