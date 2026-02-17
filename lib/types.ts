export type SectionType = 
  | 'hero' 
  | 'features' 
  | 'testimonials' 
  | 'pricing' 
  | 'cta' 
  | 'footer' 
  | 'custom';

export interface Section {
  id: string;
  name: string;
  type: SectionType;
  description: string;
  imageUrl?: string;
  imageDescription?: string;
  styleNotes?: string;
  animationNotes?: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  status: 'draft' | 'ready';
  globalPrompt: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  
  // Project actions
  createProject: (name: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  
  // Section actions
  addSection: (projectId: string, section: Omit<Section, 'id' | 'order'>) => void;
  updateSection: (projectId: string, sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (projectId: string, sectionId: string) => void;
  duplicateSection: (projectId: string, sectionId: string) => void;
  reorderSections: (projectId: string, sectionIds: string[]) => void;
}

export const DEFAULT_SECTIONS: Omit<Section, 'id' | 'order'>[] = [
  {
    name: 'Hero',
    type: 'hero',
    description: '',
  },
  {
    name: 'Features',
    type: 'features',
    description: '',
  },
  {
    name: 'Testimonials',
    type: 'testimonials',
    description: '',
  },
  {
    name: 'Pricing',
    type: 'pricing',
    description: '',
  },
  {
    name: 'CTA',
    type: 'cta',
    description: '',
  },
  {
    name: 'Footer',
    type: 'footer',
    description: '',
  },
];

export const SECTION_TEMPLATES: Record<SectionType, { name: string; description: string }> = {
  hero: {
    name: 'Hero',
    description: 'Main landing section with headline, subheadline, and primary CTA',
  },
  features: {
    name: 'Features',
    description: 'Showcase key product features with icons and descriptions',
  },
  testimonials: {
    name: 'Testimonials',
    description: 'Social proof section with customer quotes and avatars',
  },
  pricing: {
    name: 'Pricing',
    description: 'Pricing tiers and plans comparison',
  },
  cta: {
    name: 'CTA',
    description: 'Call-to-action section for conversion',
  },
  footer: {
    name: 'Footer',
    description: 'Links, copyright, and additional information',
  },
  custom: {
    name: 'Custom Section',
    description: 'Define your own section type',
  },
};
