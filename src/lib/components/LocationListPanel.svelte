<script lang="ts">
  import type { LocationPublic } from '$lib/pocketbase';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';

  // Props using Svelte 5 runes syntax
  let {
    locations,
    selectedLocationId = undefined,
    onLocationSelect,
  }: {
    locations: LocationPublic[];
    selectedLocationId?: string;
    onLocationSelect: (location: LocationPublic) => void;
  } = $props();

  // Helper to check if location is private
  const isPrivate = (location: LocationPublic) => location.privacy === 'Private';

  // Group locations by category
  const locationsByCategory = $derived(() => {
    const grouped = new Map<string, LocationPublic[]>();

    locations.forEach(location => {
      // Handle both single category and categories array
      const categories = location.categories?.length
        ? location.categories
        : [location.category || 'Uncategorized'];

      categories.forEach(category => {
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }
        grouped.get(category)!.push(location);
      });
    });

    // Sort categories alphabetically
    return new Map([...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  });
</script>

<div class="space-y-4">
  <!-- Summary header -->
  <div class="text-sm text-muted-foreground">
    Showing <strong>{locations.length}</strong> location{locations.length !== 1 ? 's' : ''}
    {#if locations.length === 0}
      <div class="mt-4 p-4 border border-dashed rounded-md text-center">
        No locations match your current filters.
      </div>
    {/if}
  </div>

  <!-- Locations grouped by category -->
  {#each [...locationsByCategory()] as [category, categoryLocations]}
    <div class="space-y-2">
      <!-- Category header -->
      <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
        {category}
        <Badge variant="outline" class="text-xs">
          {categoryLocations.length}
        </Badge>
      </h3>

      <!-- Location cards -->
      <div class="space-y-2">
        {#each categoryLocations as location}
          {@const isSelected = selectedLocationId === location.id}
          <Card.Root
            class="cursor-pointer transition-all hover:shadow-md {isSelected ? 'ring-2 ring-primary' : ''}"
            onclick={() => onLocationSelect(location)}
            role="button"
            tabindex="0"
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onLocationSelect(location);
              }
            }}
          >
            <Card.Content class="p-3 space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-sm truncate">
                    {location.name}
                  </h4>
                  {#if location.description}
                    <p class="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {location.description}
                    </p>
                  {/if}
                </div>

                {#if isPrivate(location)}
                  <Badge variant="secondary" class="text-xs flex-shrink-0">
                    🔒 Private
                  </Badge>
                {/if}
              </div>

              {#if location.latitude && location.longitude}
                <div class="text-xs font-mono text-muted-foreground">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </div>
              {/if}
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    </div>
  {/each}

  <!-- Keyboard shortcut hint at bottom -->
  {#if locations.length > 0}
    <div class="pt-4 border-t text-xs text-muted-foreground text-center">
      Press <kbd class="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Shift+L</kbd> to toggle this panel
    </div>
  {/if}
</div>

<style>
  kbd {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
</style>
