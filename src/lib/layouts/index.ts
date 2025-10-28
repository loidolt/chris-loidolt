/**
 * Layout System - Central exports
 *
 * Import layout components like:
 * import { Container, Grid, Stack } from '$lib/layouts';
 */

// Core layout primitives
export { default as Container } from './Container.svelte';
export { default as Grid } from './Grid.svelte';
export { default as Stack } from './Stack.svelte';
export { default as Flex } from './Flex.svelte';
export { default as Section } from './Section.svelte';

// Advanced layout components
export { default as Sidebar } from './Sidebar.svelte';
export { default as Split } from './Split.svelte';
export { default as PageHeader } from './PageHeader.svelte';

// Note: Card, Tabs, Modal, and Panel have been replaced with shadcn-svelte components
// Import from '$lib/components/ui/...' instead
