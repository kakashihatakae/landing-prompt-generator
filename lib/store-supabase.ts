"use client";

import { create } from "zustand";
import type { Project, Page, Section } from "@/lib/database.types";
import type { ProjectWithPages, PageWithSections } from "@/app/actions/projects";
import {
  getProjects,
  createProject as createProjectAction,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
  duplicateProject as duplicateProjectAction,
  createPage as createPageAction,
  updatePage as updatePageAction,
  deletePage as deletePageAction,
  reorderPages as reorderPagesAction,
  createSection as createSectionAction,
  updateSection as updateSectionAction,
  deleteSection as deleteSectionAction,
  duplicateSection as duplicateSectionAction,
  reorderSections as reorderSectionsAction,
} from "@/app/actions/projects";

// Frontend-compatible types
export interface FrontendSection {
  id: string;
  pageId: string;
  name: string;
  type: Section["type"];
  description: string;
  imageUrl: string | null;
  imageDescription: string | null;
  styleNotes: string | null;
  animationNotes: string | null;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface FrontendPage {
  id: string;
  projectId: string;
  name: string;
  pageDescription: string;
  isLandingPage: boolean;
  pageOrder: number;
  createdAt: number;
  updatedAt: number;
  sections: FrontendSection[];
}

export interface FrontendProject {
  id: string;
  user_id: string;
  name: string;
  status: Project["status"];
  globalPrompt: string;
  createdAt: number;
  updatedAt: number;
  pages: FrontendPage[];
}

// Pending changes tracking
export interface PendingChanges {
  globalPrompt?: string;
  sections?: Map<string, Partial<FrontendSection>>;
}

// Helper to convert DB types to frontend types
function toFrontendSection(section: Section): FrontendSection {
  return {
    id: section.id,
    pageId: section.page_id,
    name: section.name,
    type: section.type,
    description: section.description,
    imageUrl: section.image_url,
    imageDescription: section.image_description,
    styleNotes: section.style_notes,
    animationNotes: section.animation_notes,
    order: section.order,
    createdAt: new Date(section.created_at).getTime(),
    updatedAt: new Date(section.updated_at).getTime(),
  };
}

function toFrontendPage(page: PageWithSections): FrontendPage {
  return {
    id: page.id,
    projectId: page.project_id,
    name: page.name,
    pageDescription: page.description,
    isLandingPage: page.is_landing_page,
    pageOrder: page.page_order,
    createdAt: new Date(page.created_at).getTime(),
    updatedAt: new Date(page.updated_at).getTime(),
    sections: (page.sections || []).map(toFrontendSection),
  };
}

function toFrontendProject(project: ProjectWithPages): FrontendProject {
  return {
    id: project.id,
    user_id: project.user_id,
    name: project.name,
    status: project.status,
    globalPrompt: project.global_prompt,
    createdAt: new Date(project.created_at).getTime(),
    updatedAt: new Date(project.updated_at).getTime(),
    pages: (project.pages || []).map(toFrontendPage),
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
  activePageId: string | null;
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
  
  // Page actions
  addPage: (projectId: string, name: string) => Promise<void>;
  updatePage: (projectId: string, pageId: string, updates: Partial<Pick<FrontendPage, "name" | "pageDescription">>) => Promise<void>;
  deletePage: (projectId: string, pageId: string) => Promise<void>;
  reorderPages: (projectId: string, pageIds: string[]) => Promise<void>;
  setActivePage: (id: string | null) => void;
  
  // Section actions
  addSection: (projectId: string, pageId: string, section: AddSectionInput) => Promise<void>;
  updateSection: (projectId: string, pageId: string, sectionId: string, updates: Partial<Omit<FrontendSection, "id" | "page_id" | "createdAt" | "updatedAt">>) => Promise<void>;
  deleteSection: (projectId: string, pageId: string, sectionId: string) => Promise<void>;
  duplicateSection: (projectId: string, pageId: string, sectionId: string) => Promise<void>;
  reorderSections: (projectId: string, pageId: string, sectionIds: string[]) => Promise<void>;
  
  // Save actions
  saveProject: (projectId: string) => Promise<void>;
  markUnsaved: (projectId: string, changes: Partial<PendingChanges>) => void;
  
  // Getters
  getActiveProject: () => FrontendProject | undefined;
  getActivePage: () => FrontendPage | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  activePageId: null,
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
        const firstProject = projects[0];
        set({ 
          activeProjectId: firstProject.id,
          activePageId: firstProject.pages[0]?.id || null,
        });
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
        activePageId: frontendProject.pages[0]?.id || null,
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
        const newActiveProjectId = state.activeProjectId === id
          ? newProjects[0]?.id || null
          : state.activeProjectId;
        const newActivePage = newProjects.find(p => p.id === newActiveProjectId)?.pages[0];
        return {
          projects: newProjects,
          activeProjectId: newActiveProjectId,
          activePageId: newActivePage?.id || null,
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
        activePageId: frontendProject.pages[0]?.id || null,
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
    const project = get().projects.find((p) => p.id === id);
    set({ 
      activeProjectId: id,
      activePageId: project?.pages[0]?.id || null,
    });
  },

  // ==================== PAGE ACTIONS ====================

  addPage: async (projectId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const newPage = await createPageAction(projectId, name);
      const frontendPage = toFrontendPage(newPage);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, pages: [...p.pages, frontendPage], updatedAt: Date.now() }
            : p
        ),
        activePageId: newPage.id,
        isLoading: false,
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to add page",
        isLoading: false,
      });
      throw err;
    }
  },

  updatePage: async (projectId: string, pageId: string, updates) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              updatedAt: Date.now(),
              pages: p.pages.map((page) =>
                page.id === pageId ? { ...page, ...updates } : page
              ),
            }
          : p
      ),
      hasUnsavedChanges: true,
    }));
  },

  deletePage: async (projectId: string, pageId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deletePageAction(pageId);
      set((state) => {
        const project = state.projects.find((p) => p.id === projectId);
        const remainingPages = project?.pages.filter((p) => p.id !== pageId) || [];
        return {
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, pages: remainingPages, updatedAt: Date.now() }
              : p
          ),
          activePageId: state.activePageId === pageId
            ? remainingPages[0]?.id || null
            : state.activePageId,
          isLoading: false,
        };
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to delete page",
        isLoading: false,
      });
      throw err;
    }
  },

  reorderPages: async (projectId: string, pageIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await reorderPagesAction(projectId, pageIds);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                updatedAt: Date.now(),
                pages: pageIds
                  .map((id) => p.pages.find((page) => page.id === id))
                  .filter((page): page is FrontendPage => page !== undefined)
                  .map((page, index) => ({ ...page, order: index })),
              }
            : p
        ),
        isLoading: false,
        hasUnsavedChanges: true,
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to reorder pages",
        isLoading: false,
      });
      throw err;
    }
  },

  setActivePage: (id: string | null) => {
    set({ activePageId: id });
  },

  // ==================== SECTION ACTIONS ====================

  addSection: async (projectId: string, pageId: string, section) => {
    set({ isLoading: true, error: null });
    try {
      await createSectionAction(pageId, section);
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

  updateSection: async (projectId: string, pageId: string, sectionId: string, updates) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              updatedAt: Date.now(),
              pages: p.pages.map((page) =>
                page.id === pageId
                  ? {
                      ...page,
                      sections: page.sections.map((s) =>
                        s.id === sectionId ? { ...s, ...updates } : s
                      ),
                    }
                  : page
              ),
            }
          : p
      ),
      hasUnsavedChanges: true,
    }));
  },

  deleteSection: async (projectId: string, pageId: string, sectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSectionAction(sectionId);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                updatedAt: Date.now(),
                pages: p.pages.map((page) =>
                  page.id === pageId
                    ? {
                        ...page,
                        sections: page.sections
                          .filter((s) => s.id !== sectionId)
                          .map((s, index) => ({ ...s, order: index })),
                      }
                    : page
                ),
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

  duplicateSection: async (projectId: string, pageId: string, sectionId: string) => {
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

  reorderSections: async (projectId: string, pageId: string, sectionIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await reorderSectionsAction(pageId, sectionIds);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                updatedAt: Date.now(),
                pages: p.pages.map((page) =>
                  page.id === pageId
                    ? {
                        ...page,
                        sections: sectionIds
                          .map((id) => page.sections.find((s) => s.id === id))
                          .filter((s): s is FrontendSection => s !== undefined)
                          .map((s, index) => ({ ...s, order: index })),
                      }
                    : page
                ),
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
      // Save the project metadata
      await updateProjectAction(projectId, {
        name: project.name,
        status: project.status,
        global_prompt: project.globalPrompt,
      });

      // Save all pages and their sections
      for (const page of project.pages) {
        // Update page metadata
        await updatePageAction(page.id, { name: page.name, description: page.pageDescription });
        
        // Save all sections
        for (const section of page.sections) {
          await updateSectionAction(section.id, {
            name: section.name,
            type: section.type,
            description: section.description,
            image_url: section.imageUrl,
            image_description: section.imageDescription,
            style_notes: section.styleNotes,
            animation_notes: section.animationNotes,
            order: section.order,
          });
        }
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

  getActiveProject: () => {
    const { projects, activeProjectId } = get();
    return projects.find((p) => p.id === activeProjectId);
  },

  getActivePage: () => {
    const project = get().getActiveProject();
    const { activePageId } = get();
    return project?.pages.find((p) => p.id === activePageId);
  },
}));
