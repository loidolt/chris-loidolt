<script lang="ts">
  /**
   * Modal component - accessible modal dialog
   *
   * Features:
   * - Accessible with proper ARIA attributes
   * - Backdrop click to close
   * - ESC key to close
   * - Body scroll lock
   * - Animation
   * - Size variants
   */

  import { createEventDispatcher, onMount } from 'svelte';

  export let open = false;
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  export let closeOnBackdrop = true;
  export let closeOnEscape = true;
  export let title: string | null = null;

  const dispatch = createEventDispatcher();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  function close() {
    open = false;
    dispatch('close');
  }

  function handleBackdropClick() {
    if (closeOnBackdrop) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && closeOnEscape) {
      close();
    }
  }

  $: if (open && typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  } else if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    tabindex="-1"
  >
    <!-- Backdrop -->
    <button
      class="absolute inset-0"
      style="background-color: var(--overlay-bg);"
      on:click={handleBackdropClick}
      aria-label="Close modal"
      tabindex="-1"
    >
      <!-- Empty button for backdrop -->
    </button>

    <!-- Modal Content -->
    <div
      class="
        relative
        w-full {sizeClasses[size]}
        max-h-[90vh]
        overflow-y-auto
        rounded-lg
        shadow-2xl
        animate-in fade-in zoom-in-95
      "
      style="background-color: var(--bg-elevated); border: 1px solid var(--border-color);"
    >
      {#if title || $$slots.header}
        <div class="sticky top-0 flex items-center justify-between p-6 pb-4" style="background-color: var(--bg-elevated); border-bottom: 1px solid var(--border-color);">
          {#if title}
            <h2 id="modal-title" class="text-xl font-bold" style="color: var(--text-primary);">
              {title}
            </h2>
          {:else}
            <slot name="header" />
          {/if}
          <button
            class="text-2xl leading-none transition-opacity hover:opacity-70"
            style="color: var(--text-muted);"
            on:click={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      {/if}

      <div class="p-6">
        <slot />
      </div>

      {#if $$slots.footer}
        <div class="sticky bottom-0 p-6 pt-4" style="background-color: var(--bg-elevated); border-top: 1px solid var(--border-color);">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}
