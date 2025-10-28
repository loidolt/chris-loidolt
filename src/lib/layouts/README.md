# Layout System

A comprehensive, production-ready layout system for SvelteKit applications.

## Quick Start

```svelte
<script>
  import { Container, Grid, Card } from '$lib/layouts';
</script>

<Container>
  <Grid cols={3} gap="lg">
    <Card>Item 1</Card>
    <Card>Item 2</Card>
    <Card>Item 3</Card>
  </Grid>
</Container>
```

## Components

### Core (5)
- **Container** - Max-width wrapper
- **Grid** - Responsive grid
- **Stack** - Vertical spacing
- **Flex** - Flexbox layouts
- **Section** - Page sections

### Advanced (7)
- **Card** - Content containers
- **Split** - Two-column layout
- **Sidebar** - Collapsible sidebar
- **Panel** - Accordion panels
- **PageHeader** - Page headers
- **Tabs** - Tabbed interface
- **Modal** - Modal dialogs

## Features

✅ Responsive (mobile-first)
✅ Accessible (WCAG 2.1 AA)
✅ TypeScript support
✅ Composable
✅ Performant

## Documentation

- **LAYOUT_QUICKSTART.md** - Quick reference guide
- **LAYOUT_SYSTEM.md** - Complete documentation
- **LAYOUT_PATTERNS.md** - Visual pattern library
- **LAYOUT_SYSTEM_SUMMARY.md** - Overview and benefits

## Demo

Visit `/layout-demo` to see all components in action.

## Import

```typescript
import {
  Container,
  Grid,
  Stack,
  Flex,
  Section,
  Card,
  Split,
  Sidebar,
  Panel,
  PageHeader,
  Tabs,
  Modal
} from '$lib/layouts';
```

## Utilities

```typescript
import {
  isMobile,
  isTablet,
  isDesktop,
  currentBreakpoint,
  screenWidth
} from '$lib/utils/breakpoints';
```

## Examples

### Dashboard
```svelte
<Sidebar>
  <nav slot="sidebar">...</nav>
  <Container>
    <Grid cols={4}>
      <Card>Metric 1</Card>
      <Card>Metric 2</Card>
    </Grid>
  </Container>
</Sidebar>
```

### Content Page
```svelte
<Container variant="narrow">
  <Stack gap="lg">
    <h1>Title</h1>
    <p>Content...</p>
  </Stack>
</Container>
```

### Card Grid
```svelte
<Container>
  <Grid minColWidth="250px" gap="md">
    {#each items as item}
      <Card interactive>{item.name}</Card>
    {/each}
  </Grid>
</Container>
```

For more examples, see the documentation files in the root directory.
