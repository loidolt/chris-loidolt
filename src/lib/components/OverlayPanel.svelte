<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export interface PanelTab {
    id: string;
    label: string;
    content: any; // Svelte component or snippet
    disabled?: boolean;
  }

  export let tabs: PanelTab[];
  export let defaultTab: string | undefined = undefined;
  export let defaultOpen = false;
  export let panelHeader: any = undefined;
  export let onTabChange: ((tabId: string) => void) | undefined = undefined;
  export let position: 'left' | 'right' = 'left';
  export let width = {
    mobile: 'calc(100vw - 16px)',
    desktop: '400px',
  };
  export let open: boolean | undefined = undefined;
  export let onOpenChange: ((open: boolean) => void) | undefined = undefined;
  export let tabBarWidth = 32;
  export let mobileBreakpoint = 640;
  export let storageKey: string | undefined = undefined;

  let internalPanelOpen = defaultOpen;
  let internalActiveTab = defaultTab || tabs[0]?.id || '';
  let isMobile = false;

  // Use controlled state if provided, otherwise use internal state
  $: isPanelOpen = open !== undefined ? open : internalPanelOpen;
  $: activeTab = defaultTab !== undefined ? defaultTab : internalActiveTab;
  $: activeTabData = tabs.find(t => t.id === activeTab);

  const setIsPanelOpen = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (open === undefined) internalPanelOpen = newOpen;
  };

  const setActiveTab = (tabId: string) => {
    if (onTabChange) onTabChange(tabId);
    if (defaultTab === undefined) internalActiveTab = tabId;
  };

  // Mobile detection
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < mobileBreakpoint;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Load state from localStorage
    if (storageKey && browser) {
      try {
        const stored = localStorage.getItem(`overlayPanel_${storageKey}_open`);
        if (stored !== null && open === undefined) {
          internalPanelOpen = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error loading panel state:', error);
      }
    }

    return () => window.removeEventListener('resize', checkMobile);
  });

  // Save to localStorage
  $: if (browser && storageKey && open === undefined) {
    try {
      localStorage.setItem(`overlayPanel_${storageKey}_open`, JSON.stringify(isPanelOpen));
    } catch (error) {
      console.error('Error saving panel state:', error);
    }
  }

  // Auto-close on mobile
  $: if (isMobile) setIsPanelOpen(false);

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId && isPanelOpen) {
      setIsPanelOpen(false);
    } else {
      setActiveTab(tabId);
      setIsPanelOpen(true);
    }
  };

  // Styling helpers
  const getContainerPosition = (pos: string) => (pos === 'left' ? 'left: 2px' : 'right: 2px');
  const getContainerTransform = (isOpen: boolean, pos: string, width: number) => {
    if (pos === 'left') {
      return isOpen ? 'translateX(0)' : `translateX(calc(-100% + ${width}px))`;
    }
    return isOpen ? 'translateX(0)' : `translateX(calc(100% - ${width}px))`;
  };
  const getFlexDirection = (pos: string) => (pos === 'left' ? 'row-reverse' : 'row');
</script>

<div
  class="fixed top-[60px] sm:top-[68px] bottom-16 sm:bottom-20 flex z-[1000] transition-transform duration-300 ease-in-out"
  style="{getContainerPosition(position)}; flex-direction: {getFlexDirection(position)}; transform: {getContainerTransform(isPanelOpen, position, tabBarWidth)}; max-width: 100vw;"
  role="complementary"
  aria-label="Side panel"
>
  <!-- Vertical Tab Bar -->
  <div
    class="flex flex-col flex-shrink-0"
    style="width: {tabBarWidth}px; background-color: transparent; padding-top: 4px; padding-bottom: 4px; gap: 3px;"
    role="tablist"
    aria-label="Panel tabs"
    aria-orientation="vertical"
  >
    {#each tabs as tab}
      {@const isActive = activeTab === tab.id}
      <button
        on:click={() => handleTabClick(tab.id)}
        class="flex items-center justify-center transition-all hover:opacity-70"
        style="
          padding: 10px 4px;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 11px;
          font-weight: {isActive ? 600 : 400};
          color: {isActive ? 'var(--link-color)' : 'var(--text-muted)'};
          background-color: {isActive && isPanelOpen ? 'var(--bg-primary)' : isActive ? 'var(--bg-surface)' : 'var(--color-terminal-darker)'};
          border: 1px solid var(--border-color);
          opacity: {tab.disabled ? 0.5 : 1};
          min-height: 56px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          z-index: {isActive ? 10 : 1};
          transform: {isActive ? 'scale(1)' : 'scale(0.95)'};
          {position === 'left'
            ? `border-top-right-radius: 3px; border-bottom-right-radius: 3px; border-left: ${isActive ? '2px solid var(--link-color)' : '1px solid var(--border-color)'}; box-shadow: ${isActive && isPanelOpen ? '4px 0 12px rgba(0,0,0,0.35)' : '2px 0 4px rgba(0,0,0,0.15)'};`
            : `border-top-left-radius: 3px; border-bottom-left-radius: 3px; border-right: ${isActive ? '2px solid var(--link-color)' : '1px solid var(--border-color)'}; box-shadow: ${isActive && isPanelOpen ? '-4px 0 12px rgba(0,0,0,0.35)' : '-2px 0 4px rgba(0,0,0,0.15)'};`}
        "
        role="tab"
        aria-selected={isActive}
        aria-controls="panel-{tab.id}"
        disabled={tab.disabled}
        tabindex={isActive ? 0 : -1}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Panel Content -->
  <div
    id="panel-{activeTab}"
    class="flex flex-col flex-1"
    role="tabpanel"
    aria-labelledby="tab-{activeTab}"
    style="
      width: {isMobile ? width.mobile : width.desktop};
      max-width: calc(100vw - {tabBarWidth + 16}px);
      background-color: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      {position === 'left' ? 'border-left: 1px solid var(--border-color);' : 'border-right: 1px solid var(--border-color);'}
      box-shadow: {isPanelOpen ? '0 8px 24px rgba(0,0,0,0.4)' : 'none'};
    "
  >
    <!-- Panel Header -->
    <div class="flex-shrink-0" style="border-bottom: 1px solid var(--border-color); background-color: var(--bg-surface);">
      <!-- Top bar with active tab name and close button -->
      <div class="flex items-center justify-between px-3 py-1.5" style="border-bottom: 1px solid var(--border-color);">
        <div class="text-xs font-semibold" style="color: var(--link-color);">
          {activeTabData?.label}
        </div>
        <button
          on:click={() => setIsPanelOpen(false)}
          class="text-sm sm:text-xs hover:opacity-70 transition-opacity px-2 py-1"
          style="color: var(--text-muted); min-width: 28px; min-height: 28px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <!-- Panel Header (optional) - Supports both slot and prop for backward compatibility -->
      {#if $$slots.header || panelHeader}
        <div style="border-bottom: 1px solid var(--border-color);">
          {#if $$slots.header}
            <slot name="header"></slot>
          {:else if panelHeader}
            {@html panelHeader}
          {/if}
        </div>
      {/if}
    </div>

    <!-- Tab Content - Independently Scrollable -->
    <div
      class="flex-1 overflow-y-auto overflow-x-hidden"
      style="background-color: var(--bg-primary); -webkit-overflow-scrolling: touch;"
    >
      <!-- Support for named slots (preferred) - Each slot must be explicitly checked -->
      {#if activeTab === 'search' && $$slots.search}
        <slot name="search"></slot>
      {:else if activeTab === 'filters' && $$slots.filters}
        <slot name="filters"></slot>
      {:else if activeTab === 'settings' && $$slots.settings}
        <slot name="settings"></slot>
      {:else if activeTab === 'info' && $$slots.info}
        <slot name="info"></slot>
      {:else if activeTabData?.content}
        <!-- Fallback to component prop (legacy) -->
        <svelte:component this={activeTabData.content} />
      {/if}
    </div>
  </div>
</div>
