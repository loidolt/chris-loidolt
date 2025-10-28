<script lang="ts">
  /**
   * Grid component - flexible responsive grid system
   *
   * Features:
   * - Responsive column counts
   * - Flexible gap spacing
   * - Auto-fit or auto-fill behavior
   * - Min/max column widths
   */

  export let cols: number | { sm?: number; md?: number; lg?: number; xl?: number } = 1;
  export let gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let minColWidth: string | null = null; // e.g., '250px' for auto-responsive
  export let className = '';

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  // Build responsive column classes
  let colsClass = '';
  if (typeof cols === 'number') {
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    };
    colsClass = colsMap[cols] || 'grid-cols-1';
  } else {
    // Custom breakpoint cols
    const { sm = 1, md = 1, lg = 1, xl = 1 } = cols;
    colsClass = `grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl}`;
  }
</script>

<div
  class="grid {colsClass} {gapClasses[gap]} w-full {className}"
  style={minColWidth ? `grid-template-columns: repeat(auto-fit, minmax(${minColWidth}, 1fr));` : ''}
>
  <slot />
</div>
