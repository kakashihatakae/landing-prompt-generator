"use client";

import { useState, useCallback } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import { Project, Section, SECTION_TEMPLATES, SectionType } from "@/lib/store";
import { useProjectStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/section-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SectionBuilderProps {
  project: Project;
}

export function SectionBuilder({ project }: SectionBuilderProps) {
  const { addSection } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedType, setSelectedType] = useState<SectionType>("custom");

  const sortedSections = [...project.sections].sort((a, b) => a.order - b.order);

  const handleAddSection = useCallback(() => {
    if (newSectionName.trim()) {
      addSection(project.id, {
        name: newSectionName.trim(),
        type: selectedType,
        description: "",
      });
      setNewSectionName("");
      setSelectedType("custom");
      setIsAdding(false);
    }
  }, [newSectionName, selectedType, project.id, addSection]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Sections
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-card text-muted-foreground border border-border">
              {sortedSections.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Define each section of your landing page
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Section
        </Button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sortedSections.length === 0 ? (
          <div className="text-center py-12 px-6 border-2 border-dashed border-border rounded-xl">
            <LayoutGrid className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No sections yet
            </p>
            <p className="text-xs text-muted-foreground/60 mb-4">
              Add your first section to start building your prompt
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Section
            </Button>
          </div>
        ) : (
          sortedSections.map((section) => (
            <SectionCard
              key={section.id}
              projectId={project.id}
              section={section}
            />
          ))
        )}
      </div>

      {/* Add Section Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose a template or create a custom section.
            </DialogDescription>
          </DialogHeader>

          {/* Template Selection */}
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SECTION_TEMPLATES) as SectionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    if (type !== "custom") {
                      setNewSectionName(SECTION_TEMPLATES[type].name);
                    }
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedType === type
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground capitalize">
                    {SECTION_TEMPLATES[type].name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {SECTION_TEMPLATES[type].description}
                  </div>
                </button>
              ))}
            </div>

            {/* Section Name Input */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Section Name</label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g., Hero Section"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSection();
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
                setNewSectionName("");
                setSelectedType("custom");
              }}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSection}
              disabled={!newSectionName.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
