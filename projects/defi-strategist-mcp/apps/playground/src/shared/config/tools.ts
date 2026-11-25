export type ToolId =
  | 'find_yields'
  | 'analyze_pendle'
  | 'simulate_loop'
  | 'funding_carry'
  | 'compare';

export const toolList: { id: ToolId; label: string; blurb: string }[] = [
  {
    id: 'find_yields',
    label: 'Find yields',
    blurb: 'Risk-adjusted DefiLlama pool ranking',
  },
  {
    id: 'analyze_pendle',
    label: 'Pendle PT/YT',
    blurb: 'Implied vs underlying APY verdict',
  },
  {
    id: 'simulate_loop',
    label: 'Loop simulator',
    blurb: 'Leverage, HF, and shock scenarios',
  },
  {
    id: 'funding_carry',
    label: 'Funding carry',
    blurb: 'Hyperliquid annualized funding',
  },
  {
    id: 'compare',
    label: 'Compare',
    blurb: 'Side-by-side strategy sheet',
  },
];