import { ForestLayout } from '@/components/forest'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <ForestLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">About this Digital Forest</h1>
          <p className="text-lg text-muted-foreground">
            A space for ideas to grow and evolve in public
          </p>
        </div>

        <Card>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
            <h2>What is a Digital Forest?</h2>
            <p>
              A digital forest is a collection of evolving ideas that grow like trees, 
              each starting as a small seed and growing into something larger. Ideas 
              are linked through root systems and canopy connections. They aren&apos;t 
              refined or complete - thoughts are planted as seeds that will grow 
              into mighty trees over time.
            </p>

            <h2>The Growing Stages</h2>
            <ul>
              <li>
                <strong>🌱 Sprout</strong> - New growth, just emerging from 
                the soil. These are fresh, early stage thoughts.
              </li>
              <li>
                <strong>🌿 Sapling</strong> - Young trees establishing their roots. 
                More developed but still growing stronger.
              </li>
              <li>
                <strong>🌳 Mature</strong> - Full grown trees bearing fruit. 
                Well-developed ideas that are complete and productive.
              </li>
              <li>
                <strong>🌲 Ancient</strong> - Timeless wisdom with deep roots. 
                Established ideas that have stood the test of time.
              </li>
            </ul>

            <h2>Content Types</h2>
            <ul>
              <li>
                <strong>Projects</strong> - Software projects and applications I&apos;ve built
              </li>
              <li>
                <strong>Experiments</strong> - Technical explorations and proof-of-concepts
              </li>
              <li>
                <strong>Notes</strong> - Quick thoughts and observations
              </li>
              <li>
                <strong>Writing</strong> - Longer-form articles and tutorials
              </li>
            </ul>

            <h2>How It Works</h2>
            <p>
              This forest automatically discovers and cultivates content from my GitHub 
              repositories. Each repository with a <code>.seed</code> directory is 
              processed and displayed here, creating a living ecosystem of my work 
              and thoughts.
            </p>
          </CardContent>
        </Card>
      </div>
    </ForestLayout>
  )
}