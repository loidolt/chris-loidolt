<script lang="ts">
  import { Container, Grid, Stack, Section, PageHeader } from '$lib/layouts';
  import type { PageData } from './$types';

  export let data: PageData;

  $: qualifications = data.qualifications;
  $: services = data.services;
  $: skills = data.skills;

  // Group skills by category
  $: skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);
</script>

<svelte:head>
  <title>About - Portfolio</title>
  <meta name="description" content="Designer and engineer with a passion for creating innovative solutions through 3D printing, woodworking, and software development." />
</svelte:head>

<Container>
  <PageHeader
    title="{data.personSlug === 'chris' ? 'Chris Loidolt - ' : ''}Designer & Engineer"
  />

  <Stack gap="xl">
    <!-- About Section -->
    <Section spacing="md" withBorder>
      <Stack gap="md">
        <div class="text-sm" style="color: var(--accent-secondary)">
          About
        </div>
        <div class="max-w-3xl">
          <Stack gap="sm">
            <p class="text-base md:text-sm" style="color: var(--text-primary)">
              I'm a designer and engineer with a passion for creating innovative solutions through 3D
              printing, woodworking, and software development. My work combines technical precision
              with creative problem-solving to bring ideas to life.
            </p>
            <p class="text-base md:text-sm" style="color: var(--text-primary)">
              From designing custom 3D-printed parts to building full-stack web applications, I love
              tackling complex challenges and learning new technologies along the way.
            </p>
          </Stack>
        </div>
      </Stack>
    </Section>

    <!-- Services Section -->
    {#if services.length > 0}
      <Section spacing="md" withBorder>
        <Stack gap="md">
          <div class="text-sm" style="color: var(--accent-secondary)">
            Services ({services.length})
          </div>

          <Grid cols={2} gap="md">
            {#each services as service}
              <div class="p-4" style="background-color: var(--bg-surface); border: 1px solid var(--border-color)">
                <Stack gap="xs">
                  <h3 class="text-base md:text-sm font-medium" style="color: var(--text-primary)">
                    {#if service.icon}<span class="mr-2">{service.icon}</span>{/if}
                    {service.title}
                  </h3>
                  <p class="text-sm" style="color: var(--text-muted)">
                    {service.description}
                  </p>
                </Stack>
              </div>
            {/each}
          </Grid>
        </Stack>
      </Section>
    {/if}

    <!-- Qualifications Section -->
    {#if qualifications.length > 0}
      <Section spacing="md" withBorder>
        <Stack gap="md">
          <div class="text-sm" style="color: var(--accent-secondary)">
            Qualifications ({qualifications.length})
          </div>

          <Stack gap="md">
            {#each qualifications as qual}
              <Stack gap="xs">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                  <h3 class="text-base md:text-sm font-medium" style="color: var(--text-primary)">
                    {qual.title}
                  </h3>
                  <span class="text-sm flex-shrink-0" style="color: var(--text-muted)">
                    [{qual.year}]
                  </span>
                </div>
                <div class="text-sm" style="color: var(--link-color)">
                  {qual.institution}
                </div>
                {#if qual.description}
                  <p class="text-sm" style="color: var(--text-muted)">
                    {qual.description}
                  </p>
                {/if}
              </Stack>
            {/each}
          </Stack>
        </Stack>
      </Section>
    {/if}

    <!-- Skills Section -->
    {#if Object.keys(skillsByCategory).length > 0}
      <Section spacing="md" withBorder>
        <Stack gap="md">
          <div class="text-sm" style="color: var(--accent-secondary)">
            Skills
          </div>
          <Grid cols={3} gap="lg">
            {#each Object.entries(skillsByCategory) as [category, categorySkills]}
              <Stack gap="xs">
                <div class="text-sm" style="color: var(--text-muted)">
                  "{category.toLowerCase()}": [
                </div>
                <ul class="space-y-2 text-sm ml-4" style="color: var(--text-primary)">
                  {#each categorySkills as skill}
                    <li>→ {skill.name}</li>
                  {/each}
                </ul>
                <div class="text-sm" style="color: var(--text-muted)">
                  ]
                </div>
              </Stack>
            {/each}
          </Grid>
        </Stack>
      </Section>
    {:else}
      <!-- Fallback static skills if none from database -->
      <Section spacing="md" withBorder>
        <Stack gap="md">
          <div class="text-sm" style="color: var(--accent-secondary)">
            Skills
          </div>
          <Grid cols={3} gap="lg">
            <Stack gap="xs">
              <div class="text-sm" style="color: var(--text-muted)">
                "design": [
              </div>
              <ul class="space-y-2 text-sm ml-4" style="color: var(--text-primary)">
                <li>→ 3D Modeling</li>
                <li>→ CAD Design</li>
                <li>→ UI/UX Design</li>
                <li>→ Woodworking</li>
              </ul>
              <div class="text-sm" style="color: var(--text-muted)">
                ]
              </div>
            </Stack>

            <Stack gap="xs">
              <div class="text-sm" style="color: var(--text-muted)">
                "fabrication": [
              </div>
              <ul class="space-y-2 text-sm ml-4" style="color: var(--text-primary)">
                <li>→ 3D Printing</li>
                <li>→ CNC Machining</li>
                <li>→ Laser Cutting</li>
                <li>→ Carpentry</li>
              </ul>
              <div class="text-sm" style="color: var(--text-muted)">
                ]
              </div>
            </Stack>

            <Stack gap="xs">
              <div class="text-sm" style="color: var(--text-muted)">
                "software": [
              </div>
              <ul class="space-y-2 text-sm ml-4" style="color: var(--text-primary)">
                <li>→ React/TypeScript</li>
                <li>→ Node.js</li>
                <li>→ Python</li>
                <li>→ Three.js</li>
              </ul>
              <div class="text-sm" style="color: var(--text-muted)">
                ]
              </div>
            </Stack>
          </Grid>
        </Stack>
      </Section>
    {/if}

    <!-- CTA Section -->
    <Section spacing="md" withBorder>
      <Stack gap="sm">
        <div class="text-sm" style="color: var(--accent-secondary)">
          Collaboration & Consulting
        </div>
        <p class="text-base md:text-sm max-w-2xl" style="color: var(--text-primary)">
          I'm available for collaboration and consulting. Interested in working together? Let's
          discuss your project.
        </p>
        <a
          href="/contact"
          class="inline-block text-base md:text-sm py-2 hover:opacity-70 transition-opacity"
          style="color: var(--link-color); touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
        >
          [Get in touch →]
        </a>
      </Stack>
    </Section>
  </Stack>
</Container>
