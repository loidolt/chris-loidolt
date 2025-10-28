<script lang="ts">
  import ProjectsGrid from '$lib/components/ProjectsGrid.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Projects - {data.personSlug === 'loidolt' ? 'Loidolt Spaces' : data.personSlug}</title>
  <meta name="description" content="Browse design and engineering projects in 3D printing, woodworking, and software development." />
</svelte:head>

<ProjectsGrid projects={data.projects} />
