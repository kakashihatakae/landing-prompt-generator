"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Project, Section, ProjectInsert, SectionInsert } from "@/lib/database.types";

// Types for frontend compatibility
export interface ProjectWithSections extends Project {
  sections: Section[];
}

// Helper to convert DB project to frontend format
function formatProject(project: Project, sections: Section[] = []): ProjectWithSections {
  return {
    ...project,
    sections: sections.sort((a, b) => a.order - b.order),
  };
}

// Get all projects for the current user with their sections
export async function getProjects(): Promise<ProjectWithSections[]> {
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

  // Fetch sections for all projects
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .in("project_id", projects.map((p) => p.id));

  if (sectionsError) {
    console.error("Error fetching sections:", sectionsError);
    throw new Error("Failed to fetch sections");
  }

  // Group sections by project
  const sectionsByProject = (sections || []).reduce((acc, section) => {
    if (!acc[section.project_id]) {
      acc[section.project_id] = [];
    }
    acc[section.project_id].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  return projects.map((project) =>
    formatProject(project, sectionsByProject[project.id] || [])
  );
}

// Get a single project with its sections
export async function getProject(projectId: string): Promise<ProjectWithSections | null> {
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

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .eq("project_id", projectId)
    .order("order", { ascending: true });

  if (sectionsError) {
    console.error("Error fetching sections:", sectionsError);
    throw new Error("Failed to fetch sections");
  }

  return formatProject(project, sections || []);
}

// Create a new project with default sections
export async function createProject(name: string): Promise<ProjectWithSections> {
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

  // Create default sections
  const defaultSections: Omit<SectionInsert, "project_id">[] = [
    { name: "Hero", type: "hero", description: "", order: 0 },
    { name: "Features", type: "features", description: "", order: 1 },
    { name: "Testimonials", type: "testimonials", description: "", order: 2 },
    { name: "Pricing", type: "pricing", description: "", order: 3 },
    { name: "CTA", type: "cta", description: "", order: 4 },
    { name: "Footer", type: "footer", description: "", order: 5 },
  ];

  const sectionsWithProjectId = defaultSections.map((s) => ({
    ...s,
    project_id: project.id,
  }));

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .insert(sectionsWithProjectId)
    .select();

  if (sectionsError) {
    console.error("Error creating sections:", sectionsError);
    // Don't throw, we can still return the project
  }

  revalidatePath("/dashboard");
  return formatProject(project, sections || []);
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

// Duplicate a project with all its sections
export async function duplicateProject(projectId: string): Promise<ProjectWithSections> {
  const supabase = await createClient();
  
  // Get the original project with sections
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

  // Duplicate sections
  if (original.sections.length > 0) {
    const newSections = original.sections.map((section) => ({
      project_id: newProject.id,
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

  revalidatePath("/dashboard");
  
  // Fetch and return the duplicated project
  const duplicated = await getProject(newProject.id);
  if (!duplicated) {
    throw new Error("Failed to fetch duplicated project");
  }
  return duplicated;
}

// Create a new section
export async function createSection(
  projectId: string,
  section: Omit<SectionInsert, "project_id" | "order">
): Promise<Section> {
  const supabase = await createClient();
  
  // Get the max order for the project
  const { data: maxOrderData } = await supabase
    .from("sections")
    .select("order")
    .eq("project_id", projectId)
    .order("order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.order ?? -1) + 1;

  const { data, error } = await supabase
    .from("sections")
    .insert({
      ...section,
      project_id: projectId,
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
  updates: Partial<Omit<Section, "id" | "project_id" | "created_at" | "updated_at">>
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
      project_id: original.project_id,
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
  projectId: string,
  sectionIds: string[]
): Promise<void> {
  const supabase = await createClient();
  
  // Update each section's order
  const updates = sectionIds.map((id, index) => ({
    id,
    order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("sections")
      .update({ order: update.order })
      .eq("id", update.id)
      .eq("project_id", projectId);

    if (error) {
      console.error("Error reordering section:", error);
      throw new Error("Failed to reorder sections");
    }
  }

  revalidatePath("/dashboard");
}
