import Link from 'next/link';
import { DigitalForest } from '@/lib/forest';
import { ForestHeader, ForestStats, ForestLayout } from '@/components/forest';
import { SeedGrid } from '@/components/seed';
import { Button } from '@/components/ui/button';

export default async function ForestPage() {
  const forest = new DigitalForest();
  const forestData = await forest.cultivate();
  
  return (
    <ForestLayout>
      <ForestHeader 
        title="Digital Forest 🌲"
        description={`A collection of ${forestData.stats.totalSeeds} ideas, projects, and thoughts growing into a forest`}
      />
      
      <div className="flex justify-end mb-6 gap-4">
        <Link href="/forest/game">
          <Button variant="outline">
            🎮 Top-Down Forest
          </Button>
        </Link>
        <Link href="/forest/sidescroller">
          <Button variant="outline">
            🏃 Forest Trail
          </Button>
        </Link>
        <Link href="/forest/explore">
          <Button variant="outline">
            🔍 Explore Forest
          </Button>
        </Link>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Forest Overview</h2>
        <ForestStats forest={forestData} />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">All Seeds</h2>
        <SeedGrid seeds={forestData.seeds} />
      </section>
    </ForestLayout>
  );
}