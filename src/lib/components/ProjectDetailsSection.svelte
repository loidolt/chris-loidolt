<script lang="ts">
  import ImageGallery from './ImageGallery.svelte';
  import ModelViewer from './ModelViewer.svelte';
  import type { Project } from '$lib/pocketbase';

  export let project: Project;

  type SectionType = 'gallery' | 'model' | 'metadata' | null;
  let expandedSection: SectionType = null;

  $: hasGallery = project.images && project.images.length > 0;
  $: hasModel = project.modelPath || project.modelFile;
  $: hasAdditionalMetadata = project.cleanRepo || project.lastModified || (project.modelFile || project.modelPath);

  // If nothing to show, don't render the section
  $: showSection = hasGallery || hasModel || hasAdditionalMetadata;

  function toggleSection(section: SectionType) {
    expandedSection = expandedSection === section ? null : section;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
</script>

{#if showSection}
  <div class="border-t pt-8" style="border-color: var(--border-color)">
    <div class="text-sm mb-4" style="color: var(--accent-secondary)">
      Additional Details
    </div>

    <div class="space-y-2">
      <!-- Gallery Section -->
      {#if hasGallery}
        <div class="border" style="border-color: var(--border-color)">
          <button
            on:click={() => toggleSection('gallery')}
            class="w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:opacity-70 transition-opacity"
            style="background-color: var(--bg-surface)"
          >
            <div class="flex items-center gap-2">
              <span style="color: var(--text-muted)">
                {expandedSection === 'gallery' ? '▼' : '▶'}
              </span>
              <span style="color: var(--accent-primary)">gallery/</span>
              <span style="color: var(--text-muted)">
                ({project.images.length} {project.images.length === 1 ? 'image' : 'images'})
              </span>
            </div>
          </button>
          {#if expandedSection === 'gallery'}
            <div class="p-6" style="background-color: var(--bg-dark)">
              <ImageGallery
                images={project.images}
                featuredImage={project.featuredImage}
                projectTitle={project.title}
              />
            </div>
          {/if}
        </div>
      {/if}

      <!-- 3D Model Section -->
      {#if hasModel}
        <div class="border" style="border-color: var(--border-color)">
          <div
            class="w-full px-4 py-3 text-sm flex items-center justify-between"
            style="background-color: var(--bg-surface)"
          >
            <button
              on:click={() => toggleSection('model')}
              class="flex items-center gap-2 hover:opacity-70 transition-opacity text-left flex-1"
            >
              <span style="color: var(--text-muted)">
                {expandedSection === 'model' ? '▼' : '▶'}
              </span>
              <span style="color: var(--accent-primary)">
                {project.modelPath || project.modelFile}
              </span>
              <span style="color: var(--text-muted)">(3D model)</span>
            </button>
            {#if project.modelUrl}
              <a
                href={project.modelUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="hover:opacity-70 transition-opacity ml-4"
                style="color: var(--link-color)"
                on:click={(e) => e.stopPropagation()}
              >
                [View Source →]
              </a>
            {/if}
          </div>
          {#if expandedSection === 'model'}
            <div class="p-6" style="background-color: var(--bg-dark)">
              <div class="max-w-3xl mx-auto">
                <ModelViewer modelPath={project.modelPath || `/models/${project.modelFile}`} />
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Additional Metadata Section -->
      {#if hasAdditionalMetadata}
        <div class="border" style="border-color: var(--border-color)">
          <button
            on:click={() => toggleSection('metadata')}
            class="w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:opacity-70 transition-opacity"
            style="background-color: var(--bg-surface)"
          >
            <div class="flex items-center gap-2">
              <span style="color: var(--text-muted)">
                {expandedSection === 'metadata' ? '▼' : '▶'}
              </span>
              <span style="color: var(--accent-primary)">metadata.json</span>
              <span style="color: var(--text-muted)">(additional info)</span>
            </div>
          </button>
          {#if expandedSection === 'metadata'}
            <div class="p-6" style="background-color: var(--bg-dark)">
              <div class="space-y-3 text-sm">
                {#if project.modelFile || project.modelPath}
                  <div class="flex items-start gap-4">
                    <span class="min-w-[120px]" style="color: var(--text-muted)">
                      3d_model
                    </span>
                    <span style="color: var(--text-primary)">
                      {project.modelPath || project.modelFile}
                    </span>
                  </div>
                {/if}

                {#if project.cleanRepo}
                  <div class="flex items-start gap-4">
                    <span class="min-w-[120px]" style="color: var(--text-muted)">
                      clean_repo
                    </span>
                    <span style="color: var(--accent-primary)">✓</span>
                  </div>
                {/if}

                {#if project.lastModified}
                  <div class="flex items-start gap-4">
                    <span class="min-w-[120px]" style="color: var(--text-muted)">
                      last_modified
                    </span>
                    <span style="color: var(--text-primary)">
                      {formatDate(project.lastModified)}
                    </span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
