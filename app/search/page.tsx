import { DigitalForest } from '@/lib/forest'
import { ForestLayout } from '@/components/forest'
import { SeedSearch } from '@/components/forest'

export default async function SearchPage() {
  const forest = new DigitalForest()
  const forestData = await forest.cultivate()

  return (
    <ForestLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Search Forest</h1>
        <p className="text-muted-foreground mb-8">
          Find seeds by title, description, or tags
        </p>
        
        <SeedSearch seeds={forestData.seeds} />
      </div>
    </ForestLayout>
  )
}