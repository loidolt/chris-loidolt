<script lang="ts">
  import TerminalWelcome from '$lib/components/TerminalWelcome.svelte';
  import { Container, Grid, Stack, Section } from '$lib/layouts';
  import * as Card from '$lib/components/ui/card';
  import type { PageData } from './$types';

  export let data: PageData;

  const quickLinks = [
    { label: 'View all projects', link: '/projects' },
    { label: 'Learn more about me', link: '/about' },
    { label: 'Get in touch', link: '/contact' },
  ];

  const stats = [
    { label: 'Projects', value: `${data.projectCount}`, href: '/projects' },
    { label: 'Categories', value: '8', href: '/projects' },
    { label: '3D Models', value: '30+', href: '/projects' },
  ];
</script>

<svelte:head>
  <title>Home - Portfolio</title>
</svelte:head>

<Container>
  <!-- Terminal Welcome with typing animation -->
  <TerminalWelcome />

  <Stack gap="lg">
    <!-- Quick Links Section -->
    <Section spacing="md" withBorder>
      <div class="mb-6 text-sm" style="color: var(--accent-secondary)">
        Quick Links
      </div>
      <Stack gap="md">
        {#each quickLinks as item}
          <a
            href={item.link}
            class="block text-base md:text-sm py-2 transition-opacity hover:opacity-70"
            style="color: var(--link-color)"
          >
            [{item.label} →]
          </a>
        {/each}
      </Stack>
    </Section>

    <!-- Quick Stats -->
    <Section spacing="md" withBorder>
      <Grid cols={3} gap="lg">
        {#each stats as stat}
          <a href={stat.href} class="group">
            <Card.Card class="hover:opacity-70 transition-opacity">
              <Card.CardContent class="p-6">
                <div class="text-xs mb-2 transition-opacity" style="color: var(--link-color)">
                  [{stat.label.toLowerCase()}]
                </div>
                <div
                  class="text-4xl md:text-3xl lg:text-4xl font-medium"
                  style="color: var(--accent-primary)"
                >
                  {stat.value}
                </div>
              </Card.CardContent>
            </Card.Card>
          </a>
        {/each}
      </Grid>
    </Section>
  </Stack>
</Container>
