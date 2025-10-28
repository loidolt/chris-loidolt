<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';

  export let form: ActionData;

  let formData = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  let isSubmitting = false;
</script>

<svelte:head>
  <title>Contact - Portfolio</title>
  <meta name="description" content="Get in touch to discuss your project or collaboration opportunities." />
</svelte:head>

<div class="max-w-2xl space-y-8">
  <!-- Page Header -->
  <div>
    <div class="text-sm mb-2" style="color: var(--accent-secondary)">Contact</div>
    <p class="text-base md:text-sm" style="color: var(--text-muted)">Send me a message using the form below</p>
  </div>

  <!-- Success Message -->
  {#if form?.success}
    <div class="pt-6" style="border-top: 1px solid var(--accent-primary)">
      <div class="mb-2 text-sm" style="color: var(--accent-primary)">
        Message sent successfully
      </div>
      <p class="text-sm" style="color: var(--text-primary)">
        Thank you for reaching out. I'll get back to you soon.
      </p>
    </div>
  {/if}

  <!-- Form Error -->
  {#if form?.error}
    <div class="pt-6" style="border-top: 1px solid var(--error-color)">
      <div class="mb-2 text-sm" style="color: var(--error-color)">
        Error
      </div>
      <p class="text-sm" style="color: var(--text-primary)">
        {form.error}
      </p>
    </div>
  {/if}

  <!-- Form -->
  <form method="POST" class="space-y-6" use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      await update();
      isSubmitting = false;
    };
  }}>
    <!-- Name Field -->
    <div>
      <Label for="name" class="block text-sm mb-2" style="color: var(--accent-secondary)">
        name
      </Label>
      <Input
        type="text"
        id="name"
        name="name"
        bind:value={formData.name}
        required
        minlength={2}
        class="font-mono"
        disabled={isSubmitting}
      />
      {#if form?.errors?.name}
        <p class="mt-2 text-xs" style="color: var(--error)">
          {form.errors.name}
        </p>
      {/if}
    </div>

    <!-- Email Field -->
    <div>
      <Label for="email" class="block text-sm mb-2" style="color: var(--accent-secondary)">
        email
      </Label>
      <Input
        type="email"
        id="email"
        name="email"
        bind:value={formData.email}
        required
        class="font-mono"
        disabled={isSubmitting}
      />
      {#if form?.errors?.email}
        <p class="mt-2 text-xs" style="color: var(--error)">
          {form.errors.email}
        </p>
      {/if}
    </div>

    <!-- Subject Field -->
    <div>
      <Label for="subject" class="block text-sm mb-2" style="color: var(--accent-secondary)">
        subject
      </Label>
      <Input
        type="text"
        id="subject"
        name="subject"
        bind:value={formData.subject}
        required
        minlength={3}
        class="font-mono"
        disabled={isSubmitting}
      />
      {#if form?.errors?.subject}
        <p class="mt-2 text-xs" style="color: var(--error)">
          {form.errors.subject}
        </p>
      {/if}
    </div>

    <!-- Message Field -->
    <div>
      <Label for="message" class="block text-sm mb-2" style="color: var(--accent-secondary)">
        message
      </Label>
      <Textarea
        id="message"
        name="message"
        bind:value={formData.message}
        required
        minlength={10}
        rows={6}
        class="font-mono resize-y min-h-[120px]"
        disabled={isSubmitting}
      />
      {#if form?.errors?.message}
        <p class="mt-2 text-xs" style="color: var(--error)">
          {form.errors.message}
        </p>
      {/if}
    </div>

    <!-- Submit Button -->
    <div class="pt-4">
      <Button
        type="submit"
        disabled={isSubmitting}
        class="px-6 py-3"
      >
        {isSubmitting ? '[sending...]' : '[send message →]'}
      </Button>
    </div>
  </form>
</div>
