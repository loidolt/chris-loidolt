import { DigitalForest } from '@/lib/forest';
import { ForestHeader, ForestLayout } from '@/components/forest';
import { SeedGrid } from '@/components/seed';

export default async function NotesPage() {
  const forest = new DigitalForest();
  await forest.cultivate();
  
  const noteSeeds = forest.findByType('note' as const);
  
  return (
    <ForestLayout>
      <ForestHeader 
        title="Notes 📝"
        description="Quick thoughts, observations, and ideas in progress"
      />
      
      <SeedGrid 
        seeds={noteSeeds} 
        emptyMessage="No notes yet. Start capturing ideas!"
      />
    </ForestLayout>
  );
}