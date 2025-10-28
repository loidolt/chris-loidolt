<script lang="ts">
  import { derived } from 'svelte/store';
  import { writable } from 'svelte/store';
  import Fuse from 'fuse.js';
  import type { Project } from '$lib/pocketbase';
  import OverlayPanel, { type PanelTab } from './OverlayPanel.svelte';

  export let projects: Project[];

  let searchQuery = '';
  let selectedCategory: string | null = null;

  // Initialize Fuse.js for fuzzy searching
  $: fuse = new Fuse(projects, {
    keys: ['title', 'description', 'tags', 'categories', 'category'],
    threshold: 0.3,
  });

  // Filter projects based on search and category
  $: filteredProjects = (() => {
    let filtered = projects;

    // Apply search filter
    if (searchQuery) {
      filtered = fuse.search(searchQuery).map((result) => result.item);
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        // Check both categories array and single category for backward compatibility
        if (p.categories && p.categories.includes(selectedCategory)) {
          return true;
        }
        return p.category === selectedCategory;
      });
    }

    return filtered;
  })();

  // Get unique categories from all projects
  $: categories = (() => {
    const cats = new Set<string>();
    projects.forEach((p) => {
      // Add categories from categories array
      if (p.categories && p.categories.length > 0) {
        p.categories.forEach((cat) => cats.add(cat));
      }
      // Also add single category for backward compatibility
      if (p.category) {
        cats.add(p.category);
      }
    });
    return Array.from(cats).sort();
  })();

  // Count active filters
  $: activeFilterCount = (searchQuery ? 1 : 0) + (selectedCategory !== null ? 1 : 0);

  // Clear all filters
  const clearFilters = () => {
    searchQuery = '';
    selectedCategory = null;
  };

  // Define tabs for the left panel
  $: tabs = [
    {
      id: 'search',
      label: 'Search',
      content: SearchFilterContent,
    },
  ];

  // Track if clear button should be shown
  let showClearButton = false;
  $: showClearButton = activeFilterCount > 0;
</script>

<!-- Search/Filter Content Component -->
<script lang="ts" context="module">
  export const SearchFilterContent = null; // Will be slot content
</script>

<!-- Overlay Panel -->
<OverlayPanel
  {tabs}
  defaultTab="search"
  position="left"
  storageKey="projects-grid"
>
  <!-- Custom Header Slot -->
  <div slot="header" class="px-3 py-1.5 text-xs flex items-center justify-between">
    <span style="color: var(--text-muted)">
      {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
      {#if activeFilterCount > 0}
        <span style="color: var(--accent-secondary)"> • {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}</span>
      {/if}
    </span>
    {#if showClearButton}
      <button
        on:click={clearFilters}
        class="btn-terminal text-xs px-2.5 py-1.5"
        style="color: var(--error-color); min-height: 32px;"
        aria-label="Clear all filters"
      >
        Clear all
      </button>
    {/if}
  </div>

  <div slot="search" style="padding: 12px">
    <!-- Search Input -->
    <div style="margin-bottom: 16px">
      <label class="block text-sm mb-3" style="color: var(--accent-secondary)">
        Search
      </label>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Type to search projects..."
        class="input-terminal transition-all"
      />
    </div>

    <!-- Category Filter -->
    <div>
      <div class="text-sm mb-3" style="color: var(--accent-secondary)">
        Filter by category
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          on:click={() => selectedCategory = null}
          class="px-4 py-2.5 {selectedCategory === null ? 'btn-terminal-selected' : 'btn-terminal-muted'}"
        >
          [all]
        </button>
        {#each categories as cat}
          <button
            on:click={() => selectedCategory = cat}
            class="px-4 py-2.5 {selectedCategory === cat ? 'btn-terminal-selected' : 'btn-terminal-muted'}"
          >
            [{cat}]
          </button>
        {/each}
      </div>
    </div>
  </div>
</OverlayPanel>

<!-- Main Content - Projects Grid -->
<div class="py-6 md:py-8 px-4 md:px-6 max-w-6xl mx-auto">
  {#if filteredProjects.length === 0}
    <div class="py-12 text-center">
      <div class="text-sm mb-2" style="color: var(--text-muted)">No results found</div>
      <p class="text-sm" style="color: var(--text-muted)">
        Try adjusting your search query or filters
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {#each filteredProjects as project (project.id)}
        <a
          href="/projects/{project.slug}"
          class="block group"
          style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
        >
          <!-- Project Image or Placeholder -->
          {#if project.featuredImage}
            <div class="mb-3 aspect-video overflow-hidden" style="background-color: var(--bg-surface)">
              <img
                src={project.featuredImage}
                alt={project.title}
                class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </div>
          {:else}
            <div class="mb-3 aspect-video flex items-center justify-center" style="background-color: var(--bg-surface)">
              <div class="text-6xl opacity-30" style="color: var(--text-muted)">
                {project.modelFile ? '🔲' : '📁'}
              </div>
            </div>
          {/if}

          <!-- Project Info -->
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-base md:text-sm transition-opacity group-hover:opacity-70" style="color: var(--text-primary)">
                {project.title}
              </h3>
              {#if project.categories && project.categories.length > 0}
                <div class="flex flex-wrap gap-1 text-xs whitespace-nowrap" style="color: var(--text-muted)">
                  {#each project.categories.slice(0, 2) as cat}
                    <span>[{cat}]</span>
                  {/each}
                </div>
              {/if}
            </div>

            <p class="text-sm line-clamp-2" style="color: var(--text-muted)">
              {project.description}
            </p>

            {#if project.tags && project.tags.length > 0}
              <div class="flex flex-wrap gap-2 text-xs">
                {#each project.tags.slice(0, 3) as tag}
                  <span style="color: var(--text-muted)">#{tag}</span>
                {/each}
              </div>
            {/if}

            {#if project.modelFile}
              <div class="text-xs" style="color: var(--accent-primary)">
                3D model available
              </div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
