import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenLayout } from '@/components/garden';
import { SeedGrid } from '@/components/seed';

export default async function NotesPage() {
  const garden = new DigitalGarden();
  await garden.cultivate();
  
  const noteSeeds = garden.findByType('note' as const);
  
  return (
    <GardenLayout>
      <GardenHeader 
        title="Notes 📝"
        description="Quick thoughts, observations, and ideas in progress"
      />
      
      <SeedGrid 
        seeds={noteSeeds} 
        emptyMessage="No notes yet. Start capturing ideas!"
      />
    </GardenLayout>
  );
}