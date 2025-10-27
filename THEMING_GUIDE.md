# Multi-Site Theming & Layout Guide

This guide explains how to use and customize the per-person theming and layout system.

## Overview

The multi-site theming system allows each family member to have:
- **Custom color palettes** (light and dark modes)
- **Unique typography settings**
- **Person-specific layouts** (different navigation styles, footers, etc.)
- **Individual animations and effects**

## Architecture

```
src/
├── themes/               # Theme definitions
│   ├── types.ts         # TypeScript interfaces
│   ├── index.ts         # Theme registry & utilities
│   ├── chris.theme.ts   # Chris's theme
│   ├── julia.theme.ts   # Julia's theme
│   ├── theo.theme.ts    # Theo's theme
│   ├── jack.theme.ts    # Jack's theme
│   └── family.theme.ts  # Family hub theme
├── layouts/              # Layout components
│   ├── BaseLayout.tsx   # Shared base layout
│   ├── ChrisLayout.tsx  # Chris's layout (tabs navigation)
│   ├── JuliaLayout.tsx  # Julia's layout (top bar)
│   ├── TheoLayout.tsx   # Theo's layout (sidebar)
│   ├── JackLayout.tsx   # Jack's layout (minimal)
│   └── FamilyLayout.tsx # Family hub layout
├── lib/
│   └── theme-provider.tsx  # Theme context provider
└── middleware.ts        # Person slug detection
```

## How It Works

### 1. Person Detection

The middleware (`src/middleware.ts`) detects which person's site is being accessed:

**Via Subdomain:**
```
chris.loidolt.space → personSlug: 'chris'
julia.loidolt.space → personSlug: 'julia'
loidolt.space       → personSlug: 'family'
```

**Via Query Parameter (Development):**
```
localhost:3000?person=julia → personSlug: 'julia'
localhost:3000?person=theo  → personSlug: 'theo'
```

### 2. Theme Loading

The root layout (`src/app/layout.tsx`) reads the person slug and:
1. Loads the appropriate theme configuration
2. Generates CSS custom properties
3. Wraps the app in a ThemeProvider
4. Renders the person-specific layout component

### 3. CSS Variable Injection

Theme colors and styles are injected as CSS custom properties:

```css
:root {
  --color-bg-primary: #1c1a16;
  --color-accent-primary: #6b9b7f;
  --font-mono: "JetBrains Mono", ...;
  /* ... and many more */
}

:root.light {
  --color-bg-primary: #f4f1ea;
  /* Light mode overrides */
}
```

## Testing Different Person Themes

### Local Development

Add `?person=<slug>` to any URL:

```bash
# Test Chris's theme (default)
http://localhost:3000

# Test Julia's theme
http://localhost:3000?person=julia

# Test Theo's theme
http://localhost:3000?person=theo

# Test Jack's theme
http://localhost:3000?person=jack

# Test Family hub theme
http://localhost:3000?person=family
```

### Production with Subdomains

Configure your DNS to point subdomains to your Next.js deployment:

```
chris.loidolt.space  → Your Next.js app
julia.loidolt.space  → Your Next.js app
theo.loidolt.space   → Your Next.js app
jack.loidolt.space   → Your Next.js app
loidolt.space        → Your Next.js app (family)
```

## Creating a New Theme

### Step 1: Define the Theme

Create a new file `src/themes/newperson.theme.ts`:

```typescript
import { SiteConfig } from './types';

export const newPersonTheme: SiteConfig = {
  theme: {
    id: 'newperson',
    name: 'New Person Theme',
    personSlug: 'newperson',
    description: 'Description of the theme',

    colors: {
      light: {
        bgPrimary: '#ffffff',
        bgSurface: '#f5f5f5',
        textPrimary: '#000000',
        // ... more colors
      },
      dark: {
        bgPrimary: '#000000',
        bgSurface: '#1a1a1a',
        textPrimary: '#ffffff',
        // ... more colors
      },
    },

    typography: {
      fontMono: '"JetBrains Mono", monospace',
      baseFontSize: '16px',
      // ... more typography settings
    },

    // ... spacing, animation, borders, effects
  },

  layout: {
    navigation: {
      style: 'tabs',  // or 'topbar', 'sidebar', 'minimal', 'hamburger'
      position: 'top',
      sticky: true,
    },

    footer: {
      style: 'split', // or 'minimal', 'centered', 'rich'
      showSocial: true,
    },

    content: {
      maxWidth: '1280px',
      padding: '1.5rem',
      centerContent: true,
    },
  },
};
```

### Step 2: Register the Theme

Add it to `src/themes/index.ts`:

```typescript
import { newPersonTheme } from './newperson.theme';

export const themes: ThemeRegistry = {
  chris: chrisTheme,
  julia: juliaTheme,
  theo: theoTheme,
  jack: jackTheme,
  family: familyTheme,
  newperson: newPersonTheme, // Add here
};
```

### Step 3: Create a Layout (Optional)

If you want a custom layout, create `src/layouts/NewPersonLayout.tsx`:

```typescript
'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
// Import your custom navigation component if needed

export default function NewPersonLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout
      navigation={<YourCustomNavigation />}
      className="newperson-layout"
    >
      {children}
    </BaseLayout>
  );
}
```

Register it in `src/layouts/index.tsx`:

```typescript
import NewPersonLayout from './NewPersonLayout';

export const layouts: Record<PersonSlug, LayoutComponent> = {
  // ... existing layouts
  newperson: NewPersonLayout,
};
```

### Step 4: Update Type Definitions

Update `PersonSlug` type in `src/themes/types.ts` if needed.

## Available Navigation Styles

### Tabs (Chris's Style)
- Horizontal tabs across the top
- Active tab highlighted with background color

### Top Bar (Julia's Style)
- Logo on left, navigation in center, theme toggle on right
- Clean and centered

### Sidebar (Theo's Style)
- Vertical navigation on the left side
- Sticky sidebar with logo at top

### Minimal (Jack's Style)
- Simple text links with logo
- No borders or backgrounds

### Hamburger (Mobile-friendly)
- Collapsible menu for mobile
- Full navigation on desktop

## Using Theme Variables in Components

Access theme colors and properties using CSS custom properties:

```typescript
<div
  style={{
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border)',
  }}
>
  Content
</div>
```

## Using Theme Context in Components

Access theme configuration programmatically:

```typescript
'use client';

import { useSiteConfig } from '@/lib/theme-provider';

export default function MyComponent() {
  const { siteConfig, personSlug } = useSiteConfig();

  return (
    <div>
      <h1>Welcome to {personSlug}'s site</h1>
      <p>Theme: {siteConfig.theme.name}</p>
    </div>
  );
}
```

## Color Palette Reference

Each theme defines these colors:

### Backgrounds
- `--color-bg-primary`: Main background
- `--color-bg-surface`: Elevated surfaces (cards, nav)
- `--color-bg-elevated`: Even more elevated elements

### Text
- `--color-text-primary`: Main text color
- `--color-text-secondary`: Secondary text
- `--color-text-muted`: Muted/disabled text

### Accents
- `--color-accent-primary`: Primary brand color
- `--color-accent-secondary`: Secondary accent
- `--color-accent-tertiary`: Tertiary accent

### Interactive
- `--color-link`: Link color
- `--color-link-hover`: Link hover state

### Borders
- `--color-border`: Default border color
- `--color-border-subtle`: Subtle borders

### Status
- `--color-success`: Success state
- `--color-error`: Error state
- `--color-warning`: Warning state
- `--color-info`: Info state

## Current Themes

### Chris - Terminal Green
- **Style**: E-paper terminal aesthetic
- **Colors**: Warm browns with green accents
- **Layout**: Horizontal tabs navigation
- **Vibe**: Developer tools, clean monospace

### Julia - Warm Coral
- **Style**: Artistic and warm
- **Colors**: Pink and coral tones
- **Layout**: Top bar with centered navigation
- **Vibe**: Creative, inviting, personal

### Theo - Electric Blue
- **Style**: Cool and tech-focused
- **Colors**: Blues and purples
- **Layout**: Sidebar navigation on left
- **Vibe**: Modern, sleek, functional

### Jack - Sunset Orange
- **Style**: Playful and energetic
- **Colors**: Oranges and yellows
- **Layout**: Minimal text-only navigation
- **Vibe**: Warm, cheerful, simple

### Family - Unified Hub
- **Style**: Balanced and welcoming
- **Colors**: Neutral with all accent colors
- **Layout**: Rich footer with family member links
- **Vibe**: Collaborative, inclusive, warm

## Troubleshooting

### Theme not loading
- Check that the person slug is valid
- Verify middleware is running
- Check browser console for errors

### Colors not applying
- Ensure CSS custom properties are used (not hardcoded colors)
- Check that ThemeProvider is wrapping your app
- Verify theme CSS is being injected

### Layout not switching
- Confirm layout component is registered in `src/layouts/index.tsx`
- Check that RootLayoutClient is receiving the correct personSlug

### Hydration mismatch
- Use `suppressHydrationWarning` on `<html>` tag
- Ensure theme script runs before React hydrates
- Use `mounted` state for client-only rendering

## Best Practices

1. **Always use CSS custom properties** instead of hardcoding colors
2. **Test both light and dark modes** for each theme
3. **Keep layouts responsive** - test mobile and desktop
4. **Maintain accessibility** - sufficient color contrast
5. **Document custom components** that use theme variables
6. **Use TypeScript** for type safety with theme objects
7. **Test theme switching** to ensure smooth transitions

## Further Customization

### Per-Page Overrides
Individual pages can access and use theme config:

```typescript
import { headers } from 'next/headers';
import { getThemeBySlug } from '@/themes';

export default async function ProjectsPage() {
  const headersList = await headers();
  const personSlug = headersList.get('x-person-slug') || 'chris';
  const siteConfig = getThemeBySlug(personSlug);

  // Use siteConfig for custom rendering
}
```

### Component Variants
Create person-specific component variants:

```typescript
const componentStyle = personSlug === 'theo' ? 'tech' : 'default';
```

### Dynamic Content
Load person-filtered data from PocketBase:

```typescript
const projects = await getProjectsByPerson(personSlug);
```

## Questions?

See the main `CLAUDE.md` file or the `MULTITENANT_ARCHITECTURE.md` for more details on the overall multi-tenant system.
