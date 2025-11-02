<script lang="ts">
	import { Container, PageHeader, Section, Stack } from '$lib/layouts';
	import * as Card from '$lib/components/ui/card';
	import type { Person } from '$lib/pocketbase';

	interface Props {
		persons: Person[];
		projectCount: number;
	}

	let { persons, projectCount }: Props = $props();
</script>

<Container>
	<PageHeader
		title="Loidolt Spaces"
		subtitle="A family of makers, creators, and explorers"
	/>

	<!-- Family Stats -->
	<Section title="Family Overview">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Card.Card>
				<Card.CardContent class="p-6">
					<h3 class="text-2xl font-bold mb-2">{persons.length}</h3>
					<p class="text-muted-foreground">Family Members</p>
				</Card.CardContent>
			</Card.Card>
			<Card.Card>
				<Card.CardContent class="p-6">
					<h3 class="text-2xl font-bold mb-2">{projectCount}</h3>
					<p class="text-muted-foreground">Shared Projects</p>
				</Card.CardContent>
			</Card.Card>
		</div>
	</Section>

	<!-- Family Member Directory -->
	<Section title="Family Members">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each persons as person}
				<a
					href="/?person={person.slug}"
					class="group block"
				>
					<Card.Card class="hover:shadow-lg transition-shadow">
						<Card.CardContent class="p-6 text-center">
							{#if person.avatar}
								<img
									src={person.avatar}
									alt={person.name}
									class="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-border group-hover:border-primary transition-colors"
								/>
							{:else}
								<div class="w-24 h-24 rounded-full mx-auto mb-4 bg-accent flex items-center justify-center text-3xl font-bold border-2 border-border group-hover:border-primary transition-colors">
									{person.name[0]}
								</div>
							{/if}
							<h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
								{person.name}
							</h3>
							{#if person.bio}
								<p class="text-sm text-muted-foreground line-clamp-2">
									{@html person.bio}
								</p>
							{/if}
						</Card.CardContent>
					</Card.Card>
				</a>
			{/each}
		</div>
	</Section>

	<!-- Quick Links -->
	<Section title="Explore">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<a href="/projects">
				<Card.Card class="hover:shadow-lg transition-shadow">
					<Card.CardContent class="p-6">
						<h3 class="text-lg font-bold mb-2">Family Projects</h3>
						<p class="text-muted-foreground">
							Collaborative projects and shared work
						</p>
					</Card.CardContent>
				</Card.Card>
			</a>
			<a href="/gis">
				<Card.Card class="hover:shadow-lg transition-shadow">
					<Card.CardContent class="p-6">
						<h3 class="text-lg font-bold mb-2">Places We've Been</h3>
						<p class="text-muted-foreground">
							Locations and adventures on the map
						</p>
					</Card.CardContent>
				</Card.Card>
			</a>
			<a href="/about">
				<Card.Card class="hover:shadow-lg transition-shadow">
					<Card.CardContent class="p-6">
						<h3 class="text-lg font-bold mb-2">About Us</h3>
						<p class="text-muted-foreground">
							Learn more about our family
						</p>
					</Card.CardContent>
				</Card.Card>
			</a>
		</div>
	</Section>
</Container>
