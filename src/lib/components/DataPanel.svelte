<script lang="ts" context="module">
  export interface PanelTab {
    id: string;
    label: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';

  export let tabs: PanelTab[];
  export let defaultTab: string | undefined = undefined;
  export let defaultOpen = false;
  export let position: 'left' | 'right' = 'left';
  export let width = {
    mobile: 'calc(100vw - 16px)',
    desktop: '400px',
  };
  export let open: boolean | undefined = undefined;
  export let onOpenChange: ((open: boolean) => void) | undefined = undefined;
  export let tab: string | undefined = undefined;
  export let onTabChange: ((tab: string) => void) | undefined = undefined;
  export let storageKey: string | undefined = undefined;
  export let mobileBreakpoint = 640;

  let internalPanelOpen = defaultOpen;
  let internalActiveTab = defaultTab || tabs[0]?.id || '';
  let isMobile = false;

  // Use controlled state if provided, otherwise use internal state
  $: isPanelOpen = open !== undefined ? open : internalPanelOpen;
  $: activeTab = tab !== undefined ? tab : internalActiveTab;

  const setIsPanelOpen = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (open === undefined) internalPanelOpen = newOpen;
  };

  const setActiveTab = (newTab: string) => {
    if (onTabChange) onTabChange(newTab);
    if (tab === undefined) internalActiveTab = newTab;
  };

  // Mobile detection and localStorage management
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < mobileBreakpoint;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Load state from localStorage
    if (storageKey && browser) {
      try {
        const stored = localStorage.getItem(`dataPanel_${storageKey}_open`);
        if (stored !== null && open === undefined) {
          internalPanelOpen = JSON.parse(stored);
        }
        const storedTab = localStorage.getItem(`dataPanel_${storageKey}_tab`);
        if (storedTab && defaultTab === undefined && tab === undefined) {
          internalActiveTab = storedTab;
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
      localStorage.setItem(`dataPanel_${storageKey}_open`, JSON.stringify(isPanelOpen));
    } catch (error) {
      console.error('Error saving panel state:', error);
    }
  }

  $: if (browser && storageKey && tab === undefined) {
    try {
      localStorage.setItem(`dataPanel_${storageKey}_tab`, activeTab);
    } catch (error) {
      console.error('Error saving tab state:', error);
    }
  }

  // Auto-close on mobile when switching to mobile view
  let wasMobile = false;
  $: {
    if (isMobile && !wasMobile) {
      setIsPanelOpen(false);
    }
    wasMobile = isMobile;
  }
</script>

<!-- Mobile backdrop overlay -->
{#if isMobile && isPanelOpen}
  <div
    class="fixed inset-0 bg-black/50 z-[999] transition-opacity duration-300"
    onclick={() => setIsPanelOpen(false)}
    role="button"
    tabindex="-1"
    aria-label="Close panel"
  ></div>
{/if}

<!-- Fixed container positioned at screen edge -->
<div
  class="fixed top-[60px] sm:top-[68px] bottom-16 sm:bottom-20 z-[1000] pointer-events-none"
  style="{position === 'left' ? 'left: 0;' : 'right: 0;'}"
  role="complementary"
  aria-label="Data panel"
>
  <!-- Sliding panel wrapper -->
  <div
    class="h-full flex transition-transform duration-300 ease-in-out pointer-events-auto"
    style="
      {position === 'left' ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}
      transform: translateX({isPanelOpen
        ? '0'
        : position === 'left'
          ? `calc(-1 * (${isMobile ? width.mobile : width.desktop}))`
          : (isMobile ? width.mobile : width.desktop)
      });
    "
  >
    <!-- Main panel content -->
    <div
      class="h-full flex flex-col shadow-lg"
      style="
        width: {isMobile ? width.mobile : width.desktop};
        background-color: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        {position === 'left' ? 'border-left: none;' : 'border-right: none;'}
        {position === 'left'
          ? 'border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem;'
          : 'border-top-left-radius: 0.5rem; border-bottom-left-radius: 0.5rem;'}
      "
    >
      <!-- Header -->
      <div
        class="flex-shrink-0 p-3 border-b flex items-center justify-between"
        style="background-color: hsl(var(--card));"
      >
        <h3 class="text-sm font-semibold">
          {tabs.find(t => t.id === activeTab)?.label}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          onclick={() => setIsPanelOpen(false)}
          aria-label="Close panel"
        >
          ✕
        </Button>
      </div>

      <!-- Optional header slot -->
      {#if $$slots.header}
        <div class="px-3 pt-2">
          <slot name="header"></slot>
        </div>
      {/if}

      <!-- Tab content -->
      <div
        class="flex-1 overflow-y-auto p-3 sm:p-4 overscroll-contain"
        style="background-color: hsl(var(--background)); -webkit-overflow-scrolling: touch;"
        role="tabpanel"
        id="panel-{activeTab}"
      >
        {#if activeTab === 'search'}
          <slot name="search"></slot>
        {:else if activeTab === 'filters'}
          <slot name="filters"></slot>
        {:else if activeTab === 'info'}
          <slot name="info"></slot>
        {:else if activeTab === 'locations'}
          <slot name="locations"></slot>
        {:else if activeTab === 'settings'}
          <slot name="settings"></slot>
        {/if}
      </div>
    </div>

    <!-- Binder-style tabs that stick out -->
    <div
      class="flex flex-col justify-center gap-2 py-4 sm:py-8"
      style="{position === 'left' ? 'padding-right: 0.25rem;' : 'padding-left: 0.25rem;'}"
      role="tablist"
      aria-orientation="vertical"
    >
      {#each tabs as tab}
        {@const isActive = activeTab === tab.id}
        <button
          type="button"
          disabled={tab.disabled}
          role="tab"
          aria-selected={isActive}
          aria-controls="panel-{tab.id}"
          class="px-2 py-4 text-xs font-medium transition-all shadow-md active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          style="
            writing-mode: vertical-rl;
            text-orientation: mixed;
            background-color: {isActive ? 'hsl(var(--muted))' : 'hsl(var(--primary))'};
            color: {isActive ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary-foreground))'};
            border: 1px solid hsl(var(--border));
            min-height: {isMobile ? '60px' : '80px'};
            min-width: {isMobile ? '36px' : '32px'};
            {position === 'left'
              ? 'border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; border-left: none;'
              : 'border-top-left-radius: 0.375rem; border-bottom-left-radius: 0.375rem; border-right: none;'}
            cursor: {tab.disabled ? 'not-allowed' : 'pointer'};
            -webkit-tap-highlight-color: transparent;
          "
          onclick={() => {
            if (tab.disabled) return;
            if (isActive && isPanelOpen) {
              setIsPanelOpen(false);
            } else {
              setActiveTab(tab.id);
              setIsPanelOpen(true);
            }
          }}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>
</div>
