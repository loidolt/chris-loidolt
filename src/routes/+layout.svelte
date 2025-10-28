<script lang="ts">
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
  import PWAInstaller from '$lib/components/PWAInstaller.svelte';
  import { theme } from '$lib/stores/theme';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';

  // Data from +layout.server.ts
  export let data: LayoutData;

  // Initialize theme on mount to avoid hydration mismatch
  onMount(() => {
    // The theme store automatically applies the class to document.documentElement
    // Just subscribing ensures it runs on client-side
    const unsubscribe = theme.subscribe(() => {});
    return unsubscribe;
  });

  // You can use data.personSlug for person-specific theming
  // For now, we're using the same theme for all
</script>

<svelte:head>
  <title>{data.personSlug === 'family' ? 'Loidolt Family' : data.personSlug.charAt(0).toUpperCase() + data.personSlug.slice(1) + ' Loidolt'} - Portfolio</title>
  <meta name="description" content="Multi-tenant family portfolio system" />
</svelte:head>

<div class="min-h-screen flex flex-col" style="background-color: var(--bg-primary)">
  <Navigation />

  <main class="flex-1">
    <slot />
  </main>

  <footer class="py-8 px-4 text-center text-sm" style="color: var(--text-muted); border-top: 1px solid var(--border-color)">
    <p>Built with SvelteKit & PocketBase</p>
    <p class="mt-2">Person: {data.personSlug}</p>
  </footer>

  <!-- PWA Install Prompt -->
  <PWAInstaller />
</div>

<style>
  /* Layout-specific styles */
  main {
    min-height: 60vh;
  }
</style>
