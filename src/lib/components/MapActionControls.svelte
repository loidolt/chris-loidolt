<script lang="ts">
  import { Locate, Layers, Pencil } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';

  export let onLocate: () => void;
  export let clusteringEnabled: boolean;
  export let onToggleClustering: () => void;
  export let drawingEnabled: boolean;
  export let onToggleDrawing: () => void;
</script>

<div class="map-action-controls">
  <!-- Locate user button -->
  <Button
    variant="outline"
    size="icon"
    class="h-10 w-10"
    onclick={onLocate}
    aria-label="Locate me (L)"
    title="Locate me (L)"
  >
    <Locate class="h-4 w-4" />
  </Button>

  <!-- Toggle clustering button -->
  <Button
    variant={clusteringEnabled ? 'default' : 'outline'}
    size="icon"
    class="h-10 w-10"
    onclick={onToggleClustering}
    aria-label="Toggle clustering (C)"
    aria-pressed={clusteringEnabled}
    title="Toggle clustering (C) - {clusteringEnabled ? 'On' : 'Off'}"
  >
    <Layers class="h-4 w-4" />
  </Button>

  <!-- Toggle drawing button -->
  <Button
    variant={drawingEnabled ? 'default' : 'outline'}
    size="icon"
    class="h-10 w-10"
    onclick={onToggleDrawing}
    aria-label="Toggle drawing (D)"
    aria-pressed={drawingEnabled}
    title="Toggle drawing (D) - {drawingEnabled ? 'On' : 'Off'}"
  >
    <Pencil class="h-4 w-4" />
  </Button>
</div>

<style>
  .map-action-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
