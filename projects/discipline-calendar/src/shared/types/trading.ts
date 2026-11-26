export type TradeResult = "win" | "lose";
export type PositionType = "long" | "short";
export type ViolationTag = "fomo" | "revenge" | "overtrade" | "impulse" | "other";
export type MoodTag = "calm" | "neutral" | "stressed" | "tilted";
export interface DayAttachment {
  id: string;
  name: string;
  path: string;
  url: string;
  createdAt: string;
}

export interface TradeRecord {
  id: string;
  asset: string;
  positionType: PositionType;
  result: TradeResult;
  rr: number;
  byPlan: boolean;
  violationTag?: ViolationTag;
  entry?: number;
  stop?: number;
  take?: number;
}

export interface SkippedTradeRecord {
  id: string;
  asset: string;
  reason: string;
  hypotheticalResult: TradeResult;
  hypotheticalRr: number;
  comment?: string;
}

export interface DayRecord {
  id?: string;
  date: string;
  comment: string;
  mood?: MoodTag;
  noTradeDay?: boolean;
  trades: TradeRecord[];
  skippedTrades: SkippedTradeRecord[];
  attachments: DayAttachment[];
}

export type TradingJournal = Record<string, DayRecord>;
