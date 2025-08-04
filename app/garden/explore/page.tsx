import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenLayout } from '@/components/garden';
import { GardenExploreClient } from './garden-explore-client';

export default async function ExploreGardenPage() {
  const garden = new DigitalGarden();
  const { seeds } = await garden.cultivate();

  return (
    <GardenLayout>
      <GardenHeader 
        title="Explore the Garden 🌿"
        description="Discover and explore all the seeds growing in this digital garden"
      />

      <GardenExploreClient seeds={seeds} />
    </GardenLayout>
  );
}