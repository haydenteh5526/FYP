# Frontend Context — AI Cloud Document Vault (DocVault)

## Project Overview
Premium SaaS-style React app for digitising physical documents with AI. Uses shadcn/ui design patterns, Tailwind CSS v4, and a custom indigo/purple gradient design system.

## Tech Stack
- React 19 + TypeScript
- Vite 8 (bundler)
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- React Router v7 (routing)
- Lucide React (icons)
- Radix UI (accessible primitives)
- class-variance-authority + clsx + tailwind-merge (component styling)

## Project Structure
```
frontend/src/
├── App.tsx              # Root: AuthProvider + BrowserRouter + route definitions
├── main.tsx             # Entry point + service worker registration
├── index.css            # Tailwind + design tokens + custom utilities/animations
├── vite-env.d.ts
├── lib/
│   ├── api.ts           # API client (fetch calls with auth headers)
│   ├── auth.tsx         # AuthContext provider (token in localStorage)
│   └── utils.ts         # cn() helper for className merging
├── components/ui/
│   ├── button.tsx       # shadcn Button with variants (CVA)
│   ├── card.tsx         # shadcn Card, CardHeader, CardTitle, CardContent
│   └── input.tsx        # shadcn Input
└── pages/
    ├── Landing.tsx      # Public landing page (hero, features, CTA)
    ├── Auth.tsx         # Login/Register with mode prop
    ├── Dashboard.tsx    # Document grid with filter, delete, badges
    ├── Upload.tsx       # Drag-and-drop upload with processing states
    ├── DocumentDetail.tsx # Image/Text/Info tabs, editable text
    ├── Search.tsx       # Semantic + keyword search
    ├── AskAI.tsx        # Chat interface with sources
    └── Categories.tsx   # Category list + create
```

## Routing
```
/ → Landing (public)
/login → Auth (mode="login")
/register → Auth (mode="register")
/app → Dashboard (protected, requires auth)
/app/upload → Upload
/app/documents/:id → DocumentDetail
/app/categories → Categories
/app/search → Search
/app/ask → AskAI
```

Authenticated users visiting / redirect to /app.
Unauthenticated users visiting /app redirect to /login.

## Design System (index.css)
- Colors: Indigo/purple gradient primary (oklch), neutral grays
- Font: -apple-system, SF Pro Display, Inter, system-ui
- Custom utilities:
  - `.gradient-bg` — primary gradient background
  - `.gradient-text` — gradient text fill
  - `.glass` — backdrop-blur glassmorphism
  - `.hover-lift` — translateY(-2px) + shadow on hover
  - `.animate-fade-in`, `.animate-slide-up`, `.animate-scale-in` — entrance animations

## API Client (lib/api.ts)
All requests go to `/api/v1/*` (proxied to backend at localhost:8000).
Auth token read from localStorage, sent as `Authorization: Bearer {token}`.

Endpoints:
- `POST /auth/register` → { access_token }
- `POST /auth/login` → { access_token }
- `POST /documents` (multipart) → Document
- `GET /documents` → { documents, total }
- `GET /documents/:id` → Document
- `DELETE /documents/:id`
- `GET /search?q=` → { results: SearchResult[] }
- `POST /ai/ask` → { answer, sources }

## Auth (lib/auth.tsx)
React Context with `token`, `login(token)`, `logout()`, `isAuthenticated`.
Token persisted in localStorage.

## Component Patterns
- All UI components use `cn()` for class merging
- Button has variants: default, secondary, outline, ghost, destructive
- Button has sizes: default, sm, lg, icon
- Button supports `asChild` for rendering as Link
- Cards use rounded-xl/2xl borders with hover-lift
- Pages wrap content in max-w container with animate-fade-in

## Key Visual Patterns
- Gradient buttons for primary actions
- Staggered entrance animations with animationDelay
- Empty states with icon + description + CTA
- Loading: spinner (border-animate-spin) or skeleton
- Chat bubbles: user = gradient bg, assistant = muted bg
- Badges: colored bg (blue-50/purple-50) with matching text
- Seamless navbar: backdrop-blur, no border
