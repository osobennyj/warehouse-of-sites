import { McpServer } from '@modelcontextprotocol/server';
import {
  DefiLlamaYieldSource,
  HyperliquidFundingSource,
  PendleApiSource,
  METHODOLOGY_FORMULAS,
  METHODOLOGY_SCORING,
} from '@defi-strategist/core';
import { registerTools } from './tools/index';
import { registerPrompts } from './prompts/index';
import { registerResources } from './resources/index';
import type { CoreSources } from './tools/context';

export const SERVER_NAME = 'defi-strategist-mcp';
export const SERVER_VERSION = '0.1.0';

export function buildDefaultSources(): CoreSources {
  return {
    yields: new DefiLlamaYieldSource(),
    pendle: new PendleApiSource(1),
    funding: new HyperliquidFundingSource(),
  };
}

export function createMcpServer(sources: CoreSources = buildDefaultSources()): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {}, resources: {}, prompts: {} } },
  );

  registerTools(server, sources);
  registerResources(server, {
    scoring: METHODOLOGY_SCORING,
    formulas: METHODOLOGY_FORMULAS,
  });
  registerPrompts(server);

  return server;
}