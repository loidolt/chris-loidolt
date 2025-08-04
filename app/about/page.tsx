import { GardenLayout } from '@/components/garden'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <GardenLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">About this Digital Garden</h1>
          <p className="text-lg text-muted-foreground">
            A space for ideas to grow and evolve in public
          </p>
        </div>

        <Card>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
            <h2>What is a Digital Garden?</h2>
            <p>
              A digital garden is a collection of evolving ideas that aren&apos;t strictly 
              organized by publication date. They&apos;re inherently exploratory – notes 
              are linked through contextual associations. They aren&apos;t refined or 
              complete - notes are published as half-finished thoughts that will grow 
              and evolve over time.
            </p>

            <h2>The Growing Stages</h2>
            <ul>
              <li>
                <strong>🌱 Seedling</strong> - Newly planted ideas that are just 
                taking root. These are rough, early stage thoughts.
              </li>
              <li>
                <strong>🌿 Budding</strong> - Ideas that have started to grow. 
                More developed but still evolving.
              </li>
              <li>
                <strong>🌳 Evergreen</strong> - Well-developed ideas that are 
                relatively complete, though may still be updated.
              </li>
              <li>
                <strong>🌲 Perennial</strong> - Established ideas that have stood 
                the test of time. Rarely updated but occasionally tended to.
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
              This garden automatically discovers and cultivates content from my GitHub 
              repositories. Each repository with a <code>.seed</code> directory is 
              processed and displayed here, creating a living documentation of my work 
              and thoughts.
            </p>
          </CardContent>
        </Card>
      </div>
    </GardenLayout>
  )
}