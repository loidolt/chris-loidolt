<script lang="ts">
  /**
   * Card component - content container with elevation and borders
   *
   * Features:
   * - Multiple visual variants
   * - Padding control
   * - Interactive hover states
   * - Optional header/footer slots
   */

  export let variant: 'default' | 'elevated' | 'bordered' | 'glass' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let interactive = false;
  export let className = '';

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const variantStyles = {
    default: 'background-color: var(--bg-surface); border: 1px solid var(--border-color);',
    elevated: 'background-color: var(--bg-elevated); box-shadow: 0 4px 12px var(--shadow);',
    bordered: 'background-color: var(--bg-surface); border: 2px solid var(--border-color);',
    glass: 'background-color: rgba(22, 27, 34, 0.8); backdrop-filter: blur(10px); border: 1px solid var(--border-color);'
  };
</script>

{#if interactive}
<div
  class="
    rounded-lg
    {paddingClasses[padding]}
    transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg
    {className}
  "
  style={variantStyles[variant]}
  role="button"
  tabindex="0"
  on:click
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  }}
>
  {#if $$slots.header}
    <div class="mb-4 pb-4" style="border-bottom: 1px solid var(--border-color);">
      <slot name="header" />
    </div>
  {/if}

  <slot />

  {#if $$slots.footer}
    <div class="mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
      <slot name="footer" />
    </div>
  {/if}
</div>
{/if}
{:else}
<div
  class="
    rounded-lg
    {paddingClasses[padding]}
    {className}
  "
  style={variantStyles[variant]}
>
  {#if $$slots.header}
    <div class="mb-4 pb-4" style="border-bottom: 1px solid var(--border-color);">
      <slot name="header" />
    </div>
  {/if}

  <slot />

  {#if $$slots.footer}
    <div class="mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
      <slot name="footer" />
    </div>
  {/if}
</div>
{/if}
