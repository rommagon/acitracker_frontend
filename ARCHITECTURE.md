# AciTrack Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                          ChatGPT                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                 User Interaction                    │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │              MCP Tools Handler                      │    │
│  │  - get_briefing({ since_days, filters })           │    │
│  │  - explain_paper({ paper_id, question })           │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    │ stdio
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      MCP Server                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Tool Implementations                   │    │
│  │  - get_briefing → BackendClient.getLatestManifest  │    │
│  │  - explain_paper → BackendClient.explainPaper      │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────┐    │
│  │             Backend Client                          │    │
│  │  - Fetches from acitracker-backend API             │    │
│  │  - Adapts manifest to briefing format              │    │
│  │  - Structures paper explanations                   │    │
│  └────────────────┬───────────────────────────────────┘    │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    │ HTTP
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  AciTrack Backend                            │
│  - GET /api/runs/latest                                     │
│  - GET /api/papers/:id                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ChatGPT Iframe                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                 React UI App                        │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │      useOpenAiGlobal Hook                │     │    │
│  │  │  - toolOutput (from MCP tools)           │     │    │
│  │  │  - widgetState (saved/read papers)       │     │    │
│  │  │  - theme (light/dark)                    │     │    │
│  │  │  - callTool()                            │     │    │
│  │  │  - setWidgetState()                      │     │    │
│  │  │  - openExternal()                        │     │    │
│  │  │  - sendFollowUpMessage()                 │     │    │
│  │  └────────────┬─────────────────────────────┘     │    │
│  │               │                                    │    │
│  │  ┌────────────▼─────────────────────────────┐    │    │
│  │  │         View Router                      │    │    │
│  │  │  - BriefingView (default)                │    │    │
│  │  │  - ExplainPaperView (on explain)         │    │    │
│  │  └────────────┬─────────────────────────────┘    │    │
│  │               │                                    │    │
│  │  ┌────────────▼─────────────────────────────┐    │    │
│  │  │        UI Components                     │    │    │
│  │  │  - MetricTile                            │    │    │
│  │  │  - MustReadCard                          │    │    │
│  │  │    * Explain → callTool('explain_paper') │    │    │
│  │  │    * Save → setWidgetState(savedIds)     │    │    │
│  │  │    * Read → setWidgetState(readIds)      │    │    │
│  │  │    * Open → openExternal(url)            │    │    │
│  │  │  - TrendCard                             │    │    │
│  │  │  - AskAciTrack                           │    │    │
│  │  │    * Ask → sendFollowUpMessage(prompt)   │    │    │
│  │  │  - LoadingState                          │    │    │
│  │  │  - ErrorState                            │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initial Briefing Load

```
User opens ChatGPT
    ↓
UI App mounts
    ↓
useOpenAiGlobal hook initializes
    ↓
App.tsx useEffect calls callTool('get_briefing', { since_days: 7 })
    ↓
window.openai.callTool sends request to ChatGPT
    ↓
ChatGPT invokes MCP get_briefing tool
    ↓
MCP Server → BackendClient.getLatestManifest()
    ↓
Backend API → Returns run manifest with papers
    ↓
BackendClient.adaptManifestToBriefing() → Structures response
    ↓
MCP Server returns JSON to ChatGPT
    ↓
ChatGPT posts toolOutput to iframe
    ↓
useOpenAiGlobal receives message event
    ↓
toolOutput state updates
    ↓
BriefingView renders with data
```

### 2. Explain Paper Flow

```
User clicks "Explain" button on paper card
    ↓
MustReadCard.onExplain(paper_id)
    ↓
BriefingView.handleExplain(paper_id)
    ↓
useOpenAiGlobal.callTool('explain_paper', { paper_id })
    ↓
window.openai.callTool → ChatGPT
    ↓
ChatGPT invokes MCP explain_paper tool
    ↓
MCP Server → BackendClient.explainPaper(paper_id)
    ↓
Backend API /api/papers/:id → Returns paper details
    ↓
BackendClient structures explanation response
    ↓
MCP Server returns to ChatGPT
    ↓
ChatGPT posts toolOutput
    ↓
useOpenAiGlobal updates toolOutput
    ↓
App detects explanation data (has 'why_it_matters')
    ↓
ExplainPaperView renders
```

### 3. Save/Read Paper Flow

```
User clicks "Save" or "Mark Read" button
    ↓
MustReadCard.onToggleSave(paper_id) or onToggleRead(paper_id)
    ↓
BriefingView.handleToggleSave/Read(paper_id)
    ↓
useOpenAiGlobal.updateWidgetState({ savedIds/readIds })
    ↓
Local state updates immediately (optimistic UI)
    ↓
window.openai.setWidgetState(newState)
    ↓
ChatGPT persists widgetState
    ↓
On next load, widgetState restored from ChatGPT
```

### 4. Follow-up Question Flow

```
User types question in AskAciTrack input
    ↓
User presses "Ask" or hits Enter
    ↓
AskAciTrack.onSend(prompt)
    ↓
BriefingView.handleAsk(prompt)
    ↓
useOpenAiGlobal.sendFollowUpMessage(prompt)
    ↓
window.openai.sendFollowUpMessage({ prompt })
    ↓
ChatGPT receives message in conversation
    ↓
ChatGPT processes with context
    ↓
May invoke MCP tools based on response
    ↓
UI updates with new toolOutput
```

## Component Hierarchy

```
App
├── LoadingState (if isLoading)
├── ErrorState (if error)
├── BriefingView (if toolOutput has 'run' and 'must_reads')
│   ├── MetricTile (for each metric)
│   ├── MustReadCard (for each paper)
│   ├── TrendCard (for each trend)
│   └── AskAciTrack
└── ExplainPaperView (if toolOutput has 'why_it_matters')
    └── AskAciTrack
```

## State Management

### Global State (via OpenAI)

```typescript
window.openai = {
  toolOutput: BriefingData | ExplainPaperData | null,
  widgetState: {
    savedIds: string[],
    readIds: string[]
  },
  theme: 'light' | 'dark'
}
```

### Local State (in useOpenAiGlobal)

```typescript
{
  isLoading: boolean,
  error: string | null
}
```

### Why This Design?

1. **Minimal Widget State**: Only IDs, not full objects
   - Reduces message passing overhead
   - Papers re-fetched on reload (fresh data)

2. **Tool Output Drives UI**: No local data storage
   - Single source of truth
   - Always in sync with backend

3. **Optimistic UI**: State updates immediately
   - Better UX
   - ChatGPT sync happens async

## MCP Server Architecture

### Tool Registration

```typescript
server.setRequestHandler(ListToolsRequestSchema, () => {
  return { tools: [get_briefing_tool, explain_paper_tool] };
});
```

### Tool Execution

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments } = request.params;

  // Route to appropriate handler
  if (name === 'get_briefing') {
    return handleGetBriefing(arguments);
  }

  if (name === 'explain_paper') {
    return handleExplainPaper(arguments);
  }
});
```

### Backend Adapter Pattern

```typescript
class BackendClient {
  // Raw API call
  async getLatestManifest(sinceDays?: number): Promise<RawManifest>

  // Adapt to MCP format
  adaptManifestToBriefing(manifest: RawManifest, filters?: Filters): BriefingData
}
```

This separation allows:
- Backend schema changes don't affect MCP contract
- Easy to add caching/transformation layers
- Clear boundary between systems

## Security Considerations

1. **No secrets in UI**: All sensitive data in backend
2. **CORS**: Backend must allow ChatGPT iframe origin
3. **Input validation**: MCP server validates all inputs
4. **Error handling**: Never expose internal errors to UI
5. **Rate limiting**: Backend should rate limit API calls

## Performance Optimizations

1. **Minimal re-renders**: React.memo where needed
2. **Small bundle**: No heavy dependencies
3. **Efficient updates**: Only update changed state
4. **Lazy loading**: Could add for large paper lists
5. **Debouncing**: Search/filter inputs if added

## Extension Points

### Adding New Tools

1. Define tool schema in MCP server
2. Implement handler in BackendClient
3. Add UI component if needed
4. Update types

### Adding New UI Views

1. Create component in ui/src/components
2. Add type guard in App.tsx
3. Route based on toolOutput shape

### Adding Filters

1. Update BriefingFilters type
2. Add UI controls in BriefingView
3. Pass to get_briefing tool
4. Apply in adaptManifestToBriefing

## Technology Choices

### Why MCP?
- Standard protocol for ChatGPT tools
- Type-safe tool definitions
- Handles stdio communication

### Why React?
- Familiar to most developers
- Good iframe performance
- Easy to build component library

### Why Inline Styles?
- Zero CSS build step
- Theme-aware out of the box
- No naming conflicts
- Easy to customize per component

### Why Vite?
- Fast builds
- Great DX
- Simple config
- Modern defaults

## Future Enhancements

1. **Caching**: Add Redis cache in MCP server
2. **Pagination**: Handle large paper lists
3. **Search**: Add full-text search within briefing
4. **Filters**: More advanced filtering UI
5. **Bookmarks**: Organize saved papers into collections
6. **Export**: Download briefing as PDF/markdown
7. **Notifications**: Alert on new high-score papers
8. **Analytics**: Track which papers get clicked/saved
