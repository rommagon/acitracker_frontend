# AciTrack UI Component

React UI component for ChatGPT integration using OpenAI Apps SDK.

## Quick Start

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

The output will be in the `dist/` directory.

## Local Development

For local testing without ChatGPT, create a mock OpenAI global in your browser console:

```javascript
window.openai = {
  toolOutput: null,
  widgetState: { savedIds: [], readIds: [] },
  theme: 'light',
  callTool: async (name, args) => {
    console.log('callTool', name, args);
    // Simulate API response
    if (name === 'get_briefing') {
      setTimeout(() => {
        window.postMessage({
          type: 'toolOutput',
          output: {
            run: { id: '1', timestamp: new Date().toISOString(), papers_analyzed: 100 },
            metrics: [
              { label: 'Papers Analyzed', value: 100, trend: 'up' },
              { label: 'Must-Reads', value: 10, trend: 'stable' }
            ],
            must_reads: [
              {
                paper_id: '1',
                title: 'Example Paper',
                authors: ['Author 1', 'Author 2'],
                published_date: new Date().toISOString(),
                llm_score: 9.2,
                category: 'AI',
                url: 'https://example.com',
                abstract: 'This is an example abstract...',
                tags: ['machine-learning', 'nlp']
              }
            ],
            trends: [
              {
                name: 'Machine Learning',
                description: '50 papers in this category',
                papers: ['1', '2', '3'],
                growth: '+15%'
              }
            ]
          }
        }, '*');
      }, 500);
    }
  },
  setWidgetState: async (state) => {
    console.log('setWidgetState', state);
    window.openai.widgetState = { ...window.openai.widgetState, ...state };
  },
  openExternal: ({ href }) => {
    console.log('openExternal', href);
    window.open(href, '_blank');
  },
  sendFollowUpMessage: ({ prompt }) => {
    console.log('sendFollowUpMessage', prompt);
  }
};
```

## Component Architecture

### Main App

The `App.tsx` component is the root component that:
- Uses `useOpenAiGlobal` hook for state management
- Renders appropriate views based on tool output
- Handles all user interactions

### Views

- **BriefingView**: Shows the main briefing with metrics, papers, and trends
- **ExplainPaperView**: Shows detailed paper explanation

### Components

- **MetricTile**: Individual metric card
- **MustReadCard**: Paper card with interactive buttons
- **TrendCard**: Trend information display
- **AskAciTrack**: Question input component
- **LoadingState**: Loading indicator
- **ErrorState**: Error display

### Hooks

- **useOpenAiGlobal**: Manages OpenAI SDK integration

## State Management

### Tool Output

Tool output is managed by OpenAI and passed via `window.openai.toolOutput`. The UI automatically updates when new tool output is received.

### Widget State

Persistent state stored in `window.openai.widgetState`:

```typescript
{
  savedIds: string[];  // Papers saved by user
  readIds: string[];   // Papers marked as read
}
```

This state is kept minimal to reduce overhead.

### Theme

The UI responds to `window.openai.theme` ('light' | 'dark') and updates all components accordingly.

## Styling

All styling is inline using React's `style` prop for:
- Zero dependencies
- Theme responsiveness
- Easy customization
- No build-time CSS processing

## Actions

### Explain Paper

```typescript
await callTool('explain_paper', { paper_id: 'paper-123' });
```

### Save/Read Paper

```typescript
await updateWidgetState({
  savedIds: [...savedIds, paperId]
});
```

### Open Paper

```typescript
openExternal(paper.url);
```

### Ask Follow-up

```typescript
sendFollowUpMessage('Tell me more about this trend');
```

## Error Handling

All components include:
- Loading states during async operations
- Error boundaries for graceful failures
- Retry mechanisms where appropriate

## Performance

- Minimal re-renders using React best practices
- Efficient state updates
- Small bundle size
- No heavy dependencies

## Browser Support

- Modern browsers with ES2020 support
- Chrome, Firefox, Safari, Edge (latest versions)
