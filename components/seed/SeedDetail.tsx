import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SeedStage } from './SeedStage';
import type { SeedContent } from '@/lib/seed/types';

interface SeedDetailProps {
  seed: SeedContent;
}

export function SeedDetail({ seed }: SeedDetailProps) {
  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <SeedStage stage={seed.meta.stage} />
          <Badge variant="secondary">{seed.meta.type}</Badge>
          {seed.meta.featured && <Badge>⭐ Featured</Badge>}
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{seed.meta.title}</h1>
        
        {seed.meta.description && (
          <p className="text-xl text-muted-foreground mb-6">
            {seed.meta.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-6">
          {seed.meta.tags?.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>{seed.readingTime} min read</span>
          <span>{seed.wordCount} words</span>
          {seed.meta.planted && (
            <span>Planted: {new Date(seed.meta.planted).toISOString().split('T')[0]}</span>
          )}
          {seed.meta.tended && (
            <span>Last tended: {new Date(seed.meta.tended).toISOString().split('T')[0]}</span>
          )}
        </div>
      </header>
      
      <Card>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none p-8">
          <div dangerouslySetInnerHTML={{ __html: seed.content }} />
        </CardContent>
      </Card>
      
      {seed.meta.connections && seed.meta.connections.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Connected Seeds</h2>
          <div className="flex flex-wrap gap-2">
            {seed.meta.connections.map((connection) => (
              <Link key={connection} href={`/forest/${connection}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                  {connection}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      <footer className="mt-12 pt-8 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Link href={seed.source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            View on GitHub →
          </Link>
          {seed.source.stars !== undefined && (
            <span>⭐ {seed.source.stars} stars</span>
          )}
        </div>
      </footer>
    </article>
  );
}