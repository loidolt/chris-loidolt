<script lang="ts">
  /**
   * Flex component - flexible horizontal/vertical layout
   *
   * Features:
   * - Direction control (row/column)
   * - Alignment options
   * - Gap spacing
   * - Wrapping control
   * - Responsive behavior
   */

  export let direction: 'row' | 'column' | 'row-reverse' | 'column-reverse' = 'row';
  export let align: 'start' | 'center' | 'end' | 'stretch' | 'baseline' = 'start';
  export let justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' = 'start';
  export let wrap: 'wrap' | 'nowrap' | 'wrap-reverse' = 'nowrap';
  export let gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'none';
  export let className = '';

  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const wrapClasses = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };
</script>

<div
  class="flex w-full {directionClasses[direction]} {alignClasses[align]} {justifyClasses[justify]} {wrapClasses[wrap]} {gapClasses[gap]} {className}"
>
  <slot />
</div>
