// Re-export from the Supabase-backed store
export { useProjectStore } from "./store-supabase";
export type { 
  FrontendProject as Project, 
  FrontendSection as Section, 
  AddSectionInput,
  PendingChanges 
} from "./store-supabase";

// Re-export types from types.ts for backward compatibility
export type { SectionType, ProjectStore } from "./types";
export { DEFAULT_SECTIONS, SECTION_TEMPLATES } from "./types";
