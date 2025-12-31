# AciTrack OpenAI Apps SDK Integration

This project provides an OpenAI ChatGPT integration for AciTrack, consisting of:

1. **MCP Server** - Model Context Protocol server with tools for fetching briefings and explaining papers
2. **React UI** - ChatGPT-embeddable UI component using OpenAI Apps SDK

## Project Structure

```
acitracker_frontend/
├── mcp-server/          # MCP server implementation
│   ├── src/
│   │   ├── index.ts     # Main server entry point
│   │   ├── backend-client.ts  # Backend API client
│   │   └── types.ts     # TypeScript types
│   ├── package.json
│   └── tsconfig.json
└── ui/                  # React UI component
    ├── src/
    │   ├── components/  # UI components
    │   ├── hooks/       # Custom React hooks
    │   ├── types/       # TypeScript types
    │   ├── App.tsx      # Main app component
    │   └── main.tsx     # Entry point
    ├── package.json
    └── vite.config.ts
```

## MCP Server

### Installation

```bash
cd mcp-server
npm install
npm run build
```

### Configuration

Set the backend URL environment variable:

```bash
export ACITRACK_BACKEND_URL=http://localhost:8000
```

### Running

```bash
npm start
```

### Available Tools

#### get_briefing

Returns the latest AciTrack briefing with metrics, must-read papers, and trends.

**Parameters:**
- `since_days` (optional, number): Number of days to look back (default: 7)
- `filters` (optional, object):
  - `categories` (array): Filter by categories
  - `minScore` (number): Minimum LLM score (0-10)
  - `tags` (array): Filter by tags

**Response:**
```json
{
  "run": {
    "id": "string",
    "timestamp": "ISO date",
    "papers_analyzed": number
  },
  "metrics": [
    {
      "label": "string",
      "value": number | string,
      "trend": "up" | "down" | "stable"
    }
  ],
  "must_reads": [
    {
      "paper_id": "string",
      "title": "string",
      "authors": ["string"],
      "published_date": "ISO date",
      "llm_score": number,
      "category": "string",
      "url": "string",
      "abstract": "string",
      "tags": ["string"]
    }
  ],
  "trends": [
    {
      "name": "string",
      "description": "string",
      "papers": ["paper_id"],
      "growth": "string"
    }
  ]
}
```

#### explain_paper

Get detailed explanation of a specific paper.

**Parameters:**
- `paper_id` (required, string): The ID of the paper
- `question` (optional, string): Specific question about the paper

**Response:**
```json
{
  "paper_id": "string",
  "title": "string",
  "llm_score": number,
  "why_it_matters": ["string"],
  "key_takeaways": ["string"],
  "actionability": ["string"],
  "caveats": ["string"]
}
```

## React UI

### Installation

```bash
cd ui
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Features

#### Components

- **BriefingView**: Main view showing metrics, must-read papers, and trends
- **MetricTile**: Individual metric display
- **MustReadCard**: Paper card with actions (Explain, Save, Read, Open)
- **TrendCard**: Trend information display
- **ExplainPaperView**: Detailed paper explanation
- **AskAciTrack**: Input for follow-up questions
- **LoadingState**: Loading indicator
- **ErrorState**: Error display with retry

#### Hooks

- **useOpenAiGlobal**: Custom hook for OpenAI Apps SDK integration
  - Manages toolOutput, widgetState, theme
  - Provides callTool, updateWidgetState, openExternal, sendFollowUpMessage
  - Handles loading and error states

#### Widget State

The UI maintains minimal widget state:

```typescript
{
  savedIds: string[];  // Paper IDs marked as saved
  readIds: string[];   // Paper IDs marked as read
}
```

#### OpenAI Integration

The app uses `window.openai` globals:

- `window.openai.toolOutput` - Current tool output (parsed JSON)
- `window.openai.widgetState` - Persistent widget state
- `window.openai.theme` - Current theme ('light' | 'dark')
- `window.openai.callTool(name, args)` - Call MCP tools
- `window.openai.setWidgetState(state)` - Update widget state
- `window.openai.openExternal({ href })` - Open external links
- `window.openai.sendFollowUpMessage({ prompt })` - Send follow-up questions

#### Actions

1. **Explain** - Calls `explain_paper` tool with paper ID
2. **Save/Read** - Toggles paper in widget state
3. **Open** - Opens paper URL in new tab via `openExternal`
4. **Ask AciTrack** - Sends follow-up message to ChatGPT

## Backend Requirements

The MCP server expects the backend to provide:

### GET /api/runs/latest

Query parameters:
- `since_days` (optional): Number of days to look back

Response:
```json
{
  "run_id": "string",
  "timestamp": "ISO date",
  "papers": [
    {
      "id": "string",
      "title": "string",
      "authors": ["string"],
      "published_date": "ISO date",
      "llm_score": number,
      "category": "string",
      "url": "string",
      "abstract": "string",
      "tags": ["string"]
    }
  ]
}
```

### GET /api/papers/:id

Response:
```json
{
  "id": "string",
  "title": "string",
  "llm_score": number,
  "why_it_matters": ["string"],
  "key_takeaways": ["string"],
  "actionability": ["string"],
  "caveats": ["string"]
}
```

## Deployment

### MCP Server

The MCP server can be registered with ChatGPT by providing the execution command:

```bash
node /path/to/mcp-server/dist/index.js
```

### React UI

Build the UI and host the static files:

```bash
cd ui
npm run build
```

The `dist/` folder contains the built static files that can be hosted anywhere.

## Development Tips

1. **Testing locally**: Run the MCP server and UI dev server separately
2. **Mock OpenAI globals**: For local testing, create a mock `window.openai` object
3. **Theme support**: The UI automatically adapts to light/dark themes
4. **Widget state**: Keep state minimal to reduce message passing overhead
5. **Error handling**: All components include error boundaries and loading states

## License

MIT
