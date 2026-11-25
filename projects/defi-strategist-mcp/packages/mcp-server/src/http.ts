import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/server';
import {
  localhostHostValidation,
  localhostOriginValidation,
  NodeStreamableHTTPServerTransport,
} from '@modelcontextprotocol/node';
import { createMcpServer } from './server.js';

const port = Number(process.env.PORT ?? 8787);
const validateHost = localhostHostValidation();
const validateOrigin = localhostOriginValidation();

createServer(async (req, res) => {
  if (!validateHost(req, res) || !validateOrigin(req, res)) return;
  const server: McpServer = createMcpServer();
  const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res);
}).listen(port, '127.0.0.1', () => {
  console.error(`defi-strategist-mcp HTTP listening on http://127.0.0.1:${port}/mcp`);
});