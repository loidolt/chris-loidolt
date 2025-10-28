<script lang="ts">
  import { page } from '$app/stores';
  import { theme, toggleTheme } from '$lib/stores/theme';

  // Reactive variable - updates automatically when $page changes!
  $: pathname = $page.url.pathname;

  let isMobileMenuOpen = false;

  const navItems = [
    { href: '/', label: 'home' },
    { href: '/projects', label: 'projects' },
    { href: '/gis', label: 'gis' },
    { href: '/about', label: 'about' },
    { href: '/contact', label: 'contact' },
  ];

  // Reactive function - recalculates when pathname changes
  $: isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Auto-close mobile menu when route changes
  $: if (pathname) {
    isMobileMenuOpen = false;
  }
</script>

<header class="sticky top-0" style="z-index: 9999; background-color: var(--bg-surface)">
  <!-- Desktop Navigation -->
  <nav
    class="hidden md:flex items-center"
    style="border-bottom: 1px solid var(--border-color); background-color: var(--bg-surface)"
  >
    {#each navItems as item, index}
      <a
        href={item.href}
        class="px-6 py-3 text-sm relative transition-all hover:opacity-70"
        style="
          color: var(--text-primary);
          border-right: {index < navItems.length - 1 ? '1px solid var(--border-color)' : 'none'};
          background-color: {isActive(item.href) ? 'var(--bg-primary)' : 'var(--bg-surface)'};
        "
      >
        {item.label}
      </a>
    {/each}
    <div class="ml-auto px-4">
      <button on:click={toggleTheme} class="text-lg hover:opacity-70 transition-opacity">
        {$theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  </nav>

  <!-- Mobile Navigation -->
  <nav
    class="md:hidden flex items-center justify-between"
    style="border-bottom: 1px solid var(--border-color); background-color: var(--bg-surface)"
  >
    <!-- Mobile Menu Button -->
    <button
      on:click={() => (isMobileMenuOpen = !isMobileMenuOpen)}
      class="px-4 py-4 text-sm transition-all hover:opacity-70"
      style="
        color: var(--text-primary);
        background-color: var(--bg-surface);
        min-width: 60px;
        min-height: 52px;
      "
      aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isMobileMenuOpen}
    >
      {isMobileMenuOpen ? '✕' : '☰'}
    </button>

    <!-- Current Page Indicator -->
    <div class="flex-1 px-4 text-sm" style="color: var(--text-primary)">
      {navItems.find(item => isActive(item.href))?.label || 'home'}
    </div>

    <!-- Theme Toggle -->
    <div class="px-4">
      <button on:click={toggleTheme} class="text-lg hover:opacity-70 transition-opacity">
        {$theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  </nav>

  <!-- Mobile Menu Dropdown -->
  {#if isMobileMenuOpen}
    <div
      class="md:hidden absolute top-full left-0 right-0"
      style="
        background-color: var(--bg-surface);
        border-bottom: 1px solid var(--border-color);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
      "
    >
      {#each navItems as item}
        <a
          href={item.href}
          class="block px-6 py-4 text-sm transition-all hover:opacity-70"
          style="
            color: var(--text-primary);
            border-top: 1px solid var(--border-color);
            background-color: {isActive(item.href) ? 'var(--bg-primary)' : 'var(--bg-surface)'};
            min-height: 52px;
          "
        >
          {item.label}
        </a>
      {/each}
    </div>
  {/if}
</header>

<style>
  /* No global styles pollution - everything is scoped! */
  button {
    cursor: pointer;
    border: none;
    background: none;
  }
</style>
