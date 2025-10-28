<script lang="ts">
  import { onMount } from 'svelte';

  // Reactive state - so much simpler than React useState!
  let displayedText = '';
  let cursorVisible = true;

  const fullText = `Design & Engineering Portfolio

Showcasing projects in 3D printing, woodworking, and software

Navigate using the menu above or explore [projects]`;

  onMount(() => {
    // Typing animation
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        displayedText = fullText.slice(0, index + 1);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  });
</script>

<div class="py-8">
  <pre class="text-sm whitespace-pre-wrap leading-relaxed" style="color: var(--text-primary)">
{displayedText}<span class="terminal-cursor" style="color: var(--accent-primary)">_</span>
  </pre>
</div>

<style>
  /* Component-scoped styles - no CSS modules needed! */
  .terminal-cursor {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 49% {
      opacity: 1;
    }
    50%, 100% {
      opacity: 0;
    }
  }
</style>
