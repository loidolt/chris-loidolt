import { notFound } from 'next/navigation';
import { DigitalForest } from '@/lib/forest';
import { ForestLayout } from '@/components/forest';
import { SeedDetail, RelatedSeeds } from '@/components/seed';

interface SeedPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SeedPage({ params }: SeedPageProps) {
  const { slug } = await params;
  const forest = new DigitalForest();
  await forest.cultivate();
  
  const seed = forest.getSeed(slug);
  
  if (!seed) {
    notFound();
  }
  
  const relatedSeeds = forest.findRelated(seed, 5);
  
  return (
    <ForestLayout>
      <SeedDetail seed={seed} />
      <RelatedSeeds currentSeed={seed} relatedSeeds={relatedSeeds} />
    </ForestLayout>
  );
}

export async function generateStaticParams() {
  const forest = new DigitalForest();
  const { seeds } = await forest.cultivate();
  
  return seeds.map((seed) => ({
    slug: seed.slug,
  }));
}