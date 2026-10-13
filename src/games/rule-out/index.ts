// ============================================================
// Rule Out — Game Definition (module entry point)
// Display text comes from the game catalog, so the name lives in
// one place (src/lib/gameCatalog.ts).
// ============================================================

import type { GameDefinition } from '@/games/types';
import { getCatalogGame } from '@/lib/gameCatalog';
import type { RuleOutState, RuleOutAction } from './types';
import RuleOutGame from './RuleOutGame';
import RuleOutResult from './RuleOutResult';

export type { RuleOutState, RuleOutAction } from './types';

const catalog = getCatalogGame('rule-out')!;

const ruleOut: GameDefinition<RuleOutState, RuleOutAction> = {
  id: catalog.id,
  name: catalog.name,
  description: catalog.description,
  shortDescription: catalog.shortDescription,
  emoji: catalog.emoji,
  category: 'strategy',
  tags: catalog.tags,
  minPlayers: catalog.minPlayers,
  maxPlayers: catalog.maxPlayers,
  supportsSpectators: true,
  estimatedDuration: catalog.duration,
  component: RuleOutGame,
  ResultComponent: RuleOutResult,
  wideLayout: true,
  accentColor: catalog.accentColor,
  rules: catalog.rules,
  optionsSchema: [
    {
      key: 'mode',
      label: 'Questions',
      type: 'select',
      options: [
        { label: '🗣️ Ask out loud', value: 'free' },
        { label: '💬 Take turns in the app', value: 'questions' },
      ],
      default: 'free',
    },
  ],
};

export default ruleOut;
