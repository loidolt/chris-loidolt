<script lang="ts">
  import { page } from '$app/stores';
  import { theme, toggleTheme } from '$lib/stores/theme';
  import { Menu, X, Sun, Moon } from 'lucide-svelte';
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  // Reactive variable - updates automatically when $page changes
  let pathname = $derived($page.url.pathname);

  let isMobileMenuOpen = $state(false);

  const navItems = [
    { href: '/', label: 'home' },
    { href: '/projects', label: 'projects' },
    { href: '/gis', label: 'gis' },
    { href: '/about', label: 'about' },
    { href: '/contact', label: 'contact' },
  ];

  // Check if link is active
  function isActive(href: string): boolean {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  // Auto-close mobile menu when route changes
  $effect(() => {
    if (pathname) {
      isMobileMenuOpen = false;
    }
  });

  // Close menu on Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isMobileMenuOpen) {
      isMobileMenuOpen = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <!-- Desktop Navigation -->
  <nav class="hidden md:flex items-center h-14" aria-label="Main navigation">
    <div class="flex items-center flex-1">
      {#each navItems as item, index}
        <a
          href={item.href}
          class="relative px-6 h-14 flex items-center text-sm font-medium transition-colors hover:text-foreground/80 {isActive(item.href) ? 'text-foreground' : 'text-foreground/60'}"
          class:border-r={index < navItems.length - 1}
          class:border-border={index < navItems.length - 1}
          class:bg-accent={isActive(item.href)}
        >
          {item.label}
          {#if isActive(item.href)}
            <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" transition:fade={{ duration: 150 }}></span>
          {/if}
        </a>
      {/each}
    </div>

    <!-- Theme Toggle -->
    <button
      on:click={toggleTheme}
      class="h-14 px-4 inline-flex items-center justify-center text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle theme"
      type="button"
    >
      {#if $theme === 'dark'}
        <Sun class="h-5 w-5" />
      {:else}
        <Moon class="h-5 w-5" />
      {/if}
    </button>
  </nav>

  <!-- Mobile Navigation -->
  <nav class="md:hidden flex items-center justify-between h-14 px-4" aria-label="Main navigation">
    <!-- Mobile Menu Button -->
    <button
      on:click={() => (isMobileMenuOpen = !isMobileMenuOpen)}
      class="inline-flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isMobileMenuOpen}
      type="button"
    >
      {#if isMobileMenuOpen}
        <X class="h-5 w-5" />
      {:else}
        <Menu class="h-5 w-5" />
      {/if}
    </button>

    <!-- Current Page Indicator -->
    <div class="flex-1 px-4 text-sm font-medium text-foreground">
      {navItems.find(item => isActive(item.href))?.label || 'home'}
    </div>

    <!-- Theme Toggle -->
    <button
      on:click={toggleTheme}
      class="inline-flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle theme"
      type="button"
    >
      {#if $theme === 'dark'}
        <Sun class="h-5 w-5" />
      {:else}
        <Moon class="h-5 w-5" />
      {/if}
    </button>
  </nav>

  <!-- Mobile Menu Overlay & Dropdown -->
  {#if isMobileMenuOpen}
    <!-- Backdrop -->
    <button
      class="md:hidden fixed inset-0 z-40 bg-black/50"
      on:click={() => (isMobileMenuOpen = false)}
      transition:fade={{ duration: 200 }}
      aria-label="Close menu"
      type="button"
    ></button>

    <!-- Menu Panel -->
    <div
      class="md:hidden fixed top-14 left-0 right-0 z-50 border-b border-border bg-popover shadow-lg opacity-100"
      transition:fly={{ y: -20, duration: 200, easing: quintOut }}
    >
      {#each navItems as item}
        <a
          href={item.href}
          class="flex items-center px-6 h-14 text-sm font-medium transition-colors hover:bg-accent border-t border-border {isActive(item.href) ? 'bg-accent text-foreground' : 'text-foreground/60'}"
        >
          {item.label}
        </a>
      {/each}
    </div>
  {/if}
</header>
