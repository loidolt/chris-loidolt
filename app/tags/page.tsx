import { DigitalForest } from '@/lib/forest';
import { ForestHeader, ForestLayout, TagCloud } from '@/components/forest';

export default async function TagsPage() {
  const forest = new DigitalForest();
  const { seeds } = await forest.cultivate();

  return (
    <ForestLayout>
      <ForestHeader 
        title="Browse by Tags 🏷️"
        description="Explore the forest through thematic connections"
      />
      
      <div className="max-w-4xl mx-auto">
        <TagCloud seeds={seeds} asLinks />
      </div>
    </ForestLayout>
  );
}