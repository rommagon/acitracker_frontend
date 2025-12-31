#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import express from 'express';
import { z } from 'zod';
import { BackendClient } from './backend-client.js';
import type { BriefingRequest, ExplainPaperRequest } from './types.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ExplainPaperRequestSchema = z.object({
  paper_id: z.string().min(1),
  question: z.string().optional()
});

const server = new Server(
  {
    name: 'acitrack-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const backendClient = new BackendClient();

const tools: Tool[] = [
  {
    name: 'get_briefing',
    description: 'Get the latest AciTrack briefing with metrics, must-read papers, and trends',
    inputSchema: {
      type: 'object',
      properties: {
        since_days: {
          type: 'number',
          description: 'Number of days to look back (default: 7)',
          default: 7
        },
        filters: {
          type: 'object',
          description: 'Filters to apply to papers',
          properties: {
            categories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by categories'
            },
            minScore: {
              type: 'number',
              description: 'Minimum LLM score (0-10)'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tags'
            }
          }
        }
      }
    }
  },
  {
    name: 'explain_paper',
    description: 'Get detailed explanation of a specific paper including why it matters, key takeaways, actionability, and caveats',
    inputSchema: {
      type: 'object',
      properties: {
        paper_id: {
          type: 'string',
          description: 'The ID of the paper to explain'
        },
        question: {
          type: 'string',
          description: 'Optional specific question about the paper'
        }
      },
      required: ['paper_id']
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_briefing') {
      const { filters } = args as BriefingRequest;

      const briefing = await backendClient.getBriefing(filters);

      const debugInfo = backendClient.getDebugInfo();

      console.error('Briefing fetched successfully:', {
        run_id: briefing.run.id,
        must_reads_count: briefing.must_reads.length,
        metrics_count: briefing.metrics.length,
        debug: debugInfo
      });

      const isDebugMode = process.env.ACITRACK_DEBUG === '1';
      const response = isDebugMode
        ? { ...briefing, debug: debugInfo }
        : briefing;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }
        ],
        isError: false
      };
    }

    if (name === 'explain_paper') {
      const parsed = ExplainPaperRequestSchema.safeParse(args);

      if (!parsed.success) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                type: 'acitrack.error.v1',
                error: `Invalid explain_paper request: ${parsed.error.message}`,
                tool: name
              }, null, 2)
            }
          ],
          isError: true
        };
      }

      const { paper_id, question } = parsed.data as ExplainPaperRequest;

      const explanation = await backendClient.explainPaper(paper_id, question);

      console.error('Paper explained successfully:', paper_id);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(explanation, null, 2)
          }
        ],
        isError: false
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Tool execution error:', errorMessage);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'acitrack.error.v1',
            error: errorMessage,
            tool: name
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

async function startHttpServer() {
  const PORT = process.env.PORT || 3000;

  // Create Express app with MCP support (includes DNS rebinding protection for localhost)
  const app = createMcpExpressApp({ host: '0.0.0.0' });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.send('AciTrack MCP Server is running');
  });

  // Serve UI static files
  const uiDistPath = path.join(__dirname, '../../ui/dist');
  app.use('/ui', express.static(uiDistPath));

  // Serve briefing.html as skybridge template
  app.get('/ui/briefing.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html+skybridge');
    res.sendFile(path.join(uiDistPath, 'index.html'));
  });

  // Store active SSE transports by session ID
  const transports = new Map<string, SSEServerTransport>();

  // SSE endpoint for MCP communication
  app.get('/sse', async (req, res) => {
    // Create a new transport for this session
    const transport = new SSEServerTransport('/message', res);

    console.error(`SSE session started: ${transport.sessionId}`);

    // Set up close handler
    transport.onclose = () => {
      transports.delete(transport.sessionId);
      console.error(`SSE session closed: ${transport.sessionId}`);
    };

    // Store transport before connecting
    transports.set(transport.sessionId, transport);

    // Connect to server (this calls transport.start() internally)
    await server.connect(transport);

    console.error(`SSE session ready: ${transport.sessionId}`);
  });

  // POST endpoint for MCP messages
  // IMPORTANT: Do NOT use express.json() or any body parser here
  // The SSE transport needs to read the raw request stream
  app.post('/message', async (req, res) => {
    try {
      // Accept sessionId from either header (preferred) or query parameter
      const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);
      const contentType = req.headers['content-type'] as string;

      console.error(`/message request - sessionId: ${sessionId}, content-type: ${contentType}`);

      if (!sessionId) {
        res.status(400).json({ ok: false, error: 'Missing sessionId (provide via x-session-id header or ?sessionId=... query parameter)' });
        return;
      }

      const transport = transports.get(sessionId);

      if (!transport) {
        console.error(`/message error - session not found: ${sessionId}`);
        res.status(404).json({ ok: false, error: 'Session not found' });
        return;
      }

      // Let the SSE transport handle the raw request/response
      await transport.handlePostMessage(req, res);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      console.error(`/message error:`, errorMsg);
      console.error(`Stack:`, errorStack);

      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: errorMsg });
      }
    }
  });

  // Start the server
  app.listen(PORT, () => {
    console.error(`AciTrack MCP Server listening on port ${PORT}`);
    console.error(`Health check: http://localhost:${PORT}/health`);
    console.error(`UI: http://localhost:${PORT}/ui/`);
    console.error(`MCP SSE endpoint: http://localhost:${PORT}/sse`);
  });
}

async function startStdioServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AciTrack MCP Server running on stdio');
}

async function main() {
  const transportMode = process.env.MCP_TRANSPORT || 'stdio';

  if (transportMode === 'http' || transportMode === 'sse') {
    await startHttpServer();
  } else {
    await startStdioServer();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
