# AciTrack MCP Server

MCP server for AciTrack integration with ChatGPT.

## Installation

```bash
npm install
npm run build
```

## Configuration

Set the backend URL:

```bash
export ACITRACK_BACKEND_URL=http://localhost:8000
```

## Usage

Start the server:

```bash
npm start
```

## Tools

### get_briefing

Returns the latest briefing with metrics, must-read papers, and trends.

Parameters:
- `since_days` (optional): Number of days to look back (default: 7)
- `filters` (optional): Object with:
  - `categories`: Array of category strings
  - `minScore`: Minimum LLM score (0-10)
  - `tags`: Array of tag strings

### explain_paper

Get detailed explanation of a specific paper.

Parameters:
- `paper_id` (required): The ID of the paper
- `question` (optional): Specific question about the paper
