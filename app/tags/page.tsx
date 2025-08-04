import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenLayout, TagCloud } from '@/components/garden';

export default async function TagsPage() {
  const garden = new DigitalGarden();
  const { seeds } = await garden.cultivate();

  return (
    <GardenLayout>
      <GardenHeader 
        title="Browse by Tags 🏷️"
        description="Explore the garden through thematic connections"
      />
      
      <div className="max-w-4xl mx-auto">
        <TagCloud seeds={seeds} asLinks />
      </div>
    </GardenLayout>
  );
}