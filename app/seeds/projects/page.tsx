import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenLayout } from '@/components/garden';
import { SeedGrid } from '@/components/seed';

export default async function ProjectsPage() {
  const garden = new DigitalGarden();
  await garden.cultivate();
  
  const projectSeeds = garden.findByType('project' as const);
  
  return (
    <GardenLayout>
      <GardenHeader 
        title="Projects 🚀"
        description="Software projects and experiments I've built"
      />
      
      <SeedGrid 
        seeds={projectSeeds} 
        emptyMessage="No projects found. Time to build something!"
      />
    </GardenLayout>
  );
}