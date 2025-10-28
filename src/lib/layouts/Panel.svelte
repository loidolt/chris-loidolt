<script lang="ts">
  /**
   * Panel component - collapsible/expandable content panel
   *
   * Features:
   * - Expandable/collapsible sections
   * - Smooth animations
   * - Optional header with icon
   * - Controlled or uncontrolled mode
   */

  export let title: string;
  export let defaultOpen = false;
  export let open: boolean | undefined = undefined; // Controlled mode
  export let className = '';

  // Internal state for uncontrolled mode
  let internalOpen = defaultOpen;

  // Use controlled state if provided, otherwise use internal
  $: isOpen = open !== undefined ? open : internalOpen;

  function toggle() {
    if (open === undefined) {
      internalOpen = !internalOpen;
    }
  }
</script>

<div
  class="rounded-lg overflow-hidden {className}"
  style="background-color: var(--bg-surface); border: 1px solid var(--border-color);"
>
  <button
    class="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:opacity-80"
    style="background-color: var(--bg-elevated);"
    on:click={toggle}
  >
    <span class="font-semibold" style="color: var(--text-primary);">{title}</span>
    <span class="transition-transform duration-200" style="transform: rotate({isOpen ? '180deg' : '0deg'});">
      ▼
    </span>
  </button>

  {#if isOpen}
    <div
      class="px-6 py-4"
      style="border-top: 1px solid var(--border-color);"
    >
      <slot />
    </div>
  {/if}
</div>
