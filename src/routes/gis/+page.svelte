<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import MapViewer from '$lib/components/MapViewer.svelte';

  export let data: PageData;

  let isMapReady = false;

  onMount(() => {
    // Ensure map only loads in browser
    isMapReady = true;
  });
</script>

<svelte:head>
  <title>GIS Map - Interactive Location Map</title>
  <meta name="description" content="Interactive topographic map showing points of interest and locations." />
</svelte:head>

<div class="h-[calc(100vh-4rem)] w-full">
  {#if data.error}
    <div class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="mb-2 text-sm" style="color: var(--error-color)">
          Error loading map
        </div>
        <div class="text-sm" style="color: var(--text-muted)">
          {data.error}
        </div>
      </div>
    </div>
  {:else if isMapReady}
    <MapViewer locations={data.locations} />
  {:else}
    <div class="flex h-full items-center justify-center">
      <div class="text-sm" style="color: var(--text-muted)">
        Loading map...
      </div>
    </div>
  {/if}
</div>
