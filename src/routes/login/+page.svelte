<script lang="ts">
  import { goto } from '$app/navigation';
  import { Container, Stack, Card } from '$lib/layouts';

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

<Container variant="narrow">
  <Stack gap="lg">
    <div class="text-center">
      <h1 class="text-3xl mb-2" style="color: var(--text-primary)">
        [login]
      </h1>
      <p class="text-sm" style="color: var(--text-muted)">
        Sign in to access family content
      </p>
    </div>

    <Card padding="lg">
      <form on:submit|preventDefault={handleSubmit}>
        <Stack gap="md">
          {#if error}
            <div class="p-3" style="background-color: rgba(248, 81, 73, 0.1); border-left: 3px solid var(--terminal-red)">
              <p class="text-sm" style="color: var(--terminal-red)">{error}</p>
            </div>
          {/if}

          <div>
            <label for="email" class="block text-sm mb-2" style="color: var(--accent-secondary)">
              email:
            </label>
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              class="input-terminal w-full"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label for="password" class="block text-sm mb-2" style="color: var(--accent-secondary)">
              password:
            </label>
            <input
              id="password"
              type="password"
              bind:value={password}
              required
              class="input-terminal w-full"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="btn-terminal w-full"
            style="background-color: var(--terminal-green); color: var(--terminal-black)"
          >
            {loading ? '[signing in...]' : '[sign in →]'}
          </button>

          <div class="text-center text-sm" style="color: var(--text-muted)">
            Don't have an account? Contact the family administrator.
          </div>
        </Stack>
      </form>
    </Card>
  </Stack>
</Container>

<style>
  .input-terminal {
    font-family: 'JetBrains Mono', monospace;
  }

  .input-terminal:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
