import { notFound } from 'next/navigation';
import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenLayout } from '@/components/garden';
import { SeedGrid } from '@/components/seed';

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const garden = new DigitalGarden();
  await garden.cultivate();
  
  const taggedSeeds = garden.findByTag(decodedTag);
  
  if (taggedSeeds.length === 0) {
    notFound();
  }
  
  return (
    <GardenLayout>
      <GardenHeader 
        title={`Seeds tagged with "${decodedTag}"`}
        description={`Found ${taggedSeeds.length} ${taggedSeeds.length === 1 ? 'seed' : 'seeds'} with this tag`}
      />
      
      <SeedGrid seeds={taggedSeeds} />
    </GardenLayout>
  );
}

export async function generateStaticParams() {
  const garden = new DigitalGarden();
  const { seeds } = await garden.cultivate();
  
  // Extract all unique tags
  const allTags = new Set<string>();
  seeds.forEach(seed => {
    seed.meta.tags?.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags).map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}