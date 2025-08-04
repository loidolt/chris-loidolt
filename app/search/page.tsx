import { DigitalGarden } from '@/lib/garden'
import { GardenLayout } from '@/components/garden'
import { SeedSearch } from '@/components/garden'

export default async function SearchPage() {
  const garden = new DigitalGarden()
  const gardenData = await garden.cultivate()

  return (
    <GardenLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Search Garden</h1>
        <p className="text-muted-foreground mb-8">
          Find seeds by title, description, or tags
        </p>
        
        <SeedSearch seeds={gardenData.seeds} />
      </div>
    </GardenLayout>
  )
}