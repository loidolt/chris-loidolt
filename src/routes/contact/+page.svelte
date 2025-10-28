<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import { Container, Stack, PageHeader } from '$lib/layouts';
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

<Container variant="narrow">
  <PageHeader
    title="Contact"
    subtitle="Send me a message using the form below"
  />

  <Stack gap="lg">
    <!-- Success Message -->
    {#if form?.success}
      <div class="pt-6" style="border-top: 1px solid var(--accent-primary)">
        <Stack gap="xs">
          <div class="text-sm" style="color: var(--accent-primary)">
            Message sent successfully
          </div>
          <p class="text-sm" style="color: var(--text-primary)">
            Thank you for reaching out. I'll get back to you soon.
          </p>
        </Stack>
      </div>
    {/if}

    <!-- Form Error -->
    {#if form?.error}
      <div class="pt-6" style="border-top: 1px solid var(--error-color)">
        <Stack gap="xs">
          <div class="text-sm" style="color: var(--error-color)">
            Error
          </div>
          <p class="text-sm" style="color: var(--text-primary)">
            {form.error}
          </p>
        </Stack>
      </div>
    {/if}

    <!-- Form -->
    <form method="POST" use:enhance={() => {
      isSubmitting = true;
      return async ({ update }) => {
        await update();
        isSubmitting = false;
      };
    }}>
      <Stack gap="md">
        <!-- Name Field -->
        <Stack gap="xs">
          <Label for="name" class="text-sm" style="color: var(--accent-secondary)">
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
            <p class="text-xs" style="color: var(--error)">
              {form.errors.name}
            </p>
          {/if}
        </Stack>

        <!-- Email Field -->
        <Stack gap="xs">
          <Label for="email" class="text-sm" style="color: var(--accent-secondary)">
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
            <p class="text-xs" style="color: var(--error)">
              {form.errors.email}
            </p>
          {/if}
        </Stack>

        <!-- Subject Field -->
        <Stack gap="xs">
          <Label for="subject" class="text-sm" style="color: var(--accent-secondary)">
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
            <p class="text-xs" style="color: var(--error)">
              {form.errors.subject}
            </p>
          {/if}
        </Stack>

        <!-- Message Field -->
        <Stack gap="xs">
          <Label for="message" class="text-sm" style="color: var(--accent-secondary)">
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
            <p class="text-xs" style="color: var(--error)">
              {form.errors.message}
            </p>
          {/if}
        </Stack>

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
      </Stack>
    </form>
  </Stack>
</Container>
