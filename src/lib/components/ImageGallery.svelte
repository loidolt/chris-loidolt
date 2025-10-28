<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  export let images: string[];
  export let featuredImage: string | undefined = undefined;
  export let projectTitle: string;

  let selectedIndex: number | null = null;

  // Combine featured image with gallery images
  $: allImages = featuredImage ? [featuredImage, ...images] : images;

  // Handle keyboard navigation
  function handleKeyDown(e: KeyboardEvent) {
    if (selectedIndex === null) return;

    if (e.key === 'Escape') {
      selectedIndex = null;
    } else if (e.key === 'ArrowRight') {
      if (selectedIndex !== null && selectedIndex < allImages.length - 1) {
        selectedIndex++;
      }
    } else if (e.key === 'ArrowLeft') {
      if (selectedIndex !== null && selectedIndex > 0) {
        selectedIndex--;
      }
    }
  }

  // Prevent body scroll when lightbox is open
  $: if (browser) {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (browser) {
      document.body.style.overflow = '';
    }
  });

  // Add keyboard listener
  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function openLightbox(index: number) {
    selectedIndex = index;
  }

  function closeLightbox() {
    selectedIndex = null;
  }

  function goToPrevious() {
    if (selectedIndex !== null && selectedIndex > 0) {
      selectedIndex--;
    }
  }

  function goToNext() {
    if (selectedIndex !== null && selectedIndex < allImages.length - 1) {
      selectedIndex++;
    }
  }
</script>

<!-- Featured Image -->
{#if featuredImage}
  <div
    class="cursor-pointer hover:opacity-90 transition-opacity"
    style="background-color: var(--bg-surface)"
    on:click={() => openLightbox(0)}
    on:keydown={(e) => e.key === 'Enter' && openLightbox(0)}
    role="button"
    tabindex="0"
  >
    <img src={featuredImage} alt={projectTitle} class="w-full h-auto" />
    <div class="text-xs text-center py-2" style="color: var(--text-muted)">
      [click to enlarge]
    </div>
  </div>
{/if}

<!-- Gallery Grid -->
{#if images.length > 0}
  <div>
    <div class="text-sm mb-4" style="color: var(--link-color)">$ ls images/</div>
    <div class="grid grid-cols-2 gap-3">
      {#each images as img, idx}
        {@const actualIndex = featuredImage ? idx + 1 : idx}
        <div
          class="cursor-pointer group relative"
          style="background-color: var(--bg-surface)"
          on:click={() => openLightbox(actualIndex)}
          on:keydown={(e) => e.key === 'Enter' && openLightbox(actualIndex)}
          role="button"
          tabindex="0"
        >
          <img src={img} alt="{projectTitle} - {idx + 1}" class="w-full h-auto" />
          <div
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style="background-color: rgba(0,0,0,0.3)"
          >
            <span class="text-sm" style="color: var(--link-color)">[click to enlarge]</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<!-- Lightbox Modal -->
{#if selectedIndex !== null}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0,0,0,0.95)"
    on:click={closeLightbox}
    on:keydown={(e) => e.key === 'Escape' && closeLightbox()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Close Button -->
    <button
      on:click={closeLightbox}
      class="absolute top-4 right-4 hover:opacity-70 transition-opacity text-2xl z-10"
      style="color: var(--text-primary)"
      aria-label="Close lightbox"
    >
      [×]
    </button>

    <!-- Image Counter -->
    <div class="absolute top-4 left-4 text-sm z-10" style="color: var(--link-color)">
      $ viewing image {selectedIndex + 1}/{allImages.length}
    </div>

    <!-- Navigation Hint -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs z-10" style="color: var(--text-muted)">
      [← → to navigate | ESC to close]
    </div>

    <!-- Previous Button -->
    {#if selectedIndex > 0}
      <button
        on:click={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
        class="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity text-4xl z-10"
        style="color: var(--link-color)"
        aria-label="Previous image"
      >
        ‹
      </button>
    {/if}

    <!-- Next Button -->
    {#if selectedIndex < allImages.length - 1}
      <button
        on:click={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        class="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity text-4xl z-10"
        style="color: var(--link-color)"
        aria-label="Next image"
      >
        ›
      </button>
    {/if}

    <!-- Image Container -->
    <div
      class="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
      on:click={(e) => e.stopPropagation()}
      on:keydown={(e) => e.key === 'Enter' && e.stopPropagation()}
      role="button"
      tabindex="0"
    >
      <img
        src={allImages[selectedIndex]}
        alt="{projectTitle} - {selectedIndex + 1}"
        class="max-w-full max-h-[90vh] w-auto h-auto object-contain border-2"
        style="border-color: var(--border-color)"
      />
    </div>
  </div>
{/if}
