import { DigitalForest } from '@/lib/forest';
import { ForestHeader, ForestLayout } from '@/components/forest';
import { SeedGrid } from '@/components/seed';

export default async function ProjectsPage() {
  const forest = new DigitalForest();
  await forest.cultivate();
  
  const projectSeeds = forest.findByType('project' as const);
  
  return (
    <ForestLayout>
      <ForestHeader 
        title="Projects 🚀"
        description="Software projects and experiments I've built"
      />
      
      <SeedGrid 
        seeds={projectSeeds} 
        emptyMessage="No projects found. Time to build something!"
      />
    </ForestLayout>
  );
}