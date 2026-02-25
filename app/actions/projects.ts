"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Project, Page, Section, ProjectInsert, PageInsert, SectionInsert } from "@/lib/database.types";

// Types for frontend compatibility
export interface PageWithSections extends Page {
  sections: Section[];
}

export interface ProjectWithPages extends Project {
  pages: PageWithSections[];
}

// Helper to convert DB data to frontend format
function formatPage(page: Page, sections: Section[] = []): PageWithSections {
  return {
    ...page,
    sections: sections.sort((a, b) => a.order - b.order),
  };
}

// Get all projects for the current user with their pages and sections
export async function getProjects(): Promise<ProjectWithPages[]> {
  const supabase = await createClient();
  
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
    throw new Error("Failed to fetch projects");
  }

  if (!projects || projects.length === 0) {
    return [];
  }

  // Fetch pages for all projects
  const { data: pages, error: pagesError } = await supabase
    .from("pages")
    .select("*")
    .in("project_id", projects.map((p) => p.id))
    .order("page_order", { ascending: true });

  if (pagesError) {
    console.error("Error fetching pages:", pagesError);
    throw new Error("Failed to fetch pages");
  }

  // Fetch sections for all pages
  const pageIds = (pages || []).map((p) => p.id);
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .in("page_id", pageIds)
    .order("order", { ascending: true });

  if (sectionsError) {
    console.error("Error fetching sections:", sectionsError);
    throw new Error("Failed to fetch sections");
  }

  // Group sections by page
  const sectionsByPage = (sections || []).reduce((acc, section) => {
    if (!acc[section.page_id]) {
      acc[section.page_id] = [];
    }
    acc[section.page_id].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  // Group pages by project
  const pagesByProject = (pages || []).reduce((acc, page) => {
    if (!acc[page.project_id]) {
      acc[page.project_id] = [];
    }
    acc[page.project_id].push(formatPage(page, sectionsByPage[page.id] || []));
    return acc;
  }, {} as Record<string, PageWithSections[]>);

  return projects.map((project) => ({
    ...project,
    pages: pagesByProject[project.id] || [],
  }));
}

// Get a single project with its pages and sections
export async function getProject(projectId: string): Promise<ProjectWithPages | null> {
  const supabase = await createClient();
  
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError) {
    console.error("Error fetching project:", projectError);
    throw new Error("Failed to fetch project");
  }

  if (!project) return null;

  const { data: pages, error: pagesError } = await supabase
    .from("pages")
    .select("*")
    .eq("project_id", projectId)
    .order("page_order", { ascending: true });

  if (pagesError) {
    console.error("Error fetching pages:", pagesError);
    throw new Error("Failed to fetch pages");
  }

  const pageIds = (pages || []).map((p) => p.id);
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .in("page_id", pageIds)
    .order("order", { ascending: true });

  if (sectionsError) {
    console.error("Error fetching sections:", sectionsError);
    throw new Error("Failed to fetch sections");
  }

  const sectionsByPage = (sections || []).reduce((acc, section) => {
    if (!acc[section.page_id]) {
      acc[section.page_id] = [];
    }
    acc[section.page_id].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  return {
    ...project,
    pages: (pages || []).map((page) => formatPage(page, sectionsByPage[page.id] || [])),
  };
}

// Create a new project with a landing page and default sections
export async function createProject(name: string): Promise<ProjectWithPages> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      status: "draft",
      global_prompt: "",
    })
    .select()
    .single();

  if (projectError) {
    console.error("Error creating project:", projectError);
    throw new Error("Failed to create project");
  }

  // Create landing page
  const { data: landingPage, error: pageError } = await supabase
    .from("pages")
    .insert({
      project_id: project.id,
      name: "Landing Page",
      description: "",
      is_landing_page: true,
      page_order: 0,
    })
    .select()
    .single();

  if (pageError) {
    console.error("Error creating landing page:", pageError);
    throw new Error("Failed to create landing page");
  }

  // Create default sections for landing page
  const defaultSections: Omit<SectionInsert, "page_id">[] = [
    { name: "Hero", type: "hero", description: "", order: 0 },
    { name: "Features", type: "features", description: "", order: 1 },
    { name: "Testimonials", type: "testimonials", description: "", order: 2 },
    { name: "Pricing", type: "pricing", description: "", order: 3 },
    { name: "CTA", type: "cta", description: "", order: 4 },
    { name: "Footer", type: "footer", description: "", order: 5 },
  ];

  const sectionsWithPageId = defaultSections.map((s) => ({
    ...s,
    page_id: landingPage.id,
  }));

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .insert(sectionsWithPageId)
    .select();

  if (sectionsError) {
    console.error("Error creating sections:", sectionsError);
  }

  revalidatePath("/dashboard");
  return {
    ...project,
    pages: [formatPage(landingPage, sections || [])],
  };
}

// Update a project
export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, "name" | "status" | "global_prompt">>
): Promise<Project> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }

  revalidatePath("/dashboard");
  return data;
}

// Delete a project
export async function deleteProject(projectId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }

  revalidatePath("/dashboard");
}

// Duplicate a project with all its pages and sections
export async function duplicateProject(projectId: string): Promise<ProjectWithPages> {
  const supabase = await createClient();
  
  // Get the original project with pages and sections
  const original = await getProject(projectId);
  if (!original) {
    throw new Error("Project not found");
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Create new project
  const { data: newProject, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: `${original.name} (Copy)`,
      status: original.status,
      global_prompt: original.global_prompt,
    })
    .select()
    .single();

  if (projectError) {
    console.error("Error duplicating project:", projectError);
    throw new Error("Failed to duplicate project");
  }

  // Duplicate pages and their sections
  for (const page of original.pages) {
    const { data: newPage, error: pageError } = await supabase
      .from("pages")
      .insert({
        project_id: newProject.id,
        name: page.name,
        description: page.description,
        is_landing_page: page.is_landing_page,
        page_order: page.page_order,
      })
      .select()
      .single();

    if (pageError) {
      console.error("Error duplicating page:", pageError);
      continue;
    }

    // Duplicate sections for this page
    if (page.sections.length > 0) {
      const newSections = page.sections.map((section) => ({
        page_id: newPage.id,
        name: section.name,
        type: section.type,
        description: section.description,
        image_url: section.image_url,
        image_description: section.image_description,
        style_notes: section.style_notes,
        animation_notes: section.animation_notes,
        order: section.order,
      }));

      const { error: sectionsError } = await supabase
        .from("sections")
        .insert(newSections);

      if (sectionsError) {
        console.error("Error duplicating sections:", sectionsError);
      }
    }
  }

  revalidatePath("/dashboard");
  
  // Fetch and return the duplicated project
  const duplicated = await getProject(newProject.id);
  if (!duplicated) {
    throw new Error("Failed to fetch duplicated project");
  }
  return duplicated;
}

// ==================== PAGE ACTIONS ====================

// Create a new page
export async function createPage(
  projectId: string,
  name: string
): Promise<PageWithSections> {
  const supabase = await createClient();
  
  // Get the max page_order for the project
  const { data: maxOrderData } = await supabase
    .from("pages")
    .select("page_order")
    .eq("project_id", projectId)
    .order("page_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.page_order ?? -1) + 1;

  const { data: page, error } = await supabase
    .from("pages")
    .insert({
      project_id: projectId,
      name,
      description: "",
      is_landing_page: false,
      page_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating page:", error);
    throw new Error("Failed to create page");
  }

  revalidatePath("/dashboard");
  return formatPage(page, []);
}

// Update a page
export async function updatePage(
  pageId: string,
  updates: Partial<Pick<Page, "name" | "description" | "page_order">>
): Promise<Page> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("pages")
    .update(updates)
    .eq("id", pageId)
    .select()
    .single();

  if (error) {
    console.error("Error updating page:", error);
    throw new Error("Failed to update page");
  }

  revalidatePath("/dashboard");
  return data;
}

// Delete a page (cannot delete landing page)
export async function deletePage(pageId: string): Promise<void> {
  const supabase = await createClient();
  
  // Check if it's a landing page
  const { data: page } = await supabase
    .from("pages")
    .select("is_landing_page")
    .eq("id", pageId)
    .single();

  if (page?.is_landing_page) {
    throw new Error("Cannot delete the landing page");
  }

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", pageId);

  if (error) {
    console.error("Error deleting page:", error);
    throw new Error("Failed to delete page");
  }

  revalidatePath("/dashboard");
}

// Reorder pages
export async function reorderPages(
  projectId: string,
  pageIds: string[]
): Promise<void> {
  const supabase = await createClient();
  
  const updates = pageIds.map((id, index) => ({
    id,
    page_order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("pages")
      .update({ page_order: update.page_order })
      .eq("id", update.id)
      .eq("project_id", projectId);

    if (error) {
      console.error("Error reordering page:", error);
      throw new Error("Failed to reorder pages");
    }
  }

  revalidatePath("/dashboard");
}

// ==================== SECTION ACTIONS ====================

// Create a new section
export async function createSection(
  pageId: string,
  section: Omit<SectionInsert, "page_id" | "order">
): Promise<Section> {
  const supabase = await createClient();
  
  // Get the max order for the page
  const { data: maxOrderData } = await supabase
    .from("sections")
    .select("order")
    .eq("page_id", pageId)
    .order("order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.order ?? -1) + 1;

  const { data, error } = await supabase
    .from("sections")
    .insert({
      ...section,
      page_id: pageId,
      order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating section:", error);
    throw new Error("Failed to create section");
  }

  revalidatePath("/dashboard");
  return data;
}

// Update a section
export async function updateSection(
  sectionId: string,
  updates: Partial<Omit<Section, "id" | "page_id" | "created_at" | "updated_at">>
): Promise<Section> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("sections")
    .update(updates)
    .eq("id", sectionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating section:", error);
    throw new Error("Failed to update section");
  }

  revalidatePath("/dashboard");
  return data;
}

// Delete a section
export async function deleteSection(sectionId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", sectionId);

  if (error) {
    console.error("Error deleting section:", error);
    throw new Error("Failed to delete section");
  }

  revalidatePath("/dashboard");
}

// Duplicate a section
export async function duplicateSection(sectionId: string): Promise<Section> {
  const supabase = await createClient();
  
  // Get the original section
  const { data: original, error: fetchError } = await supabase
    .from("sections")
    .select("*")
    .eq("id", sectionId)
    .single();

  if (fetchError || !original) {
    console.error("Error fetching section:", fetchError);
    throw new Error("Section not found");
  }

  // Create duplicate
  const { data, error } = await supabase
    .from("sections")
    .insert({
      page_id: original.page_id,
      name: `${original.name} (Copy)`,
      type: original.type,
      description: original.description,
      image_url: original.image_url,
      image_description: original.image_description,
      style_notes: original.style_notes,
      animation_notes: original.animation_notes,
      order: original.order + 1,
    })
    .select()
    .single();

  if (error) {
    console.error("Error duplicating section:", error);
    throw new Error("Failed to duplicate section");
  }

  revalidatePath("/dashboard");
  return data;
}

// Reorder sections
export async function reorderSections(
  pageId: string,
  sectionIds: string[]
): Promise<void> {
  const supabase = await createClient();
  
  const updates = sectionIds.map((id, index) => ({
    id,
    order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("sections")
      .update({ order: update.order })
      .eq("id", update.id)
      .eq("page_id", pageId);

    if (error) {
      console.error("Error reordering section:", error);
      throw new Error("Failed to reorder sections");
    }
  }

  revalidatePath("/dashboard");
}
