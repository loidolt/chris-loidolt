<script lang="ts" context="module">
  export interface FilterOption {
    value: string;
    label: string;
    count?: number;
  }

  export interface FilterSection {
    id: string;
    label: string;
    type: 'single' | 'multi' | 'toggle';
    options?: FilterOption[];
  }
</script>

<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import * as Accordion from '$lib/components/ui/accordion';
  import { Separator } from '$lib/components/ui/separator';

  export let searchQuery = '';
  export let searchPlaceholder = 'Search...';
  export let filterSections: FilterSection[] = [];
  export let selectedFilters: Record<string, any> = {};
  export let activeFilterCount = 0;
  export let resultCount: number | undefined = undefined;
  export let onClearAll: (() => void) | undefined = undefined;

  // Default accordion value - open first section
  let accordionValue: string | undefined = filterSections.length > 0 ? filterSections[0].id : undefined;

  // Handle filter change
  const handleFilterChange = (sectionId: string, value: any, type: 'single' | 'multi' | 'toggle') => {
    if (type === 'single') {
      selectedFilters[sectionId] = value;
    } else if (type === 'multi') {
      if (!selectedFilters[sectionId]) {
        selectedFilters[sectionId] = new Set();
      }
      const set = selectedFilters[sectionId] as Set<string>;
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      selectedFilters[sectionId] = new Set(set); // Trigger reactivity
    } else if (type === 'toggle') {
      selectedFilters[sectionId] = value;
    }
    selectedFilters = { ...selectedFilters }; // Trigger reactivity
  };

  const isFilterActive = (sectionId: string, value: any, type: 'single' | 'multi' | 'toggle') => {
    if (type === 'single') {
      return selectedFilters[sectionId] === value;
    } else if (type === 'multi') {
      const set = selectedFilters[sectionId] as Set<string>;
      return set?.has(value) || false;
    } else if (type === 'toggle') {
      return selectedFilters[sectionId] === value;
    }
    return false;
  };
</script>

<div class="flex flex-col gap-4">
  <!-- Header with result count and clear button -->
  {#if resultCount !== undefined || onClearAll}
    <div class="flex items-center justify-between gap-2 px-1">
      {#if resultCount !== undefined}
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
          {#if activeFilterCount > 0}
            <Badge variant="secondary" class="text-xs">
              {activeFilterCount}
            </Badge>
          {/if}
        </div>
      {/if}
      {#if onClearAll && activeFilterCount > 0}
        <Button
          variant="ghost"
          size="sm"
          class="text-xs h-8"
          onclick={onClearAll}
        >
          Clear all
        </Button>
      {/if}
    </div>
  {/if}

  <!-- Search Input -->
  <div class="space-y-2">
    <Label for="search" class="text-xs font-medium">Search</Label>
    <Input
      id="search"
      type="text"
      bind:value={searchQuery}
      placeholder={searchPlaceholder}
      class="h-9"
    />
  </div>

  {#if filterSections.length > 0}
    <Separator />

    <!-- Filter Sections using Accordion -->
    <Accordion.Root bind:value={accordionValue} class="w-full">
      {#each filterSections as section}
        <Accordion.Item value={section.id} class="border-0">
          <Accordion.Trigger class="text-xs font-medium py-2 px-1 hover:no-underline">
            {section.label}
          </Accordion.Trigger>
          <Accordion.Content class="pb-4 px-1">
            {#if section.type === 'single' && section.options}
              <!-- Single select filter -->
              <div class="flex flex-wrap gap-2">
                <Button
                  variant={!selectedFilters[section.id] ? 'default' : 'outline'}
                  size="sm"
                  class="h-8 text-xs"
                  onclick={() => handleFilterChange(section.id, null, 'single')}
                >
                  All
                </Button>
                {#each section.options as option}
                  <Button
                    variant={isFilterActive(section.id, option.value, 'single') ? 'default' : 'outline'}
                    size="sm"
                    class="h-8 text-xs"
                    onclick={() => handleFilterChange(section.id, option.value, 'single')}
                  >
                    {option.label}
                    {#if option.count !== undefined}
                      <Badge variant="secondary" class="ml-1 text-xs">
                        {option.count}
                      </Badge>
                    {/if}
                  </Button>
                {/each}
              </div>
            {:else if section.type === 'multi' && section.options}
              <!-- Multi select filter -->
              <div class="flex flex-wrap gap-2">
                {#each section.options as option}
                  <Button
                    variant={isFilterActive(section.id, option.value, 'multi') ? 'default' : 'outline'}
                    size="sm"
                    class="h-8 text-xs"
                    onclick={() => handleFilterChange(section.id, option.value, 'multi')}
                  >
                    {option.label}
                    {#if option.count !== undefined}
                      <Badge variant="secondary" class="ml-1 text-xs">
                        {option.count}
                      </Badge>
                    {/if}
                  </Button>
                {/each}
              </div>
            {:else if section.type === 'toggle' && section.options}
              <!-- Toggle filter (e.g., all/public/private) -->
              <div class="flex flex-wrap gap-2">
                {#each section.options as option}
                  <Button
                    variant={isFilterActive(section.id, option.value, 'toggle') ? 'default' : 'outline'}
                    size="sm"
                    class="h-8 text-xs"
                    onclick={() => handleFilterChange(section.id, option.value, 'toggle')}
                  >
                    {option.label}
                  </Button>
                {/each}
              </div>
            {/if}
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  {/if}

  <!-- Optional custom content slot -->
  {#if $$slots.default}
    <Separator />
    <slot></slot>
  {/if}
</div>
