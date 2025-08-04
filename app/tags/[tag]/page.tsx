import { notFound } from 'next/navigation';
import { DigitalForest } from '@/lib/forest';
import { ForestHeader, ForestLayout } from '@/components/forest';
import { SeedGrid } from '@/components/seed';

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const forest = new DigitalForest();
  await forest.cultivate();
  
  const taggedSeeds = forest.findByTag(decodedTag);
  
  if (taggedSeeds.length === 0) {
    notFound();
  }
  
  return (
    <ForestLayout>
      <ForestHeader 
        title={`Seeds tagged with "${decodedTag}"`}
        description={`Found ${taggedSeeds.length} ${taggedSeeds.length === 1 ? 'seed' : 'seeds'} with this tag`}
      />
      
      <SeedGrid seeds={taggedSeeds} />
    </ForestLayout>
  );
}

export async function generateStaticParams() {
  const forest = new DigitalForest();
  const { seeds } = await forest.cultivate();
  
  // Extract all unique tags
  const allTags = new Set<string>();
  seeds.forEach(seed => {
    seed.meta.tags?.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags).map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}