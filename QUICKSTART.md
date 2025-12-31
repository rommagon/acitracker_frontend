# AciTrack Quick Start Guide

Get up and running with AciTrack ChatGPT integration in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Access to your acitracker-backend (or mock data for testing)

## 1. Install Dependencies

```bash
./dev.sh
# Choose option 1: Install all dependencies
```

Or manually:

```bash
cd mcp-server && npm install
cd ../ui && npm install
```

## 2. Configure Backend

Set your backend URL:

```bash
export ACITRACK_BACKEND_URL=http://localhost:8000
```

Or for production:

```bash
export ACITRACK_BACKEND_URL=https://your-backend.com
```

## 3. Build Projects

```bash
./dev.sh
# Choose option 2: Build all projects
```

Or manually:

```bash
cd mcp-server && npm run build
cd ../ui && npm run build
```

## 4. Test MCP Server

Start the MCP server:

```bash
cd mcp-server && npm start
```

Send a test request via stdin:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

You should see the available tools (get_briefing, explain_paper).

## 5. Test UI Locally

Start the dev server:

```bash
cd ui && npm run dev
```

Visit http://localhost:3000

Add this to your browser console to test with mock data:

```javascript
window.openai = {
  toolOutput: {
    run: { id: '1', timestamp: new Date().toISOString(), papers_analyzed: 100 },
    metrics: [
      { label: 'Papers Analyzed', value: 100, trend: 'up' },
      { label: 'Must-Reads', value: 10, trend: 'stable' },
      { label: 'Avg Score', value: '8.5', trend: 'up' }
    ],
    must_reads: [
      {
        paper_id: '1',
        title: 'Advances in Large Language Model Reasoning',
        authors: ['Alice Johnson', 'Bob Smith'],
        published_date: '2025-12-15',
        llm_score: 9.2,
        category: 'NLP',
        url: 'https://arxiv.org/abs/example',
        abstract: 'We present a novel approach to improving reasoning...',
        tags: ['reasoning', 'llm']
      }
    ],
    trends: [
      { name: 'NLP', description: '50 papers', papers: ['1'], growth: '+20%' }
    ]
  },
  widgetState: { savedIds: [], readIds: [] },
  theme: 'light',
  callTool: async (name, args) => console.log('Tool:', name, args),
  setWidgetState: async (state) => {
    window.openai.widgetState = { ...window.openai.widgetState, ...state };
  },
  openExternal: ({ href }) => window.open(href, '_blank'),
  sendFollowUpMessage: ({ prompt }) => console.log('Question:', prompt)
};
window.dispatchEvent(new Event('message'));
```

## 6. Deploy to ChatGPT

### Deploy MCP Server

1. Build the server:
   ```bash
   cd mcp-server && npm run build
   ```

2. Note the absolute path to `dist/index.js`

3. Register with ChatGPT (refer to OpenAI documentation for your specific deployment method)

### Deploy UI

1. Build the UI:
   ```bash
   cd ui && npm run build
   ```

2. Deploy the `ui/dist/` folder to your hosting service:
   - **Vercel**: `cd ui && vercel deploy`
   - **Netlify**: Drag `ui/dist/` to Netlify dashboard
   - **AWS S3**: `aws s3 sync ui/dist/ s3://your-bucket/`

3. Configure ChatGPT to load your deployed UI URL

## Common Commands

### Development

```bash
# Start MCP server in dev mode (auto-rebuild)
./dev.sh # Option 3

# Start UI in dev mode (hot reload)
./dev.sh # Option 4

# Or manually
cd mcp-server && npm run dev
cd ui && npm run dev
```

### Production

```bash
# Build everything
./dev.sh # Option 2

# Start MCP server
./dev.sh # Option 5

# Or manually
cd mcp-server && npm run build && npm start
cd ui && npm run build
```

### Cleanup

```bash
# Remove all build artifacts and dependencies
./dev.sh # Option 7
```

## Testing the Integration

### 1. Test MCP Tools

Using stdin:

```bash
cd mcp-server && npm start
```

```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_briefing","arguments":{"since_days":7}}}
```

### 2. Test UI Actions

Open UI and test:
- ✓ Metrics display correctly
- ✓ Papers load and render
- ✓ "Explain" button calls explain_paper tool
- ✓ "Save" button updates widget state
- ✓ "Read" button updates widget state
- ✓ "Open" button opens paper URL
- ✓ "Ask AciTrack" sends follow-up message
- ✓ Theme switches between light/dark

## Project Structure

```
acitracker_frontend/
├── mcp-server/          # MCP server (stdio protocol)
│   ├── src/
│   │   ├── index.ts           # Main server
│   │   ├── backend-client.ts  # Backend API client
│   │   └── types.ts           # TypeScript types
│   └── dist/            # Built output
│
├── ui/                  # React UI (ChatGPT iframe)
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # useOpenAiGlobal hook
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main app
│   │   └── main.tsx           # Entry point
│   └── dist/            # Built output
│
├── README.md            # Main documentation
├── SETUP.md            # Detailed setup instructions
├── QUICKSTART.md       # This file
├── ARCHITECTURE.md     # Architecture documentation
└── dev.sh              # Development helper script
```

## MCP Tools Reference

### get_briefing

Get the latest briefing with metrics, papers, and trends.

```json
{
  "name": "get_briefing",
  "arguments": {
    "since_days": 7,
    "filters": {
      "categories": ["NLP", "Computer Vision"],
      "minScore": 8.0,
      "tags": ["transformers"]
    }
  }
}
```

### explain_paper

Get detailed explanation of a paper.

```json
{
  "name": "explain_paper",
  "arguments": {
    "paper_id": "paper_001",
    "question": "How does this compare to existing methods?"
  }
}
```

## Troubleshooting

### MCP Server won't start

- Check Node version: `node -v` (should be 18+)
- Rebuild: `cd mcp-server && npm run build`
- Check backend URL is set: `echo $ACITRACK_BACKEND_URL`

### Backend connection fails

- Verify backend is running
- Check URL is correct
- Test with curl: `curl $ACITRACK_BACKEND_URL/api/runs/latest`

### UI not loading

- Check build succeeded: `ls ui/dist/`
- Verify hosting service deployed correctly
- Check browser console for errors

### OpenAI globals not working

- Ensure running in ChatGPT iframe context
- For local testing, use mock globals (see above)
- Check `window.openai` is defined

## Next Steps

1. ✓ Complete initial setup
2. ✓ Test MCP tools locally
3. ✓ Test UI with mock data
4. ⏩ **Integrate with your acitracker-backend**
5. Deploy to ChatGPT
6. Test full integration
7. Customize UI styling/features

## Getting Help

- **Main docs**: See [README.md](README.md)
- **Setup details**: See [SETUP.md](SETUP.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **UI docs**: See [ui/README.md](ui/README.md)
- **MCP docs**: See [mcp-server/README.md](mcp-server/README.md)

## Example Backend Response

See `mcp-server/example-backend-response.json` for the expected format.

Your backend should provide:
- `GET /api/runs/latest?since_days=N` - Returns run manifest with papers
- `GET /api/papers/:id` - Returns detailed paper information

## Happy Coding!

You're all set! The AciTrack ChatGPT integration should now be working.

Key features:
- ✓ MCP server with 2 tools (get_briefing, explain_paper)
- ✓ React UI with OpenAI Apps SDK integration
- ✓ Full briefing view with metrics, papers, and trends
- ✓ Paper explanation view
- ✓ Save/Read tracking via widget state
- ✓ Follow-up questions via Ask AciTrack
- ✓ Light/dark theme support
- ✓ Loading and error states
- ✓ Optimized for ChatGPT iframe

Enjoy building with AciTrack!
