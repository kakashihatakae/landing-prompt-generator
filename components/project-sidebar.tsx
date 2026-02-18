"use client";

import { useState, useCallback } from "react";
import { Plus, MoreHorizontal, FileText, Circle, Edit2, Copy, Trash2, Check, X } from "lucide-react";
import { useProjectStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ProjectSidebar() {
  const { projects, activeProjectId, setActiveProject, createProject, updateProject, deleteProject, duplicateProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateProject = useCallback(() => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName("");
      setIsCreating(false);
    }
  }, [newProjectName, createProject]);

  const handleStartEdit = useCallback((project: { id: string; name: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditingName(project.name);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingId && editingName.trim()) {
      updateProject(editingId, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
    }
  }, [editingId, editingName, updateProject]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);

  const handleDuplicate = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateProject(id);
  }, [duplicateProject]);

  const handleDelete = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    deleteProject(id);
    setDeletingId(null);
  }, [deleteProject]);

  return (
    <aside className="w-[280px] min-w-[280px] bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Projects
          </h2>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
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
                      if (e.key === "Enter") handleCreateProject();
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
                    onClick={handleCreateProject}
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
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto py-2">
        {projects.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="space-y-0.5 px-2">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-150 ${
                  activeProjectId === project.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted border border-transparent"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 ${
                    activeProjectId === project.id ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  {editingId === project.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-7 text-sm bg-background border-border text-foreground px-2 py-0"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-secondary hover:text-secondary hover:bg-secondary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <span
                      className={`text-sm truncate block ${
                        activeProjectId === project.id
                          ? "text-foreground font-medium"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {project.name}
                    </span>
                  )}
                </div>

                {/* Actions Menu */}
                {editingId !== project.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40"
                    >
                      <DropdownMenuItem
                        onClick={(e) => handleStartEdit(project, e as unknown as React.MouseEvent)}
                        className="text-muted-foreground focus:text-foreground focus:bg-muted cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDuplicate(project.id, e as unknown as React.MouseEvent)}
                        className="text-muted-foreground focus:text-foreground focus:bg-muted cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(project.id);
                        }}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingId(null)}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
