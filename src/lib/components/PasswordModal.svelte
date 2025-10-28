<script lang="ts">
  import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';

  export let locationName: string;
  export let onSubmit: (password: string) => void;
  export let onCancel: () => void;
  export let error: string | undefined = undefined;
  export let open = true;

  let password = '';

  function handleSubmit(e: Event) {
    e.preventDefault();
    onSubmit(password);
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      onCancel();
    }
  }
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle class="text-sm" style="color: var(--accent-secondary)">
        Private Location
      </DialogTitle>
      <DialogDescription class="text-sm" style="color: var(--text-muted)">
        Enter password to view "{locationName}"
      </DialogDescription>
    </DialogHeader>

    <form on:submit={handleSubmit} class="space-y-4">
      <Input
        type="password"
        bind:value={password}
        placeholder="Password..."
        class="font-mono"
      />

      {#if error}
        <div class="text-xs" style="color: var(--error)">
          {error}
        </div>
      {/if}

      <div class="flex gap-3">
        <Button type="submit" class="flex-1">
          [Unlock]
        </Button>
        <Button type="button" variant="outline" onclick={onCancel} class="flex-1">
          [Cancel]
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
