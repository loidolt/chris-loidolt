import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenLayout } from '@/components/garden';
import { SeedGrid } from '@/components/seed';

export default async function WritingPage() {
  const garden = new DigitalGarden();
  await garden.cultivate();
  
  const writingSeeds = garden.findByType('writing' as const);
  
  return (
    <GardenLayout>
      <GardenHeader 
        title="Writing ✍️"
        description="Articles, tutorials, and longer-form content"
      />
      
      <SeedGrid 
        seeds={writingSeeds} 
        emptyMessage="No writing published yet."
      />
    </GardenLayout>
  );
}