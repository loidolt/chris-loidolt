import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenLayout } from '@/components/garden';
import { SeedGrid } from '@/components/seed';

export default async function ExperimentsPage() {
  const garden = new DigitalGarden();
  await garden.cultivate();
  
  const experimentSeeds = garden.findByType('experiment' as const);
  
  return (
    <GardenLayout>
      <GardenHeader 
        title="Experiments 🧪"
        description="Technical experiments, prototypes, and explorations"
      />
      
      <SeedGrid 
        seeds={experimentSeeds} 
        emptyMessage="No experiments documented yet."
      />
    </GardenLayout>
  );
}