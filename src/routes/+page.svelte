<script lang="ts">
  import { Container, Grid, Stack, Section, PageHeader } from '$lib/layouts';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import type { PageData } from './$types';

  export let data: PageData;

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

<Container>
  <PageHeader
    title="Welcome"
    subtitle="Explore projects, skills, and professional experience"
  />

  <Stack gap="lg">
    <!-- Quick Links Section -->
    <Section title="Quick Links">
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
    </Section>

    <!-- Quick Stats -->
    <Section title="Overview">
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
    </Section>
  </Stack>
</Container>
