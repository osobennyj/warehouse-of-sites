export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  summary: string;
  highlights: readonly string[];
}

export const experience: readonly ExperienceItem[] = [
  {
    id: "independent",
    role: "Independent Researcher & Builder",
    organization: "Self-directed",
    period: "2023 to now",
    summary:
      "Token valuation research, DeFi strategy analysis and tooling built with AI coding agents. The projects on this site are the public proof.",
    highlights: [
      "Tokenomics: FDV, circulating supply, vesting & unlock pressure, liquidity",
      "DeFi: Pendle PT/YT, looping, points farming, funding-rate arbitrage",
      "Runs blockchain nodes on VPS: setup, sync, maintenance",
      "Python trading scripts (grid bot, funding arbitrage); public trading-diary Telegram channel",
    ],
  },
  {
    id: "arkham",
    role: "Community Manager",
    organization: "Arkham",
    period: "2023 to now",
    summary:
      "CIS community manager for an on-chain intelligence platform. Closed the loop between users and the product team.",
    highlights: [
      "Planned partnerships with the largest CIS crypto KOLs",
      "Relayed user feedback that shaped the CEX → DEX transition, VIP benefits and bug fixes",
      "Organized online campaigns and community events",
    ],
  },
  {
    id: "pg",
    role: "Manufacturing Process Engineer",
    organization: "Procter & Gamble",
    period: "2021 to 2022",
    summary: "Data-driven process optimization on high-volume packaging lines.",
    highlights: [
      "Two cost-reduction projects: about 3 to 4% less packaging paper, roughly $10k to $30k saved per year",
      "About 12% less product weight variation via root cause analysis, roughly $60k saved per year",
    ],
  },
  {
    id: "education",
    role: "Integrated Engineering, B.Sc.",
    organization: "TalTech · Erasmus+ at TUHH · Huawei Seeds for the Future",
    period: "2018 to 2022",
    summary: "Engineering degree in Tallinn with an Erasmus+ year at Hamburg University of Technology.",
    highlights: ["Selected for Huawei Seeds for the Future (2021): ICT training and entrepreneurship"],
  },
];
