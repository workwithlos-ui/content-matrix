export interface ContentPiece {
  type: string;
  title: string;
  content: string;
  platform: string;
  alt_hooks?: string[];
  cta_options?: string[];
}

export interface DayContent {
  day: number;
  label: string;
  angle?: string;
  description: string;
  pieces: ContentPiece[];
}

export interface ContentPreferences {
  audience: string;
  brandVoice: string;
  offerCta: string;
  notes: string;
  campaignGoal?: string;
  coreOffer?: string;
  proofPoints?: string;
  competitorContext?: string;
  bannedClaims?: string;
  swipeFile?: string;
}

export interface StrategyBrief {
  positioning: string;
  hookThemes: string[];
  proofAssets: string[];
  ctaStrategy: string;
}

export interface PieceScorecard {
  hookStrength: number;
  specificity: number;
  offerAlignment: number;
  platformFit: number;
  overall: number;
  revisionPriorities: string[];
}

export interface ContentCalendar {
  topic: string;
  sourceType: "youtube" | "topic";
  days: DayContent[];
  generatedAt: number;
  preferences?: ContentPreferences;
  presetName?: string;
  strategyBrief?: StrategyBrief;
  clientProfile?: string;
}
