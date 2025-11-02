<script lang="ts">
  import { Container, Grid, Stack, Section, PageHeader } from '$lib/layouts';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import FamilyHubHome from '$lib/components/FamilyHubHome.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const quickLinks = [
    { label: 'View Projects', link: '/projects', description: 'Browse my portfolio of work' },
    { label: 'About Me', link: '/about', description: 'Learn about my background and skills' },
    { label: 'Get in Touch', link: '/contact', description: 'Start a conversation' },
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

{#if data.isFamilyHub}
  <!-- Family Hub Homepage -->
  <FamilyHubHome persons={data.persons || []} projectCount={data.projectCount} />
{:else}
  <!-- Individual Person Homepage -->
  <Container>
    <PageHeader
      title="Welcome"
      subtitle="Explore projects, skills, and professional experience"
    />

    <Stack gap="xl">
      <!-- Quick Links Section -->
      <Section spacing="md">
        <Stack gap="md">
          <h2 class="text-lg font-semibold" style="color: var(--text-primary)">Quick Links</h2>
          <Grid cols={3} gap="md">
            {#each quickLinks as item}
              <Card.Card class="hover:shadow-lg transition-shadow">
                <Card.CardHeader>
                  <Card.CardTitle class="text-lg">{item.label}</Card.CardTitle>
                  <Card.CardDescription>{item.description}</Card.CardDescription>
                </Card.CardHeader>
                <Card.CardFooter>
                  <Button href={item.link} variant="outline" class="w-full">
                    View
                  </Button>
                </Card.CardFooter>
              </Card.Card>
            {/each}
          </Grid>
        </Stack>
      </Section>

      <!-- Quick Stats -->
      <Section spacing="md">
        <Stack gap="md">
          <h2 class="text-lg font-semibold" style="color: var(--text-primary)">Overview</h2>
          <Grid cols={3} gap="md">
            {#each stats as stat}
              <a href={stat.href}>
                <Card.Card class="hover:shadow-lg transition-shadow">
                  <Card.CardContent class="p-6">
                    <div class="text-sm text-muted-foreground mb-2">
                      {stat.label}
                    </div>
                    <div class="text-3xl font-bold">
                      {stat.value}
                    </div>
                  </Card.CardContent>
                </Card.Card>
              </a>
            {/each}
          </Grid>
        </Stack>
      </Section>
    </Stack>
  </Container>
{/if}
