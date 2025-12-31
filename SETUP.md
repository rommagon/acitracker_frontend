# AciTrack Setup Guide

Complete setup instructions for the AciTrack OpenAI ChatGPT integration.

## Prerequisites

- Node.js 18+ and npm
- Access to acitracker-backend API
- OpenAI ChatGPT developer access (for deployment)

## Initial Setup

### 1. Install Dependencies

From the root directory:

```bash
npm run install:all
```

Or manually:

```bash
# Install MCP server dependencies
cd mcp-server
npm install

# Install UI dependencies
cd ../ui
npm install
```

### 2. Configure Backend URL

Set the environment variable for your AciTrack backend:

```bash
export ACITRACK_BACKEND_URL=http://localhost:8000
```

Or create a `.env` file in the `mcp-server` directory:

```
ACITRACK_BACKEND_URL=http://localhost:8000
```

### 3. Build Projects

```bash
# Build both projects
npm run build

# Or build individually
npm run build:server
npm run build:ui
```

## Development

### MCP Server

Start the MCP server in development mode:

```bash
npm run dev:server
```

Or:

```bash
cd mcp-server
npm run dev
```

The server will watch for changes and rebuild automatically.

### UI Component

Start the UI development server:

```bash
npm run dev:ui
```

Or:

```bash
cd ui
npm run dev
```

Visit http://localhost:3000 to see the UI.

## Testing Locally

### Testing the MCP Server

You can test MCP tools using the stdio interface:

```bash
cd mcp-server
npm start
```

Then send tool requests via stdin:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_briefing",
    "arguments": {
      "since_days": 7
    }
  }
}
```

### Testing the UI

For local UI testing without ChatGPT:

1. Start the dev server: `cd ui && npm run dev`
2. Open http://localhost:3000
3. Open browser console and add mock OpenAI global:

```javascript
window.openai = {
  toolOutput: {
    run: {
      id: '1',
      timestamp: new Date().toISOString(),
      papers_analyzed: 100
    },
    metrics: [
      { label: 'Papers Analyzed', value: 100, trend: 'up' },
      { label: 'Must-Reads', value: 10, trend: 'stable' },
      { label: 'Avg Score', value: '8.5', trend: 'up' }
    ],
    must_reads: [
      {
        paper_id: '1',
        title: 'Example Paper on Machine Learning',
        authors: ['John Doe', 'Jane Smith'],
        published_date: '2025-12-01',
        llm_score: 9.2,
        category: 'Machine Learning',
        url: 'https://arxiv.org/abs/example',
        abstract: 'This paper presents a novel approach to machine learning...',
        tags: ['deep-learning', 'nlp', 'transformers']
      }
    ],
    trends: [
      {
        name: 'Large Language Models',
        description: '25 papers in this category',
        papers: ['1', '2', '3'],
        growth: '+20%'
      }
    ]
  },
  widgetState: { savedIds: [], readIds: [] },
  theme: 'light',
  callTool: async (name, args) => {
    console.log('Tool called:', name, args);
  },
  setWidgetState: async (state) => {
    console.log('Widget state updated:', state);
    window.openai.widgetState = { ...window.openai.widgetState, ...state };
  },
  openExternal: ({ href }) => {
    window.open(href, '_blank');
  },
  sendFollowUpMessage: ({ prompt }) => {
    console.log('Follow-up:', prompt);
  }
};

// Trigger re-render
window.dispatchEvent(new Event('message'));
```

## Deployment

### Deploying the MCP Server

1. Build the server:
   ```bash
   cd mcp-server
   npm run build
   ```

2. Register with ChatGPT using the built server path:
   ```bash
   node /absolute/path/to/mcp-server/dist/index.js
   ```

3. Configure environment:
   ```bash
   export ACITRACK_BACKEND_URL=https://your-backend.com
   ```

### Deploying the UI

1. Build the UI:
   ```bash
   cd ui
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting service:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting

3. Configure ChatGPT to load your UI URL

## Backend Integration

Ensure your acitracker-backend implements these endpoints:

### GET /api/runs/latest

Returns the latest run manifest with papers.

**Query Parameters:**
- `since_days` (optional): Number of days to look back

**Response:**
```json
{
  "run_id": "string",
  "timestamp": "ISO-8601 date",
  "papers": [
    {
      "id": "string",
      "title": "string",
      "authors": ["string"],
      "published_date": "ISO-8601 date",
      "llm_score": 0-10,
      "category": "string",
      "url": "string",
      "abstract": "string",
      "tags": ["string"]
    }
  ]
}
```

### GET /api/papers/:id

Returns detailed paper information.

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "llm_score": 0-10,
  "why_it_matters": ["string"],
  "key_takeaways": ["string"],
  "actionability": ["string"],
  "caveats": ["string"]
}
```

## Troubleshooting

### MCP Server Issues

**Problem:** Server won't start
- Check Node.js version (18+)
- Verify dependencies installed: `npm install`
- Check build succeeded: `npm run build`

**Problem:** Backend connection fails
- Verify `ACITRACK_BACKEND_URL` is set correctly
- Check backend is running and accessible
- Test backend endpoints with curl

### UI Issues

**Problem:** Build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript version
- Verify all dependencies installed

**Problem:** OpenAI globals not working
- Check you're testing in ChatGPT iframe context
- For local testing, use mock globals (see above)

**Problem:** Theme not updating
- Verify `window.openai.theme` is set
- Check message event listeners are registered

## Environment Variables

### MCP Server

- `ACITRACK_BACKEND_URL` - Backend API base URL (required)

### UI

No environment variables needed. Configuration is handled by OpenAI globals at runtime.

## Next Steps

1. Test MCP tools locally
2. Test UI with mock data
3. Integrate with your acitracker-backend
4. Deploy to ChatGPT
5. Test full integration in ChatGPT

## Support

For issues or questions:
- Check the main README.md
- Review component documentation in ui/README.md
- Check MCP server docs in mcp-server/README.md
