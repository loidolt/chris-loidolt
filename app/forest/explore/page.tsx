import { DigitalForest } from '@/lib/forest';
import { ForestHeader, ForestLayout } from '@/components/forest';
import { ForestExploreClient } from './forest-explore-client';

export default async function ExploreForestPage() {
  const forest = new DigitalForest();
  const { seeds } = await forest.cultivate();

  return (
    <ForestLayout>
      <ForestHeader 
        title="Explore the Forest 🌲"
        description="Discover and explore all the seeds growing into mighty trees in this digital forest"
      />

      <ForestExploreClient seeds={seeds} />
    </ForestLayout>
  );
}