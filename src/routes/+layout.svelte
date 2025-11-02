<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import PWAInstaller from '$lib/components/PWAInstaller.svelte';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { generateThemeVariables } from '$lib/themes';
	import type { LayoutData } from './$types';

	// Data from +layout.server.ts
	let { data }: { data: LayoutData } = $props();

	// Generate CSS variables for the current theme and mode
	let themeVariables = $derived(generateThemeVariables(data.siteConfig.theme, $theme));

	// Apply theme variables to document root
	$effect(() => {
		if (typeof document !== 'undefined') {
			const root = document.documentElement;
			Object.entries(themeVariables).forEach(([key, value]) => {
				root.style.setProperty(key, value);
			});
		}
	});

	// Initialize theme on mount to avoid hydration mismatch
	onMount(() => {
		// The theme store automatically applies the class to document.documentElement
		// Just subscribing ensures it runs on client-side
		const unsubscribe = theme.subscribe(() => {});
		return unsubscribe;
	});
</script>

<svelte:head>
	<title
		>{data.personSlug === 'family'
			? 'Loidolt Spaces'
			: data.personSlug.charAt(0).toUpperCase() + data.personSlug.slice(1) + ' Loidolt'} - Portfolio</title
	>
	<meta name="description" content="Multi-tenant family portfolio system" />

	<!-- Load JetBrains Mono font -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen flex flex-col bg-background">
	<Navigation />

	<main class="flex-1">
		<slot />
	</main>

	<footer class="py-8 px-4 text-center text-sm text-muted-foreground border-t">
		<p>Built with SvelteKit & PocketBase</p>
		<p class="mt-2">
			Theme: {data.siteConfig.theme.name} | Person: {data.personSlug}
		</p>
	</footer>

	<!-- PWA Install Prompt -->
	<PWAInstaller />
</div>
