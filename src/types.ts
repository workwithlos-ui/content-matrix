export interface ContentPiece {
  type: string;
  title: string;
  content: string;
  platform: string;
}

export interface DayContent {
  day: number;
  label: string;
  description: string;
  pieces: ContentPiece[];
}

export interface ContentCalendar {
  topic: string;
  sourceType: "youtube" | "topic";
  days: DayContent[];
  generatedAt: number;
}
