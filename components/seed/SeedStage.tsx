import { Badge } from '@/components/ui/badge';
import type { GrowthStage } from '@/lib/seed/types';

interface SeedStageProps {
  stage: GrowthStage;
  showLabel?: boolean;
}

const stageConfig = {
  seedling: {
    emoji: '🌱',
    label: 'Seedling',
    description: 'Just planted, early ideas',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  budding: {
    emoji: '🌿',
    label: 'Budding',
    description: 'Growing and developing',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  evergreen: {
    emoji: '🌳',
    label: 'Evergreen',
    description: 'Mature and actively maintained',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  perennial: {
    emoji: '🌲',
    label: 'Perennial',
    description: 'Complete but worth preserving',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
};

export function SeedStage({ stage, showLabel = true }: SeedStageProps) {
  const config = stageConfig[stage];
  
  return (
    <Badge className={config.className} title={config.description}>
      {config.emoji}
      {showLabel && <span className="ml-1">{config.label}</span>}
    </Badge>
  );
}