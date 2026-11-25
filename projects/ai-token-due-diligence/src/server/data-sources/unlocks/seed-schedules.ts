import type { UnlockDataSource, VestingSchedule } from "../types";

/**
 * Curated vesting schedules from official tokenomics docs (free unlock APIs are paywalled).
 * Adding a token = adding one entry. Amounts are in tokens; dates are UTC.
 */
export const SEED_SCHEDULES: readonly VestingSchedule[] = [
  {
    tokenId: "arbitrum",
    sourceTitle: "Arbitrum Foundation — token distribution",
    sourceUrl: "https://docs.arbitrum.foundation/airdrop-eligibility-distribution",
    notes:
      "Team/advisors (26.94%) and investors (17.53%) vest over 4 years: 1-year cliff from TGE (16 Mar 2023), then monthly until 16 Mar 2027. DAO treasury tokens are released only by governance votes and are not modelled.",
    tranches: [
      {
        category: "Team & advisors",
        cliff: { date: "2024-03-16", tokens: 673_500_000 },
        linear: { start: "2024-03-16", end: "2027-03-16", tokens: 2_020_500_000 },
      },
      {
        category: "Investors",
        cliff: { date: "2024-03-16", tokens: 438_250_000 },
        linear: { start: "2024-03-16", end: "2027-03-16", tokens: 1_314_750_000 },
      },
    ],
  },
  {
    tokenId: "ethena",
    sourceTitle: "Ethena docs — ENA tokenomics",
    sourceUrl: "https://docs.ethena.fi/ena/tokenomics",
    notes:
      "Core contributors (30%) and investors (25%): 25% unlocked after a 1-year cliff (2 Apr 2025), the rest monthly over 3 years. Foundation and ecosystem allocations are discretionary and not modelled.",
    tranches: [
      {
        category: "Core contributors",
        cliff: { date: "2025-04-02", tokens: 1_125_000_000 },
        linear: { start: "2025-04-02", end: "2028-04-02", tokens: 3_375_000_000 },
      },
      {
        category: "Investors",
        cliff: { date: "2025-04-02", tokens: 937_500_000 },
        linear: { start: "2025-04-02", end: "2028-04-02", tokens: 2_812_500_000 },
      },
    ],
  },
  {
    tokenId: "uniswap",
    sourceTitle: "Uniswap Labs — Introducing UNI",
    sourceUrl: "https://blog.uniswap.org/uni",
    notes:
      "Team, investors and advisors vested over 4 years from Sep 2020; vesting completed in Sep 2024. UNI has a perpetual 2% annual inflation option that governance has not activated.",
    tranches: [
      {
        category: "Team, investors & advisors",
        linear: { start: "2020-09-17", end: "2024-09-17", tokens: 400_000_000 },
      },
    ],
  },
  {
    tokenId: "aave",
    sourceTitle: "Aave docs — Aavenomics",
    sourceUrl: "https://aave.com/docs/aave-governance",
    notes:
      "No team/investor vesting: 13M AAVE were minted for the LEND migration and 3M sit in the governance-controlled Ecosystem Reserve.",
    tranches: [],
  },
  {
    tokenId: "lido-dao",
    sourceTitle: "Lido — LDO token distribution",
    sourceUrl: "https://blog.lido.fi/introducing-ldo/",
    notes:
      "Investor, team, early-contributor and validator allocations had a 1-year lock and 1-year linear vesting that completed in Dec 2022 (approximate dates).",
    tranches: [
      {
        category: "Investors, team & contributors",
        linear: { start: "2021-12-17", end: "2022-12-17", tokens: 636_800_000 },
      },
    ],
  },
];

export function createSeedUnlocks(
  schedules: readonly VestingSchedule[] = SEED_SCHEDULES,
): UnlockDataSource {
  const byId = new Map(schedules.map((s) => [s.tokenId, s]));
  return {
    getSchedule: async (tokenId) => byId.get(tokenId) ?? null,
  };
}
