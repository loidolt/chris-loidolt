<script lang="ts">
  /**
   * Section component - page section with consistent spacing
   *
   * Features:
   * - Semantic HTML5 section tags
   * - Consistent vertical padding
   * - Optional borders and backgrounds
   * - Optional section header
   */

  export let id: string | null = null;
  export let spacing: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
  export let withBorder = false;
  export let withBackground = false;
  export let fullWidth = false; // If true, doesn't add Container wrapper
  export let className = '';

  const spacingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24'
  };
</script>

<section
  {id}
  class="w-full {spacingClasses[spacing]} {className}"
  style={withBorder ? 'border-top: 1px solid var(--border-color);' : ''}
  style:background-color={withBackground ? 'var(--bg-surface)' : ''}
>
  <slot />
</section>
