import Link from 'next/link';
import { DigitalForest } from '@/lib/forest';
import { SeedGrid } from '@/components/seed';
import { ForestStats } from '@/components/forest';
import { getMostRecentSeeds } from '@/lib/forest/stats';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const forest = new DigitalForest();
  const forestData = await forest.cultivate();
  
  // Get featured seeds or most recent if no featured
  const featuredSeeds = forest.findFeatured();
  const displaySeeds = featuredSeeds.length > 0 
    ? featuredSeeds.slice(0, 6)
    : getMostRecentSeeds(forestData.seeds, 6);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to My Digital Forest 🌲
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A collection of ideas, projects, and thoughts growing into mighty trees. 
          Explore {forestData.stats.totalSeeds} seeds across different stages of growth.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/forest">
              Explore the Forest →
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/seeds/projects">
              View Projects
            </Link>
          </Button>
        </div>
      </section>

      {/* Forest Stats */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-center mb-8">Forest Overview</h2>
        <ForestStats forest={forestData} />
      </section>

      {/* Featured/Recent Seeds */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold">
            {featuredSeeds.length > 0 ? 'Featured Seeds' : 'Recent Seeds'}
          </h2>
          <Link 
            href="/forest" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all seeds →
          </Link>
        </div>
        <SeedGrid seeds={displaySeeds} />
      </section>

      {/* Quick Links */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
        <Link 
          href="/seeds/projects"
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div className="text-3xl mb-2">🚀</div>
          <h3 className="font-semibold mb-1">Projects</h3>
          <p className="text-sm text-muted-foreground">
            {forestData.stats.byType.project || 0} software projects
          </p>
        </Link>
        
        <Link 
          href="/seeds/experiments"
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div className="text-3xl mb-2">🧪</div>
          <h3 className="font-semibold mb-1">Experiments</h3>
          <p className="text-sm text-muted-foreground">
            {forestData.stats.byType.experiment || 0} technical experiments
          </p>
        </Link>
        
        <Link 
          href="/seeds/notes"
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-semibold mb-1">Notes</h3>
          <p className="text-sm text-muted-foreground">
            {forestData.stats.byType.note || 0} quick thoughts
          </p>
        </Link>
        
        <Link 
          href="/seeds/writing"
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div className="text-3xl mb-2">✍️</div>
          <h3 className="font-semibold mb-1">Writing</h3>
          <p className="text-sm text-muted-foreground">
            {forestData.stats.byType.writing || 0} articles
          </p>
        </Link>
      </section>
    </div>
  );
}