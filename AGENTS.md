# Landing Page Prompt Generator

A Next.js application for creating structured, high-quality prompts that generate production-grade landing pages via AI (Claude Code / Kimi Code). Features project-based organization, section management, and AI-powered prompt generation.

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript 5+ |
| React | React 19 |
| Styling | Tailwind CSS 3.4 |
| UI Components | shadcn/ui (New York style) |
| Authentication | Supabase Auth with `@supabase/ssr` |
| State Management | Zustand |
| Database | Supabase (PostgreSQL) |
| AI Integration | OpenAI API (GPT-4o) |
| Analytics | Vercel Analytics |
| Icons | Lucide React |
| Theming | next-themes (dark/light/system) |
| Linting | ESLint 9 with Next.js configs |

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── projects.ts           # CRUD operations for projects/sections
│   ├── api/                      # API Routes
│   │   └── generate/             # OpenAI prompt generation endpoint
│   │       └── route.ts
│   ├── auth/                     # Authentication routes
│   │   ├── confirm/route.ts      # Email confirmation handler
│   │   ├── error/page.tsx        # Auth error page
│   │   ├── forgot-password/      # Password reset request
│   │   ├── login/                # Login page
│   │   ├── sign-up/              # Registration page
│   │   ├── sign-up-success/      # Post-registration message
│   │   └── update-password/      # Password update after reset
│   ├── dashboard/                # Main application dashboard
│   │   ├── dashboard-content.tsx # Client-side dashboard logic
│   │   ├── dashboard-header.tsx  # Dashboard header with nav
│   │   ├── layout.tsx            # Protected dashboard layout
│   │   └── page.tsx              # Dashboard entry point
│   ├── globals.css               # Global styles + CSS variables
│   ├── layout.tsx                # Root layout with ThemeProvider
│   ├── page.tsx                  # Landing/marketing page
│   └── favicon.ico
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   ├── tutorial/                 # Tutorial/step components
│   ├── auth-button.tsx           # Auth state button (server)
│   ├── empty-state.tsx           # Empty project state
│   ├── env-var-warning.tsx       # Missing env vars warning
│   ├── forgot-password-form.tsx  # Password reset form
│   ├── global-prompt-editor.tsx  # Global prompt text editor
│   ├── hero.tsx                  # Landing hero section
│   ├── login-form.tsx            # Login form (client)
│   ├── logout-button.tsx         # Logout button (client)
│   ├── pages-tabs.tsx            # Page tab navigation
│   ├── project-editor.tsx        # Main project editing interface
│   ├── project-sidebar.tsx       # Project list sidebar
│   ├── section-builder.tsx       # Section management UI
│   ├── section-card.tsx          # Individual section display
│   ├── sign-up-form.tsx          # Registration form
│   ├── supabase-logo.tsx         # Supabase branding
│   ├── theme-provider.tsx        # Theme context provider
│   ├── theme-switcher.tsx        # Theme toggle component
│   ├── theme-toggle.tsx          # Alternative theme toggle
│   ├── update-password-form.tsx  # Password update form
│   └── utilities-panel.tsx       # Generate/Export utilities
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client factory
│   │   ├── proxy.ts              # Session update logic
│   │   └── server.ts             # Server client factory
│   ├── database.types.ts         # Supabase-generated DB types
│   ├── store.ts                  # Store re-exports (backward compat)
│   ├── store-supabase.ts         # Zustand store with Supabase sync
│   ├── system-prompt.ts          # OpenAI system prompt template
│   ├── types.ts                  # Frontend type definitions
│   └── utils.ts                  # Utility functions (cn, hasEnvVars)
├── proxy.ts                      # Next.js Proxy handler (auth middleware)
├── components.json               # shadcn/ui configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
└── eslint.config.mjs             # ESLint configuration
```

## Build and Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key

# OpenAI (Required for generation)
NEXT_OPENAI_API_KEY=sk-...
```

Get Supabase values from your project settings > API.
Get OpenAI API key from https://platform.openai.com/api-keys

## Authentication Architecture

### Supabase Client Types

1. **Browser Client** (`lib/supabase/client.ts`)
   - For Client Components ("use client")
   - Uses `createBrowserClient` from `@supabase/ssr`

2. **Server Client** (`lib/supabase/server.ts`)
   - For Server Components and Server Actions
   - Uses `createServerClient` with cookie handling
   - Must create a new instance per function

3. **Proxy Session** (`lib/supabase/proxy.ts`)
   - Handles session refresh via Next.js Proxy
   - Runs on the edge, updates cookies automatically

### Authentication Flow

1. **Sign Up**: User submits email/password → Supabase sends confirmation email
2. **Email Confirmation**: User clicks link → `/auth/confirm/route.ts` verifies OTP → redirects to dashboard
3. **Sign In**: User submits credentials → session cookie set → redirected to dashboard
4. **Session Management**: Proxy automatically refreshes tokens via `proxy.ts`
5. **Sign Out**: Client calls `signOut()` → session cleared → redirected to login

### Protected Routes

The Proxy handler (`proxy.ts`) guards protected routes:
- Redirects unauthenticated users to `/auth/login`
- Public routes: `/`, `/auth/*`, static files, images
- Dashboard requires authentication

## Database Schema

### Tables

**projects**
```typescript
{
  id: string
  user_id: string          // Foreign key to auth.users
  name: string
  status: 'draft' | 'ready'
  global_prompt: string    // Project-wide design context
  created_at: string
  updated_at: string
}
```

**pages**
```typescript
{
  id: string
  project_id: string       // Foreign key to projects
  name: string
  is_landing_page: boolean // True for the main landing page
  order: number            // Display order within project
  created_at: string
  updated_at: string
}
```

**sections**
```typescript
{
  id: string
  page_id: string          // Foreign key to pages
  name: string
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'footer' | 'custom'
  description: string      // Section requirements/prompt content
  image_url: string | null // Reference image URL
  image_description: string | null
  style_notes: string | null
  animation_notes: string | null
  order: number            // Display order within page
  created_at: string
  updated_at: string
}
```

### Relationships

- One `project` has many `pages`
- One `page` has many `sections`
- `pages.project_id` → `projects.id`
- `sections.page_id` → `pages.id`
- `projects.user_id` → `auth.users.id`

## Application Architecture

### State Management (Zustand)

The `useProjectStore` in `lib/store-supabase.ts` manages application state:

```typescript
interface ProjectStore {
  projects: FrontendProject[]
  activeProjectId: string | null
  activePageId: string | null
  isLoading: boolean
  error: string | null
  hasUnsavedChanges: boolean
  pendingChanges: Map<string, PendingChanges>
  
  // Project actions
  loadProjects(): Promise<void>
  createProject(name: string): Promise<string>
  updateProject(id, updates): Promise<void>
  deleteProject(id): Promise<void>
  duplicateProject(id): Promise<void>
  setActiveProject(id): void
  
  // Page actions
  addPage(projectId, name): Promise<void>
  updatePage(projectId, pageId, updates): Promise<void>
  deletePage(projectId, pageId): Promise<void>
  setActivePage(id): void
  
  // Section actions
  addSection(projectId, pageId, section): Promise<void>
  updateSection(projectId, pageId, sectionId, updates): Promise<void>
  deleteSection(projectId, pageId, sectionId): Promise<void>
  saveProject(projectId): Promise<void>
  
  // Getters
  getActiveProject(): FrontendProject | undefined
  getActivePage(): FrontendPage | undefined
}
```

**Key Patterns:**
- Optimistic updates for UI responsiveness
- Pending changes tracking for auto-save functionality
- Type conversion between DB snake_case and frontend camelCase

### Server Actions (`app/actions/projects.ts`)

Server Actions handle database operations:

| Action | Description |
|--------|-------------|
| `getProjects()` | Fetch all projects with sections for current user |
| `createProject(name)` | Create project with default sections |
| `updateProject(id, updates)` | Update project metadata |
| `deleteProject(id)` | Remove project and cascade delete sections |
| `duplicateProject(id)` | Clone project with all sections |
| `createPage(projectId, name)` | Add new page to project |
| `updatePage(id, updates)` | Update page metadata |
| `deletePage(id)` | Remove page and its sections |
| `reorderPages(projectId, pageIds)` | Update page order |
| `createSection(pageId, section)` | Add section to page |
| `updateSection(id, updates)` | Update section fields |
| `deleteSection(id)` | Remove section |
| `duplicateSection(id)` | Clone section within same project |
| `reorderSections(projectId, sectionIds)` | Update section order |

### AI Generation Flow

1. User clicks "Generate Prompt" in `utilities-panel.tsx`
2. Frontend collects project data + global prompt + all sections
3. POST to `/api/generate` with assembled prompt
4. API route (`app/api/generate/route.ts`):
   - Verifies authentication
   - Calls OpenAI Responses API with `system_prompt.ts`
   - Returns generated landing page prompt
5. Frontend displays generated prompt for copy-paste to Claude/Kimi

### Multi-Page Architecture

Each project consists of multiple pages, starting with a **Landing Page**:

- **Landing Page**: The main page with default sections (Hero, Features, Testimonials, Pricing, CTA, Footer)
- **Additional Pages**: Custom pages (e.g., About, Contact, Pricing) with user-defined custom sections

Pages are displayed as tabs in the project editor. Users can:
- Add new pages via the "Add Page" button
- Switch between pages using tabs
- Delete custom pages (landing page cannot be deleted)
- Each page has its own independent set of sections

### Default Sections

New projects are created with a Landing Page containing 6 default sections:
1. Hero
2. Features
3. Testimonials
4. Pricing
5. CTA
6. Footer

Additional pages start empty and only support custom sections.

## Code Conventions

### Path Aliases

Use the `@/*` alias for imports:
- `@/components/ui/button` → `components/ui/button`
- `@/lib/supabase/client` → `lib/supabase/client`
- `@/lib/utils` → `lib/utils`

### shadcn/ui Components

Components are managed via `components.json`. To add new components:
```bash
npx shadcn add <component-name>
```

Current components use:
- Style: "new-york"
- Base color: "neutral"
- CSS variables: enabled
- Icon library: lucide

### Styling

- Use Tailwind CSS utility classes
- Use the `cn()` utility from `@/lib/utils` for conditional class merging
- CSS variables for theming are defined in `app/globals.css`
- Dark mode is class-based (`dark` class on html)

### Component Patterns

**Server Components** (default):
- Async functions can fetch data directly
- Use `createClient()` from `@/lib/supabase/server`
- Example: `app/dashboard/page.tsx`, `components/auth-button.tsx`

**Client Components** ("use client"):
- For interactivity, hooks, browser APIs
- Use `useProjectStore()` from `@/lib/store` for state
- Example: `components/project-editor.tsx`, `app/dashboard/dashboard-content.tsx`

## Type Definitions

### Frontend Types (`lib/types.ts`)

```typescript
type SectionType = 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'footer' | 'custom'

interface Section {
  id: string
  pageId: string
  name: string
  type: SectionType
  description: string
  imageUrl?: string
  imageDescription?: string
  styleNotes?: string
  animationNotes?: string
  order: number
}

interface Page {
  id: string
  projectId: string
  name: string
  pageDescription: string
  isLandingPage: boolean
  pageOrder: number
  sections: Section[]
  createdAt: number
  updatedAt: number
}

interface Project {
  id: string
  name: string
  status: 'draft' | 'ready'
  globalPrompt: string
  pages: Page[]
  createdAt: number
  updatedAt: number
}
```

### Database Types (`lib/database.types.ts`)

Auto-generated from Supabase schema. Use for:
- `Project` / `ProjectInsert` / `ProjectUpdate`
- `Page` / `PageInsert` / `PageUpdate`
- `Section` / `SectionInsert` / `SectionUpdate`

## Security Considerations

1. **Never expose service role key** in client-side code
2. **Always use `getClaims()` or `getUser()`** on server to verify authentication
3. **Don't cache Supabase clients** in global variables when using Fluid compute
4. **Return Proxy response as-is** without modifying cookies to avoid session issues
5. **Validate all user inputs** before sending to Supabase
6. **OpenAI API key is server-only** - never expose in client code

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_OPENAI_API_KEY`
3. Deploy with `cacheComponents: true` enabled in `next.config.ts`

### Supabase Setup

1. Create a Supabase project at https://database.new
2. Run the following SQL to create tables:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready')),
  global_prompt TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_landing_page BOOLEAN DEFAULT FALSE,
  page_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections table
CREATE TABLE sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('hero', 'features', 'testimonials', 'pricing', 'cta', 'footer', 'custom')),
  description TEXT DEFAULT '',
  image_url TEXT,
  image_description TEXT,
  style_notes TEXT,
  animation_notes TEXT,
  order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can CRUD their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own pages"
  ON pages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = pages.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can CRUD sections for their pages"
  ON sections FOR ALL
  USING (EXISTS (
    SELECT 1 FROM pages 
    JOIN projects ON pages.project_id = projects.id 
    WHERE pages.id = sections.page_id AND projects.user_id = auth.uid()
  ));
```

## Common Tasks

### Adding a New Page

Users can add pages via the UI:
1. Click "Add Page" button in the PagesTabs component
2. Enter page name
3. New page appears as a tab with custom sections only

### Adding a New Section Type

1. Update `SectionType` union in `lib/types.ts`
2. Add template to `SECTION_TEMPLATES` in `lib/types.ts`
3. Update database constraint in Supabase
4. Update `lib/database.types.ts`

### Modifying the System Prompt

Edit `lib/system-prompt.ts` to change AI behavior:
- The system prompt defines how GPT-4o generates landing page prompts
- Maintain the structured output format for best results
- Test generation after changes

### Adding New UI Components

```bash
npx shadcn add tabs
```

Import and use:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

## Troubleshooting

**Issue: "Auth session missing" error**
- Verify environment variables are set
- Check that email confirmation link uses correct redirect URL
- Ensure cookies are being set (check browser dev tools)

**Issue: Projects not loading**
- Check Supabase connection
- Verify RLS policies are configured
- Check browser console for errors

**Issue: AI generation fails**
- Verify `NEXT_OPENAI_API_KEY` is set
- Check OpenAI API status
- Review server logs for error details

**Issue: Changes not persisting**
- Ensure `saveProject()` is called
- Check for pending changes in store
- Verify network requests in DevTools

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [@supabase/ssr Package](https://github.com/supabase/ssr)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [OpenAI API Documentation](https://platform.openai.com/docs)
