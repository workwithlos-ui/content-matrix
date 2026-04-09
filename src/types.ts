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
}

export interface ContentCalendar {
  topic: string;
  sourceType: "youtube" | "topic";
  days: DayContent[];
  generatedAt: number;
  preferences?: ContentPreferences;
}
