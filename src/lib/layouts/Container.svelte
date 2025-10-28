<script lang="ts">
  /**
   * Container component - provides consistent max-width and padding
   *
   * Variants:
   * - default: max-w-6xl (1152px)
   * - narrow: max-w-4xl (896px) - for reading content
   * - wide: max-w-7xl (1280px) - for data tables
   * - full: w-full - for edge-to-edge content
   */

  export let variant: 'default' | 'narrow' | 'wide' | 'full' = 'default';
  export let noPadding = false;
  export let noVerticalPadding = false;
  export let className = '';

  const containerClasses = {
    default: 'max-w-6xl',
    narrow: 'max-w-4xl',
    wide: 'max-w-7xl',
    full: 'w-full'
  };

  const horizontalPadding = noPadding ? '' : 'px-4 sm:px-6 lg:px-8';
  const verticalPadding = noPadding || noVerticalPadding ? '' : 'py-8';
  const paddingClass = `${horizontalPadding} ${verticalPadding}`;
</script>

<div class="container mx-auto {containerClasses[variant]} {paddingClass} {className}">
  <slot />
</div>
