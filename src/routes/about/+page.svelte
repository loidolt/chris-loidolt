<script lang="ts">
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

<div class="space-y-12">
  <!-- Page Header -->
  <div>
    <h1 class="text-xl md:text-2xl mb-6" style="color: var(--text-primary)">
      {data.personSlug === 'chris' ? 'Chris Loidolt - ' : ''}Designer & Engineer
    </h1>
  </div>

  <!-- About Section -->
  <div class="pt-8" style="border-top: 1px solid var(--border-color)">
    <div class="text-sm mb-6" style="color: var(--accent-secondary)">
      About
    </div>
    <div class="space-y-4 max-w-3xl text-base md:text-sm" style="color: var(--text-primary)">
      <p>
        I'm a designer and engineer with a passion for creating innovative solutions through 3D
        printing, woodworking, and software development. My work combines technical precision
        with creative problem-solving to bring ideas to life.
      </p>
      <p>
        From designing custom 3D-printed parts to building full-stack web applications, I love
        tackling complex challenges and learning new technologies along the way.
      </p>
    </div>
  </div>

  <!-- Services Section -->
  {#if services.length > 0}
    <div class="pt-8" style="border-top: 1px solid var(--border-color)">
      <div class="text-sm mb-6" style="color: var(--accent-secondary)">
        Services ({services.length})
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {#each services as service}
          <div class="space-y-2 p-4 md:p-0" style="background-color: var(--bg-surface); border: 1px solid var(--border-color)">
            <h3 class="text-base md:text-sm font-medium" style="color: var(--text-primary)">
              {#if service.icon}<span class="mr-2">{service.icon}</span>{/if}
              {service.title}
            </h3>
            <p class="text-sm" style="color: var(--text-muted)">
              {service.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Qualifications Section -->
  {#if qualifications.length > 0}
    <div class="pt-8" style="border-top: 1px solid var(--border-color)">
      <div class="text-sm mb-6" style="color: var(--accent-secondary)">
        Qualifications ({qualifications.length})
      </div>

      <div class="space-y-6">
        {#each qualifications as qual}
          <div class="space-y-2">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
              <h3 class="text-base md:text-sm font-medium" style="color: var(--text-primary)">
                {qual.title}
              </h3>
              <span class="text-sm" style="color: var(--text-muted)">
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
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Skills Section -->
  {#if Object.keys(skillsByCategory).length > 0}
    <div class="pt-8" style="border-top: 1px solid var(--border-color)">
      <div class="text-sm mb-6" style="color: var(--accent-secondary)">
        Skills
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {#each Object.entries(skillsByCategory) as [category, categorySkills]}
          <div>
            <div class="mb-3 text-sm" style="color: var(--text-muted)">
              "{category.toLowerCase()}": [
            </div>
            <ul class="space-y-2 text-sm ml-4" style="color: var(--text-primary)">
              {#each categorySkills as skill}
                <li>→ {skill.name}</li>
              {/each}
            </ul>
            <div class="text-sm mt-2" style="color: var(--text-muted)">
              ]
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Fallback static skills if none from database -->
    <div class="pt-8" style="border-top: 1px solid var(--border-color)">
      <div class="text-sm mb-6" style="color: var(--accent-secondary)">
        Skills
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        <div>
          <div class="mb-3 text-sm" style="color: var(--text-muted)">
            "design": [
          </div>
          <ul class="space-y-2 text-sm ml-4" style="color: var(--text-primary)">
            <li>→ 3D Modeling</li>
            <li>→ CAD Design</li>
            <li>→ UI/UX Design</li>
            <li>→ Woodworking</li>
          </ul>
          <div class="text-sm mt-2" style="color: var(--text-muted)">
            ]
          </div>
        </div>

        <div>
          <div class="mb-3 text-sm" style="color: var(--text-muted)">
            "fabrication": [
          </div>
          <ul class="space-y-2 text-sm ml-4" style="color: var(--text-primary)">
            <li>→ 3D Printing</li>
            <li>→ CNC Machining</li>
            <li>→ Laser Cutting</li>
            <li>→ Carpentry</li>
          </ul>
          <div class="text-sm mt-2" style="color: var(--text-muted)">
            ]
          </div>
        </div>

        <div>
          <div class="mb-3 text-sm" style="color: var(--text-muted)">
            "software": [
          </div>
          <ul class="space-y-2 text-sm ml-4" style="color: var(--text-primary)">
            <li>→ React/TypeScript</li>
            <li>→ Node.js</li>
            <li>→ Python</li>
            <li>→ Three.js</li>
          </ul>
          <div class="text-sm mt-2" style="color: var(--text-muted)">
            ]
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- CTA Section -->
  <div class="pt-8" style="border-top: 1px solid var(--border-color)">
    <div class="text-sm mb-4" style="color: var(--accent-secondary)">
      Collaboration & Consulting
    </div>
    <p class="mb-6 text-base md:text-sm max-w-2xl" style="color: var(--text-primary)">
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
  </div>
</div>
