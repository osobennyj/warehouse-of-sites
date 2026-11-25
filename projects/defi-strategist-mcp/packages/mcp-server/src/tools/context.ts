import type { FundingSource, PendleSource, YieldSource } from '@defi-strategist/core';

export interface CoreSources {
  yields: YieldSource;
  pendle: PendleSource;
  funding: FundingSource;
}