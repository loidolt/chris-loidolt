<script lang="ts">
  import { goto } from '$app/navigation';
  import { Container, Stack, PageHeader } from '$lib/layouts';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to home page
        window.location.href = '/';
      } else {
        error = data.error || 'Login failed';
      }
    } catch (err) {
      console.error('Login error:', err);
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - Family Portfolio</title>
</svelte:head>

<Container maxWidth="narrow">
  <Stack gap="lg">
    <PageHeader
      title="Login"
      subtitle="Sign in to access family content"
    />

    <Card.Card>
      <Card.CardContent class="p-6">
        <form on:submit|preventDefault={handleSubmit}>
          <Stack gap="md">
            {#if error}
              <div class="p-3 bg-destructive/10 border-l-4 border-destructive rounded">
                <p class="text-sm text-destructive">{error}</p>
              </div>
            {/if}

            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                bind:value={email}
                required
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                type="password"
                bind:value={password}
                required
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              class="w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div class="text-center text-sm text-muted-foreground">
              Don't have an account? Contact the family administrator.
            </div>
          </Stack>
        </form>
      </Card.CardContent>
    </Card.Card>
  </Stack>
</Container>
