"use client";

import { FileText, Plus } from "lucide-react";
import { useProjectStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function EmptyState() {
  const { createProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleCreate = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Select or Create a Project
        </h2>
        <p className="text-muted-foreground mb-6">
          Choose a project from the sidebar or create a new one to start building your landing page prompt.
        </p>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Create New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter a name for your new landing page prompt project.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., SaaS Landing Page"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName("");
                }}
                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newProjectName.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
