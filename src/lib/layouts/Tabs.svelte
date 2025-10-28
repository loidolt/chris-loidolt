<script lang="ts">
  /**
   * Tabs component - tabbed navigation interface
   *
   * Features:
   * - Multiple tab styles (line, pills, buttons)
   * - Controlled or uncontrolled mode
   * - Keyboard navigation
   * - Mobile-friendly
   */

  export let tabs: Array<{ id: string; label: string; icon?: string }>;
  export let activeTab: string | undefined = undefined; // Controlled mode
  export let defaultTab: string = tabs[0]?.id || '';
  export let variant: 'line' | 'pills' | 'buttons' = 'line';
  export let fullWidth = false;

  let internalActiveTab = defaultTab;
  $: currentTab = activeTab !== undefined ? activeTab : internalActiveTab;

  function selectTab(tabId: string) {
    if (activeTab === undefined) {
      internalActiveTab = tabId;
    }
  }
</script>

<div class="tabs-container">
  <!-- Tab Navigation -->
  <div
    class="flex {fullWidth ? 'w-full' : ''} overflow-x-auto"
    style="border-bottom: {variant === 'line' ? '1px solid var(--border-color)' : 'none'};"
    role="tablist"
  >
    {#each tabs as tab}
      <button
        role="tab"
        aria-selected={currentTab === tab.id}
        class="
          {fullWidth ? 'flex-1' : ''}
          px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
          {variant === 'line' ? 'border-b-2' : ''}
          {variant === 'pills' ? 'rounded-lg mx-1' : ''}
          {variant === 'buttons' ? 'border border-transparent' : ''}
        "
        style="
          color: {currentTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)'};
          border-color: {currentTab === tab.id && variant === 'line' ? 'var(--accent-primary)' : 'transparent'};
          background-color: {currentTab === tab.id && variant === 'pills' ? 'var(--bg-elevated)' : 'transparent'};
          border-color: {currentTab === tab.id && variant === 'buttons' ? 'var(--border-color)' : 'transparent'};
        "
        on:click={() => selectTab(tab.id)}
      >
        {#if tab.icon}
          <span class="mr-2">{tab.icon}</span>
        {/if}
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Tab Content -->
  <div class="mt-6">
    <slot {currentTab} />
  </div>
</div>
