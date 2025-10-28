<script lang="ts">
  /**
   * Split layout - two-column responsive layout with flexible ratios
   *
   * Features:
   * - Configurable split ratios
   * - Responsive: stacks on mobile
   * - Gap control
   * - Reverse order option
   */

  export let ratio: '1:1' | '1:2' | '2:1' | '1:3' | '3:1' | '2:3' | '3:2' = '1:1';
  export let gap: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let reverse = false;
  export let stackOnMobile = true;
  export let className = '';

  const ratioClasses = {
    '1:1': 'lg:grid-cols-2',
    '1:2': 'lg:grid-cols-[1fr_2fr]',
    '2:1': 'lg:grid-cols-[2fr_1fr]',
    '1:3': 'lg:grid-cols-[1fr_3fr]',
    '3:1': 'lg:grid-cols-[3fr_1fr]',
    '2:3': 'lg:grid-cols-[2fr_3fr]',
    '3:2': 'lg:grid-cols-[3fr_2fr]'
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-4',
    md: 'gap-6 lg:gap-8',
    lg: 'gap-8 lg:gap-12'
  };
</script>

<div
  class="
    grid
    {stackOnMobile ? 'grid-cols-1' : 'grid-cols-2'}
    {ratioClasses[ratio]}
    {gapClasses[gap]}
    {className}
  "
  style={reverse ? 'direction: rtl;' : ''}
>
  <div style={reverse ? 'direction: ltr;' : ''}>
    <slot name="left" />
  </div>
  <div style={reverse ? 'direction: ltr;' : ''}>
    <slot name="right" />
  </div>
</div>
