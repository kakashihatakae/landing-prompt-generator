# Next.js and Supabase Starter Kit

This is a Next.js starter template with Supabase integration, providing a complete authentication system and modern React development stack. It demonstrates cookie-based authentication that works across the entire Next.js stack including Server Components, Client Components, Route Handlers, Server Actions, and Middleware.

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript 5+ |
| React | React 19 |
| Styling | Tailwind CSS 3.4 |
| UI Components | shadcn/ui (New York style) |
| Authentication | Supabase Auth with `@supabase/ssr` |
| Icons | Lucide React |
| Theming | next-themes (dark/light/system) |
| Linting | ESLint 9 with Next.js configs |

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication routes
│   │   ├── confirm/route.ts      # Email confirmation handler
│   │   ├── error/page.tsx        # Auth error page
│   │   ├── forgot-password/      # Password reset request
│   │   ├── login/                # Login page
│   │   ├── sign-up/              # Registration page
│   │   ├── sign-up-success/      # Post-registration message
│   │   └── update-password/      # Password update after reset
│   ├── protected/                # Protected route example
│   │   ├── layout.tsx            # Protected layout with nav
│   │   └── page.tsx              # Protected content
│   ├── favicon.ico
│   ├── globals.css               # Global styles + CSS variables
│   ├── layout.tsx                # Root layout with ThemeProvider
│   ├── opengraph-image.png
│   ├── page.tsx                  # Landing page
│   └── twitter-image.png
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── tutorial/                 # Tutorial/step components
│   ├── auth-button.tsx           # Auth state button (server)
│   ├── deploy-button.tsx         # Vercel deploy button
│   ├── env-var-warning.tsx       # Missing env vars warning
│   ├── forgot-password-form.tsx  # Password reset form
│   ├── hero.tsx                  # Landing hero section
│   ├── login-form.tsx            # Login form (client)
│   ├── logout-button.tsx         # Logout button (client)
│   ├── sign-up-form.tsx          # Registration form
│   ├── theme-switcher.tsx        # Dark/light mode toggle
│   └── update-password-form.tsx  # Password update form
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client factory
│   │   ├── proxy.ts              # Session update logic
│   │   └── server.ts             # Server client factory
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
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Get these values from your Supabase project settings > API.

> **Note:** This project uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` which supports both the new publishable key format and legacy anon keys during the transition period.

## Authentication Architecture

### Supabase Client Types

1. **Browser Client** (`lib/supabase/client.ts`)
   - For Client Components ("use client")
   - Uses `createBrowserClient` from `@supabase/ssr`

2. **Server Client** (`lib/supabase/server.ts`)
   - For Server Components and Server Actions
   - Uses `createServerClient` with cookie handling
   - Must create a new instance per function (don't use global variables)

3. **Proxy Session** (`lib/supabase/proxy.ts`)
   - Handles session refresh via Next.js Proxy
   - Runs on the edge, updates cookies automatically

### Authentication Flow

1. **Sign Up**: User submits email/password → Supabase sends confirmation email
2. **Email Confirmation**: User clicks link → `/auth/confirm/route.ts` verifies OTP → redirects to app
3. **Sign In**: User submits credentials → session cookie set → redirected to protected page
4. **Session Management**: Proxy automatically refreshes tokens via `proxy.ts`
5. **Sign Out**: Client calls `signOut()` → session cleared → redirected to login

### Protected Routes

The Proxy handler (`proxy.ts`) guards protected routes:
- Checks authentication on each request
- Redirects unauthenticated users to `/auth/login`
- Public routes: `/`, `/auth/*`, static files, images

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
- Example: `app/protected/page.tsx`, `components/auth-button.tsx`

**Client Components** ("use client"):
- For interactivity, hooks, browser APIs
- Use `createClient()` from `@/lib/supabase/client`
- Example: `components/login-form.tsx`, `components/logout-button.tsx`

## Security Considerations

1. **Never expose service role key** in client-side code
2. **Always use `getClaims()` or `getUser()`** on server to verify authentication
3. **Don't cache Supabase clients** in global variables when using Fluid compute
4. **Return Proxy response as-is** without modifying cookies to avoid session issues
5. **Validate all user inputs** before sending to Supabase

## Deployment

### Vercel (Recommended)

Click the "Deploy" button or use the Vercel CLI. The Supabase integration will automatically configure environment variables.

### Environment Setup

1. Create a Supabase project at https://database.new
2. Configure environment variables in your hosting platform
3. Deploy with `cacheComponents: true` enabled in `next.config.ts`

## Testing

This starter kit does not include a test suite. To add testing:

- **Unit tests**: Vitest or Jest with React Testing Library
- **E2E tests**: Playwright for authentication flows

## Common Tasks

### Adding a New Protected Route

1. Create folder under `app/` (e.g., `app/dashboard/`)
2. Copy layout pattern from `app/protected/layout.tsx` for consistent nav
3. Add auth check in page or layout:
   ```tsx
   const supabase = await createClient();
   const { data } = await supabase.auth.getClaims();
   if (!data?.claims) redirect("/auth/login");
   ```

### Adding a New shadcn/ui Component

```bash
npx shadcn add tabs
```

Import and use:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

### Customizing Theme Colors

Edit CSS variables in `app/globals.css`:
```css
:root {
  --primary: 222 47% 11%;
  --primary-foreground: 210 40% 98%;
}
```

## Troubleshooting

**Issue: Users randomly logged out**
- Ensure `getClaims()` is called after creating server client
- Don't modify cookies in Proxy response
- Check that `proxy.ts` matcher doesn't exclude the route

**Issue: "Auth session missing" error**
- Verify environment variables are set
- Check that email confirmation link uses correct redirect URL
- Ensure cookies are being set (check browser dev tools)

**Issue: Type errors with Supabase**
- Regenerate types if you change database schema
- Use `supabase gen types` command

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [@supabase/ssr Package](https://github.com/supabase/ssr)
