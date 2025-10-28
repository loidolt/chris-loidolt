<script lang="ts">
  import Fuse from 'fuse.js';
  import type { Project } from '$lib/pocketbase';
  import DataPanel, { type PanelTab } from './DataPanel.svelte';
  import SearchFilter, { type FilterSection } from './SearchFilter.svelte';

  export let projects: Project[];

  let searchQuery = '';
  let selectedFilters: Record<string, any> = {
    category: null,
  };

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
    if (selectedFilters.category) {
      filtered = filtered.filter((p) => {
        // Check both categories array and single category for backward compatibility
        if (p.categories && p.categories.includes(selectedFilters.category)) {
          return true;
        }
        return p.category === selectedFilters.category;
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
  $: activeFilterCount = (searchQuery ? 1 : 0) + (selectedFilters.category ? 1 : 0);

  // Clear all filters
  const clearFilters = () => {
    searchQuery = '';
    selectedFilters = { category: null };
  };

  // Define filter sections for SearchFilter component
  $: filterSections = [
    {
      id: 'category',
      label: 'Category',
      type: 'single',
      options: categories.map(cat => ({
        value: cat,
        label: cat,
        count: projects.filter(p =>
          (p.categories && p.categories.includes(cat)) || p.category === cat
        ).length,
      })),
    },
  ] as FilterSection[];

  // Define tabs for the panel
  const tabs: PanelTab[] = [
    {
      id: 'search',
      label: 'Search',
    },
  ];
</script>

<!-- Data Panel -->
<DataPanel
  {tabs}
  defaultTab="search"
  position="left"
  storageKey="projects-grid"
>
  <div slot="search">
    <SearchFilter
      bind:searchQuery
      bind:selectedFilters
      {filterSections}
      {activeFilterCount}
      resultCount={filteredProjects.length}
      searchPlaceholder="Type to search projects..."
      onClearAll={clearFilters}
    />
  </div>
</DataPanel>

<!-- Main Content - Projects Grid -->
<div class="py-6 md:py-8 px-4 md:px-6 max-w-6xl mx-auto">
  {#if filteredProjects.length === 0}
    <div class="py-12 text-center">
      <div class="text-sm mb-2 text-muted-foreground">No results found</div>
      <p class="text-sm text-muted-foreground">
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
            <div class="mb-3 aspect-video overflow-hidden bg-muted rounded-md">
              <img
                src={project.featuredImage}
                alt={project.title}
                class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </div>
          {:else}
            <div class="mb-3 aspect-video flex items-center justify-center bg-muted rounded-md">
              <div class="text-6xl opacity-30 text-muted-foreground">
                {project.modelFile ? '🔲' : '📁'}
              </div>
            </div>
          {/if}

          <!-- Project Info -->
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-base md:text-sm transition-opacity group-hover:opacity-70 font-medium">
                {project.title}
              </h3>
              {#if project.categories && project.categories.length > 0}
                <div class="flex flex-wrap gap-1 text-xs whitespace-nowrap text-muted-foreground">
                  {#each project.categories.slice(0, 2) as cat}
                    <span class="bg-muted px-1.5 py-0.5 rounded">{cat}</span>
                  {/each}
                </div>
              {/if}
            </div>

            <p class="text-sm line-clamp-2 text-muted-foreground">
              {project.description}
            </p>

            {#if project.tags && project.tags.length > 0}
              <div class="flex flex-wrap gap-2 text-xs">
                {#each project.tags.slice(0, 3) as tag}
                  <span class="text-muted-foreground">#{tag}</span>
                {/each}
              </div>
            {/if}

            {#if project.modelFile}
              <div class="text-xs text-primary font-medium">
                3D model available
              </div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
