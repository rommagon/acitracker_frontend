export interface MetricData {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface MustReadPaper {
  paper_id: string;
  title: string;
  authors: string[];
  published_date: string;
  llm_score: number;
  category: string;
  url: string;
  abstract: string;
  tags?: string[];
  venue?: string;
  score_total?: number;
  is_new?: boolean;
  why_it_matters?: string[];
  key_findings?: string[];
  confidence?: string;
}

export interface TrendData {
  name: string;
  description: string;
  papers: string[];
  growth: string;
}

export interface BriefingData {
  run: {
    id: string;
    timestamp: string;
    papers_analyzed: number;
  };
  metrics: MetricData[];
  must_reads: MustReadPaper[];
  trends: TrendData[];
}

export interface ExplainPaperData {
  paper_id: string;
  title: string;
  llm_score: number;
  why_it_matters: string[];
  key_takeaways: string[];
  actionability: string[];
  caveats: string[];
}

export interface WidgetState {
  savedPaperIds: string[];
  readPaperIds: string[];
}

export interface OpenAIGlobals {
  toolOutput?: any;
  widgetState?: WidgetState;
  theme?: 'light' | 'dark';
  callTool: (toolName: string, args: any) => Promise<void>;
  setWidgetState: (state: Partial<WidgetState>) => Promise<void>;
  openExternal: (options: { href: string }) => void;
  sendFollowUpMessage: (options: { prompt: string }) => void;
}

declare global {
  interface Window {
    openai?: OpenAIGlobals;
  }
}
