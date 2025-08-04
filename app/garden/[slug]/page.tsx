import { notFound } from 'next/navigation';
import { DigitalGarden } from '@/lib/garden';
import { GardenLayout } from '@/components/garden';
import { SeedDetail, RelatedSeeds } from '@/components/seed';

interface SeedPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SeedPage({ params }: SeedPageProps) {
  const { slug } = await params;
  const garden = new DigitalGarden();
  await garden.cultivate();
  
  const seed = garden.getSeed(slug);
  
  if (!seed) {
    notFound();
  }
  
  const relatedSeeds = garden.findRelated(seed, 5);
  
  return (
    <GardenLayout>
      <SeedDetail seed={seed} />
      <RelatedSeeds currentSeed={seed} relatedSeeds={relatedSeeds} />
    </GardenLayout>
  );
}

export async function generateStaticParams() {
  const garden = new DigitalGarden();
  const { seeds } = await garden.cultivate();
  
  return seeds.map((seed) => ({
    slug: seed.slug,
  }));
}