import Link from 'next/link';
import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenStats, GardenLayout } from '@/components/garden';
import { SeedGrid } from '@/components/seed';
import { Button } from '@/components/ui/button';

export default async function GardenPage() {
  const garden = new DigitalGarden();
  const gardenData = await garden.cultivate();
  
  return (
    <GardenLayout>
      <GardenHeader 
        title="Digital Garden 🌱"
        description={`A collection of ${gardenData.stats.totalSeeds} ideas, projects, and thoughts growing in public`}
      />
      
      <div className="flex justify-end mb-6">
        <Link href="/garden/explore">
          <Button variant="outline">
            🔍 Explore Garden
          </Button>
        </Link>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Garden Overview</h2>
        <GardenStats garden={gardenData} />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">All Seeds</h2>
        <SeedGrid seeds={gardenData.seeds} />
      </section>
    </GardenLayout>
  );
}