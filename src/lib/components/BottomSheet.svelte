<script lang="ts">
  import { browser } from '$app/environment';
  import type { Snippet } from 'svelte';

  /**
   * Mobile-optimized bottom sheet panel
   * Swipeable drawer that appears from the bottom of the screen
   */

  type Props = {
    isOpen?: boolean;
    onToggle?: () => void;
    title?: string;
    children?: Snippet;
  };

  let {
    isOpen = $bindable(false),
    onToggle,
    title = '',
    children,
  }: Props = $props();

  let startY = $state(0);
  let currentY = $state(0);
  let isDragging = $state(false);
  let sheetElement: HTMLDivElement;

  // Calculate sheet position
  const translateY = $derived(
    isDragging ? Math.max(0, currentY - startY) : isOpen ? 0 : 500
  );

  function handleTouchStart(e: TouchEvent) {
    if (!browser) return;
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || !browser) return;
    currentY = e.touches[0].clientY;
  }

  function handleTouchEnd() {
    if (!isDragging || !browser) return;
    isDragging = false;

    const diff = currentY - startY;

    // If dragged down more than 100px, close
    if (diff > 100) {
      isOpen = false;
      onToggle?.();
    } else {
      // Otherwise, snap back
      currentY = startY;
    }
  }

  function toggleSheet() {
    isOpen = !isOpen;
    onToggle?.();
  }
</script>

<!-- Backdrop -->
{#if isOpen}
  <div
    class="fixed inset-0 bg-black/50 z-40 transition-opacity"
    onclick={toggleSheet}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Escape' && toggleSheet()}
  ></div>
{/if}

<!-- Bottom Sheet -->
<div
  bind:this={sheetElement}
  class="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl shadow-2xl transition-transform"
  style="transform: translateY({translateY}px); will-change: transform;"
  role="dialog"
  aria-modal="true"
  aria-label={title}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
>
  <!-- Handle -->
  <div class="flex justify-center py-3 cursor-grab active:cursor-grabbing">
    <div class="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
  </div>

  <!-- Header -->
  {#if title}
    <div class="px-4 pb-3 border-b border-border">
      <h2 class="text-lg font-semibold">{title}</h2>
    </div>
  {/if}

  <!-- Content -->
  <div class="max-h-[70dvh] overflow-y-auto overscroll-contain p-4">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  /* Ensure smooth scrolling on iOS */
  .overscroll-contain {
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
</style>
