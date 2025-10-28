<script lang="ts">
  /**
   * Stack component - vertical spacing utility
   *
   * Automatically spaces children with consistent gaps
   * Handles responsive spacing adjustments
   */

  export let gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  export let align: 'start' | 'center' | 'end' | 'stretch' = 'stretch';
  export let className = '';

  const gapClasses = {
    none: 'space-y-0',
    xs: 'space-y-2',
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
    xl: 'space-y-12',
    '2xl': 'space-y-16'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
</script>

<div class="flex flex-col {gapClasses[gap]} {alignClasses[align]} {className}">
  <slot />
</div>
