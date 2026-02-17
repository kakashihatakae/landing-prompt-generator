"use client";

import { useEffect, Suspense } from "react";
import { useProjectStore } from "@/lib/store";
import { ProjectSidebar } from "@/components/project-sidebar";
import { ProjectEditor } from "@/components/project-editor";
import { EmptyState } from "@/components/empty-state";
import { DashboardHeader } from "./dashboard-header";

interface DashboardContentProps {
  userEmail?: string;
}

function DashboardInner({ userEmail }: DashboardContentProps) {
  const { projects, activeProjectId, setActiveProject, loadProjects, isLoading, error } = useProjectStore();

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Set first project as active on initial load
  useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProject(projects[0].id);
    }
  }, [activeProjectId, projects, setActiveProject]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar - Projects */}
      <ProjectSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex min-w-0">
        {activeProject ? (
          <ProjectEditor project={activeProject} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

export function DashboardContent({ userEmail }: DashboardContentProps) {
  return (
    <>
      <DashboardHeader userEmail={userEmail} />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardInner userEmail={userEmail} />
      </Suspense>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-[280px] min-w-[280px] bg-background border-r border-border" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </main>
    </div>
  );
}
