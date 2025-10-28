<script lang="ts">
  export let locationName: string;
  export let onSubmit: (password: string) => void;
  export let onCancel: () => void;
  export let error: string | undefined = undefined;

  let password = '';

  function handleSubmit(e: Event) {
    e.preventDefault();
    onSubmit(password);
  }

  function handleBackdropClick() {
    onCancel();
  }

  function handleModalClick(e: Event) {
    e.stopPropagation();
  }
</script>

<div
  class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50"
  on:click={handleBackdropClick}
  on:keydown={(e) => e.key === 'Escape' && onCancel()}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <div
    class="w-[90%] max-w-md border-2 p-6 shadow-2xl"
    style="background-color: var(--bg-surface); border-color: var(--border-color)"
    on:click={handleModalClick}
    on:keydown={(e) => e.key === 'Enter' && handleSubmit(e)}
    role="button"
    tabindex="0"
  >
    <h2 class="mb-2 text-sm" style="color: var(--accent-secondary)">
      Private Location
    </h2>

    <p class="mb-4 text-sm" style="color: var(--text-muted)">
      Enter password to view "{locationName}"
    </p>

    <form on:submit={handleSubmit}>
      <input
        type="password"
        bind:value={password}
        placeholder="Password..."
        class="input-terminal-primary mb-3"
      />

      {#if error}
        <div class="mb-3 text-xs" style="color: var(--error-color)">
          {error}
        </div>
      {/if}

      <div class="flex gap-3">
        <button type="submit" class="btn-terminal-primary flex-1">
          [Unlock]
        </button>
        <button type="button" on:click={onCancel} class="btn-terminal-muted flex-1">
          [Cancel]
        </button>
      </div>
    </form>
  </div>
</div>
