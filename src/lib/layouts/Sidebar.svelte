<script lang="ts">
  /**
   * Sidebar layout - collapsible sidebar with main content area
   *
   * Features:
   * - Responsive: sidebar on desktop, drawer on mobile
   * - Collapsible sidebar
   * - Sticky positioning option
   * - Left or right placement
   */

  export let side: 'left' | 'right' = 'left';
  export let sidebarWidth = '280px';
  export let sticky = false;
  export let collapsible = true;
  export let defaultOpen = true;

  let isOpen = defaultOpen;

  function toggleSidebar() {
    if (collapsible) {
      isOpen = !isOpen;
    }
  }
</script>

<div class="flex flex-col lg:flex-row min-h-screen" style="flex-direction: {side === 'right' ? 'row-reverse' : 'row'}">
  <!-- Mobile Menu Button -->
  {#if collapsible}
    <button
      class="lg:hidden fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg"
      style="background-color: var(--bg-elevated); border: 1px solid var(--border-color);"
      on:click={toggleSidebar}
    >
      {isOpen ? '✕' : '☰'}
    </button>
  {/if}

  <!-- Sidebar -->
  <aside
    class="
      {isOpen ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'}
      lg:translate-x-0
      fixed lg:relative
      top-0 {side === 'left' ? 'left-0' : 'right-0'}
      h-screen
      transition-transform duration-300 ease-in-out
      z-40
      overflow-y-auto
      {sticky ? 'lg:sticky lg:top-0' : ''}
    "
    style="
      width: {sidebarWidth};
      background-color: var(--bg-surface);
      border-{side === 'left' ? 'right' : 'left'}: 1px solid var(--border-color);
    "
  >
    <slot name="sidebar" />
  </aside>

  <!-- Overlay on mobile when sidebar is open -->
  {#if isOpen && collapsible}
    <button
      class="lg:hidden fixed inset-0 bg-black/50 z-30"
      on:click={toggleSidebar}
      aria-label="Close sidebar"
    >
      <!-- Overlay button -->
    </button>
  {/if}

  <!-- Main Content -->
  <main class="flex-1 overflow-x-hidden">
    <slot />
  </main>
</div>
