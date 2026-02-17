"use client";

import { create } from "zustand";
import type { Project, Section } from "@/lib/database.types";
import type { ProjectWithSections } from "@/app/actions/projects";
import {
  getProjects,
  createProject as createProjectAction,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
  duplicateProject as duplicateProjectAction,
  createSection as createSectionAction,
  updateSection as updateSectionAction,
  deleteSection as deleteSectionAction,
  duplicateSection as duplicateSectionAction,
  reorderSections as reorderSectionsAction,
} from "@/app/actions/projects";

// Frontend-compatible types
export interface FrontendSection extends Omit<Section, "created_at" | "updated_at"> {
  createdAt: number;
  updatedAt: number;
}

export interface FrontendProject extends Omit<Project, "created_at" | "updated_at" | "global_prompt"> {
  globalPrompt: string;
  createdAt: number;
  updatedAt: number;
  sections: FrontendSection[];
}

// Pending changes tracking
export interface PendingChanges {
  globalPrompt?: string;
  sections?: Map<string, Partial<FrontendSection>>;
}

// Helper to convert DB types to frontend types
function toFrontendSection(section: Section): FrontendSection {
  return {
    ...section,
    createdAt: new Date(section.created_at).getTime(),
    updatedAt: new Date(section.updated_at).getTime(),
  };
}

function toFrontendProject(project: ProjectWithSections): FrontendProject {
  return {
    ...project,
    globalPrompt: project.global_prompt,
    createdAt: new Date(project.created_at).getTime(),
    updatedAt: new Date(project.updated_at).getTime(),
    sections: project.sections.map(toFrontendSection),
  };
}

// Input type for adding a section (without auto-generated fields)
export interface AddSectionInput {
  name: string;
  type: Section["type"];
  description?: string;
  image_url?: string | null;
  image_description?: string | null;
  style_notes?: string | null;
  animation_notes?: string | null;
}

interface ProjectStore {
  projects: FrontendProject[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  lastSavedAt: number | null;
  hasUnsavedChanges: boolean;
  pendingChanges: Map<string, PendingChanges>;

  // Loading
  loadProjects: () => Promise<void>;
  
  // Project actions
  createProject: (name: string) => Promise<string>;
  updateProject: (id: string, updates: Partial<Pick<FrontendProject, "name" | "status" | "globalPrompt">>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;
  
  // Section actions
  addSection: (projectId: string, section: AddSectionInput) => Promise<void>;
  updateSection: (projectId: string, sectionId: string, updates: Partial<Omit<FrontendSection, "id" | "project_id" | "createdAt" | "updatedAt">>) => Promise<void>;
  deleteSection: (projectId: string, sectionId: string) => Promise<void>;
  duplicateSection: (projectId: string, sectionId: string) => Promise<void>;
  reorderSections: (projectId: string, sectionIds: string[]) => Promise<void>;
  
  // Save actions
  saveProject: (projectId: string) => Promise<void>;
  markUnsaved: (projectId: string, changes: Partial<PendingChanges>) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,
  error: null,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  pendingChanges: new Map(),

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await getProjects();
      set({ 
        projects: projects.map(toFrontendProject),
        isLoading: false,
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
      });
      // Set first project as active if none selected
      const { activeProjectId } = get();
      if (!activeProjectId && projects.length > 0) {
        set({ activeProjectId: projects[0].id });
      }
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to load projects",
        isLoading: false,
      });
    }
  },

  createProject: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const newProject = await createProjectAction(name);
      const frontendProject = toFrontendProject(newProject);
      set((state) => ({
        projects: [frontendProject, ...state.projects],
        activeProjectId: newProject.id,
        isLoading: false,
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
      }));
      return newProject.id;
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to create project",
        isLoading: false,
      });
      throw err;
    }
  },

  updateProject: async (id: string, updates) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: Date.now() }
          : p
      ),
      hasUnsavedChanges: true,
    }));
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProjectAction(id);
      set((state) => {
        const newProjects = state.projects.filter((p) => p.id !== id);
        return {
          projects: newProjects,
          activeProjectId:
            state.activeProjectId === id
              ? newProjects[0]?.id || null
              : state.activeProjectId,
          isLoading: false,
        };
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to delete project",
        isLoading: false,
      });
      throw err;
    }
  },

  duplicateProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const duplicated = await duplicateProjectAction(id);
      const frontendProject = toFrontendProject(duplicated);
      set((state) => ({
        projects: [frontendProject, ...state.projects],
        activeProjectId: duplicated.id,
        isLoading: false,
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to duplicate project",
        isLoading: false,
      });
      throw err;
    }
  },

  setActiveProject: (id: string | null) => {
    set({ activeProjectId: id });
  },

  addSection: async (projectId, section) => {
    set({ isLoading: true, error: null });
    try {
      await createSectionAction(projectId, section);
      // Reload projects to get the new section
      const projects = await getProjects();
      set({
        projects: projects.map(toFrontendProject),
        isLoading: false,
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to add section",
        isLoading: false,
      });
      throw err;
    }
  },

  updateSection: async (projectId, sectionId, updates) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              updatedAt: Date.now(),
              sections: p.sections.map((s) =>
                s.id === sectionId ? { ...s, ...updates } : s
              ),
            }
          : p
      ),
      hasUnsavedChanges: true,
    }));
  },

  deleteSection: async (projectId, sectionId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSectionAction(sectionId);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                updatedAt: Date.now(),
                sections: p.sections
                  .filter((s) => s.id !== sectionId)
                  .map((s, index) => ({ ...s, order: index })),
              }
            : p
        ),
        isLoading: false,
        hasUnsavedChanges: true,
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to delete section",
        isLoading: false,
      });
      throw err;
    }
  },

  duplicateSection: async (projectId, sectionId) => {
    set({ isLoading: true, error: null });
    try {
      await duplicateSectionAction(sectionId);
      // Reload projects to get the duplicated section
      const projects = await getProjects();
      set({
        projects: projects.map(toFrontendProject),
        isLoading: false,
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to duplicate section",
        isLoading: false,
      });
      throw err;
    }
  },

  reorderSections: async (projectId, sectionIds) => {
    set({ isLoading: true, error: null });
    try {
      await reorderSectionsAction(projectId, sectionIds);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                updatedAt: Date.now(),
                sections: sectionIds
                  .map((id) => p.sections.find((s) => s.id === id))
                  .filter((s): s is FrontendSection => s !== undefined)
                  .map((s, index) => ({ ...s, order: index })),
              }
            : p
        ),
        isLoading: false,
        hasUnsavedChanges: true,
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to reorder sections",
        isLoading: false,
      });
      throw err;
    }
  },

  saveProject: async (projectId: string) => {
    const state = get();
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return;

    set({ isLoading: true });
    try {
      // Save the entire project state
      await updateProjectAction(projectId, {
        name: project.name,
        status: project.status,
        global_prompt: project.globalPrompt,
      });

      // Save all sections
      for (const section of project.sections) {
        await updateSectionAction(section.id, {
          name: section.name,
          type: section.type,
          description: section.description,
          image_url: section.image_url,
          image_description: section.image_description,
          style_notes: section.style_notes,
          animation_notes: section.animation_notes,
          order: section.order,
        });
      }

      set({
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to save project",
        isLoading: false,
      });
      throw err;
    }
  },

  markUnsaved: (projectId: string, changes: Partial<PendingChanges>) => {
    set((state) => {
      const pending = new Map(state.pendingChanges);
      const existing = pending.get(projectId) || {};
      pending.set(projectId, { ...existing, ...changes });
      return {
        pendingChanges: pending,
        hasUnsavedChanges: true,
      };
    });
  },
}));
