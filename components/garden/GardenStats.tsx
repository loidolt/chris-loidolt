import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Garden } from '@/lib/garden';

interface GardenStatsProps {
  garden: Garden;
}

const typeEmojis = {
  project: '🚀',
  experiment: '🧪',
  note: '📝',
  writing: '✍️',
};

const stageEmojis = {
  seedling: '🌱',
  budding: '🌿',
  evergreen: '🌳',
  perennial: '🌲',
};

export function GardenStats({ garden }: GardenStatsProps) {
  const { stats } = garden;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Seeds</CardTitle>
          <span className="text-2xl">🌱</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSeeds}</div>
          <p className="text-xs text-muted-foreground">
            Across all categories
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Type</CardTitle>
          <span className="text-2xl">📊</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {typeEmojis[type as keyof typeof typeEmojis]} {type}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Stages</CardTitle>
          <span className="text-2xl">🌿</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            {Object.entries(stats.byStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {stageEmojis[stage as keyof typeof stageEmojis]} {stage}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          <span className="text-2xl">🕐</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(stats.lastUpdated).toISOString().split('T')[0]}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(stats.lastUpdated).toISOString().split('T')[1].split('.')[0]}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}