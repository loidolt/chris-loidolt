<script lang="ts">
  import { page } from '$app/stores';
  import { Container, PageHeader, Stack } from '$lib/layouts';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';

  $: status = $page.status;
  $: message = $page.error?.message || 'An unexpected error occurred';

  // Error titles based on status code
  const errorTitles: Record<number, string> = {
    404: 'Page Not Found',
    403: 'Forbidden',
    401: 'Unauthorized',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };

  $: title = errorTitles[status] || `Error ${status}`;

  // Error descriptions
  const errorDescriptions: Record<number, string> = {
    404: "The page you're looking for doesn't exist or has been moved.",
    403: "You don't have permission to access this resource.",
    401: 'You need to be logged in to access this page.',
    500: 'Something went wrong on our end. Please try again later.',
    503: 'The service is temporarily unavailable. Please try again in a moment.',
  };

  $: description = errorDescriptions[status] || 'Please try again or contact support if the problem persists.';
</script>

<Container>
  <Stack gap="lg">
    <PageHeader
      title={title}
      subtitle="Error {status}"
    />

    <Card>
      <CardContent class="p-8 text-center">
        <!-- Error Icon -->
        <div style="font-size: 72px; margin-bottom: var(--spacing-medium); opacity: 0.5;">
          {#if status === 404}
            🔍
          {:else if status === 403 || status === 401}
            🔒
          {:else if status === 500 || status === 503}
            ⚠️
          {:else}
            ❌
          {/if}
        </div>

        <!-- Error Message -->
        <h2 style="margin-bottom: var(--spacing-small); color: var(--text-primary);">
          {title}
        </h2>

        <p style="color: var(--text-muted); margin-bottom: var(--spacing-medium); max-width: 500px; margin-left: auto; margin-right: auto;">
          {description}
        </p>

        {#if import.meta.env.DEV}
          <!-- Show technical details in development -->
          <div style="margin-top: var(--spacing-medium); padding: var(--spacing-medium); background: var(--bg-secondary); border-radius: var(--border-radius); text-align: left; font-family: monospace; font-size: 12px; color: var(--text-muted); overflow-x: auto;">
            <strong>Technical Details (Dev Only):</strong><br>
            {message}
          </div>
        {/if}

        <!-- Actions -->
        <div style="display: flex; gap: var(--spacing-small); justify-content: center; margin-top: var(--spacing-large); flex-wrap: wrap;">
          <Button href="/" variant="default">
            Go Home
          </Button>

          <Button
            on:click={() => window.history.back()}
            variant="outline"
          >
            Go Back
          </Button>

          {#if status >= 500}
            <Button
              on:click={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          {/if}
        </div>
      </CardContent>
    </Card>

    <!-- Helpful Links -->
    <div style="text-align: center; margin-top: var(--spacing-medium);">
      <p style="color: var(--text-muted); margin-bottom: var(--spacing-small);">
        You might be looking for:
      </p>
      <div style="display: flex; gap: var(--spacing-small); justify-content: center; flex-wrap: wrap;">
        <Button href="/projects" variant="link" size="sm">
          Projects
        </Button>
        <Button href="/about" variant="link" size="sm">
          About
        </Button>
        <Button href="/contact" variant="link" size="sm">
          Contact
        </Button>
      </div>
    </div>
  </Stack>
</Container>

<style>
  /* Additional error page styles if needed */
</style>
