import { DigitalForest } from '@/lib/forest';
import { ForestHeader, ForestLayout } from '@/components/forest';
import { SeedGrid } from '@/components/seed';

export default async function ExperimentsPage() {
  const forest = new DigitalForest();
  await forest.cultivate();
  
  const experimentSeeds = forest.findByType('experiment' as const);
  
  return (
    <ForestLayout>
      <ForestHeader 
        title="Experiments 🧪"
        description="Technical experiments, prototypes, and explorations"
      />
      
      <SeedGrid 
        seeds={experimentSeeds} 
        emptyMessage="No experiments documented yet."
      />
    </ForestLayout>
  );
}