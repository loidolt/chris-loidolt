<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  import type { Project } from '$lib/pocketbase';
  import OverlayPanel, { type PanelTab } from '$lib/components/OverlayPanel.svelte';
  import ProjectDetailsSection from '$lib/components/ProjectDetailsSection.svelte';

  export let data: PageData;

  $: project = data.project;
  $: allProjects = data.allProjects;

  // Calculate related projects
  function getRelatedProjects(currentProject: Project, allProjects: Project[], limit: number = 6): Project[] {
    const related = allProjects
      .filter((p) => p.id !== currentProject.id)
      .map((p) => {
        let score = 0;

        // Score based on shared categories
        const sharedCategories = (currentProject.categories || []).filter(
          (cat) => (p.categories || []).includes(cat)
        );
        score += sharedCategories.length * 3;

        // Score based on shared tags
        const sharedTags = (currentProject.tags || []).filter(
          (tag) => (p.tags || []).includes(tag)
        );
        score += sharedTags.length * 2;

        return { project: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.project);

    return related;
  }

  $: relatedProjects = getRelatedProjects(project, allProjects);

  // Format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Create panel tabs (we'll render content inline for now)
  let tabs: PanelTab[] = [
    { id: 'info', label: 'Info', content: null },
    { id: 'related', label: 'Related', content: null },
  ];

  let activeTab = 'info';
</script>

<svelte:head>
  <title>{project.title} - Portfolio</title>
  <meta name="description" content={project.description} />
</svelte:head>

<!-- Note: OverlayPanel needs to be refactored to support dynamic content -->
<!-- For now, we'll skip it and add it later -->

<!-- Main Content -->
<div class="py-6 md:py-8 px-4 md:px-6 max-w-5xl mx-auto">
  <div class="space-y-8">
    <!-- Back Button -->
    <div class="flex items-center gap-3 text-base md:text-sm">
      <a
        href="/projects"
        class="hover:opacity-70 transition-opacity py-2"
        style="color: var(--link-color); touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
      >
        [← back to projects]
      </a>
    </div>

    <!-- Title -->
    <div>
      <h1 class="text-xl md:text-2xl mb-3" style="color: var(--text-primary)">
        {project.title}
      </h1>
    </div>

    <!-- Featured Image -->
    {#if project.featuredImage}
      <div class="border" style="border-color: var(--border-color)">
        <img
          src={project.featuredImage}
          alt={project.title}
          class="w-full h-auto"
          loading="eager"
        />
      </div>
    {/if}

    <!-- Placeholder if no media -->
    {#if !project.featuredImage && !(project.images && project.images.length > 0) && !(project.modelPath || project.modelFile)}
      <div
        class="p-12 flex items-center justify-center aspect-square"
        style="background-color: var(--bg-surface)"
      >
        <div class="text-6xl opacity-30" style="color: var(--text-muted)">
          📁
        </div>
      </div>
    {/if}

    <!-- Description -->
    <div>
      <div class="text-sm mb-4" style="color: var(--accent-secondary)">
        Description
      </div>
      <div
        class="text-base md:text-sm whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none"
        style="color: var(--text-primary)"
      >
        {#if project.markdown}
          {@html project.markdown}
        {:else}
          <p>{project.longDescription || project.description}</p>
        {/if}
      </div>
    </div>

    <!-- Project Metadata Sidebar (inline for now) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Main content area -->
      <div class="md:col-span-2">
        <!-- Expandable Details Section -->
        <ProjectDetailsSection {project} />
      </div>

      <!-- Sidebar with metadata -->
      <div class="md:col-span-1 space-y-6">
        <!-- Categories -->
        {#if project.categories && project.categories.length > 0}
          <div>
            <div class="mb-2 text-sm" style="color: var(--accent-secondary)">
              Categories
            </div>
            <div class="flex flex-wrap gap-2 text-sm" style="color: var(--text-muted)">
              {#each project.categories as cat}
                <span>[{cat}]</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Date -->
        {#if project.date}
          <div>
            <div class="mb-2 text-sm" style="color: var(--accent-secondary)">
              Date
            </div>
            <div class="text-sm" style="color: var(--text-primary)">
              {formatDate(project.date)}
            </div>
          </div>
        {/if}

        <!-- Tags -->
        {#if project.tags && project.tags.length > 0}
          <div>
            <div class="mb-2 text-sm" style="color: var(--accent-secondary)">
              Tags
            </div>
            <div class="flex flex-wrap gap-2 text-sm" style="color: var(--text-muted)">
              {#each project.tags as tag}
                <span>#{tag}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Links -->
        {#if project.repository || project.website || project.attribution}
          <div>
            <div class="mb-2 text-sm" style="color: var(--accent-secondary)">
              Links
            </div>
            <div class="space-y-2 text-sm">
              {#if project.repository}
                <a
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block hover:opacity-70 transition-opacity py-1"
                  style="color: var(--link-color); touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
                >
                  [GitHub →]
                </a>
              {/if}
              {#if project.website}
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block hover:opacity-70 transition-opacity py-1"
                  style="color: var(--link-color); touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
                >
                  [Visit Website →]
                </a>
              {/if}
              {#if project.attribution}
                <a
                  href={project.attribution}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block hover:opacity-70 transition-opacity py-1"
                  style="color: var(--text-muted); touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
                >
                  [Attribution →]
                </a>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Related Projects -->
        {#if relatedProjects.length > 0}
          <div>
            <div class="mb-2 text-sm" style="color: var(--accent-secondary)">
              Related Projects
            </div>
            <div class="space-y-4 text-sm">
              {#each relatedProjects as p}
                <a
                  href="/projects/{p.slug}"
                  class="block hover:opacity-70 transition-opacity"
                  style="border-left: 2px solid var(--border-color); padding-left: 12px;"
                >
                  <div style="color: var(--link-color)" class="mb-1">
                    {p.title}
                  </div>
                  {#if p.categories && p.categories.length > 0}
                    <div class="flex flex-wrap gap-1 text-xs" style="color: var(--text-muted)">
                      {#each p.categories as cat}
                        <span>[{cat}]</span>
                      {/each}
                    </div>
                  {/if}
                </a>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
