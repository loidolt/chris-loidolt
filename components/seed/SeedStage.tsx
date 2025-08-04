import { Badge } from '@/components/ui/badge';
import type { GrowthStage } from '@/lib/seed/types';

interface SeedStageProps {
  stage: GrowthStage;
  showLabel?: boolean;
}

const stageConfig = {
  sprout: {
    emoji: '🌱',
    label: 'Sprout',
    description: 'New growth, just emerging',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  sapling: {
    emoji: '🌿',
    label: 'Sapling',
    description: 'Young tree, establishing roots',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  mature: {
    emoji: '🌳',
    label: 'Mature',
    description: 'Full grown, bearing fruit',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  ancient: {
    emoji: '🌲',
    label: 'Ancient',
    description: 'Timeless wisdom, deep roots',
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