<script lang="ts">
  /**
   * PageHeader - consistent page header with title, breadcrumbs, and actions
   *
   * Features:
   * - Page title and subtitle
   * - Optional breadcrumbs
   * - Action buttons slot
   * - Responsive layout
   */

  export let title: string;
  export let subtitle: string | null = null;
  export let breadcrumbs: Array<{ label: string; href?: string }> = [];
</script>

<header class="mb-8 pb-6" style="border-bottom: 1px solid var(--border-color);">
  {#if breadcrumbs.length > 0}
    <nav class="mb-3 flex items-center gap-2 text-sm" style="color: var(--text-muted);">
      {#each breadcrumbs as crumb, i}
        {#if i > 0}
          <span>/</span>
        {/if}
        {#if crumb.href}
          <a href={crumb.href} class="hover:opacity-70 transition-opacity">
            {crumb.label}
          </a>
        {:else}
          <span>{crumb.label}</span>
        {/if}
      {/each}
    </nav>
  {/if}

  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
    <div>
      <h1 class="text-3xl lg:text-4xl font-bold mb-2" style="color: var(--text-primary);">
        {title}
      </h1>
      {#if subtitle}
        <p class="text-base lg:text-lg" style="color: var(--text-secondary);">
          {subtitle}
        </p>
      {/if}
    </div>

    {#if $$slots.actions}
      <div class="flex items-center gap-3">
        <slot name="actions" />
      </div>
    {/if}
  </div>
</header>
