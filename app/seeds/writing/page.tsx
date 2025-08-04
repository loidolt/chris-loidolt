import { DigitalForest } from '@/lib/forest';
import { ForestHeader, ForestLayout } from '@/components/forest';
import { SeedGrid } from '@/components/seed';

export default async function WritingPage() {
  const forest = new DigitalForest();
  await forest.cultivate();
  
  const writingSeeds = forest.findByType('writing' as const);
  
  return (
    <ForestLayout>
      <ForestHeader 
        title="Writing ✍️"
        description="Articles, tutorials, and longer-form content"
      />
      
      <SeedGrid 
        seeds={writingSeeds} 
        emptyMessage="No writing published yet."
      />
    </ForestLayout>
  );
}