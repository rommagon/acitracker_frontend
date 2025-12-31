#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { BackendClient } from './backend-client.js';
import type { BriefingRequest, ExplainPaperRequest } from './types.js';

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AciTrack MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
