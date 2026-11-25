import type { McpServer } from '@modelcontextprotocol/server';

export function registerResources(
  server: McpServer,
  docs: { scoring: string; formulas: string },
) {
  server.registerResource(
    'methodology_scoring',
    'methodology://scoring',
    {
      title: 'Yield scoring methodology',
      description: 'How find_yields risk-adjusted scores are computed',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'text/markdown', text: docs.scoring }],
    }),
  );

  server.registerResource(
    'methodology_formulas',
    'methodology://formulas',
    {
      title: 'Analyst formulas',
      description: 'Pendle, looping, and funding formulas used by tools',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'text/markdown', text: docs.formulas }],
    }),
  );
}