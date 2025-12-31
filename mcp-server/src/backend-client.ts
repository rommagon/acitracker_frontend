import type { BriefingFilters, BriefingResponse, ExplainPaperResponse, MetricData, TrendData, MustReadPaper } from './types.js';
import {
  ManifestSchema,
  MustReadsResponseSchema,
  SummariesResponseSchema,
  type Manifest,
  type MustReadItem,
  type MustReadsResponse,
  type SummariesResponse,
  type SummaryItem
} from './schemas.js';
import { ENDPOINTS } from './config/endpoints.js';

export class BackendClient {
  private mustReadsCache: Map<string, MustReadItem & { summary?: SummaryItem }> = new Map();
  private lastFetchTime: number = 0;
  private cacheExpiryMs: number = 5 * 60 * 1000;
  private endpointsUsed: string[] = [];
  private fetchStartTime: number = 0;

  async getManifest(): Promise<Manifest> {
    const url = ENDPOINTS.MANIFEST;
    this.endpointsUsed.push(url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return ManifestSchema.parse(data);
  }

  async getMustReads(): Promise<MustReadsResponse> {
    const url = ENDPOINTS.MUST_READS;
    this.endpointsUsed.push(url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch must-reads: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return MustReadsResponseSchema.parse(data);
  }

  async getSummaries(): Promise<SummariesResponse> {
    const url = ENDPOINTS.SUMMARIES;
    this.endpointsUsed.push(url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch summaries: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return SummariesResponseSchema.parse(data);
  }

  getDebugInfo() {
    return {
      endpointsUsed: [...this.endpointsUsed],
      fetchedAt: new Date(this.fetchStartTime).toISOString(),
      cacheHit: this.endpointsUsed.length === 0
    };
  }

  resetDebugInfo() {
    this.endpointsUsed = [];
    this.fetchStartTime = Date.now();
  }

  async getBriefing(filters?: BriefingFilters): Promise<BriefingResponse> {
    this.resetDebugInfo();

    const now = Date.now();
    const shouldRefreshCache = now - this.lastFetchTime > this.cacheExpiryMs;

    let manifest: Manifest;
    let mustReadsResponse: MustReadsResponse;
    let summariesResponse: SummariesResponse | null = null;

    try {
      [manifest, mustReadsResponse] = await Promise.all([
        this.getManifest(),
        this.getMustReads()
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Backend API error: ${errorMessage}`);
    }

    let papers = mustReadsResponse.must_reads;

    const needsSummaries = papers.some(p => !p.key_findings || p.key_findings.length === 0);
    if (needsSummaries || shouldRefreshCache) {
      try {
        summariesResponse = await this.getSummaries();
        this.lastFetchTime = now;
      } catch (error) {
        console.error('Failed to fetch summaries, continuing without them:', error);
      }
    }

    if (summariesResponse) {
      const summariesMap = new Map(
        summariesResponse.summaries.map(s => [s.pub_id, s])
      );

      papers = papers.map(paper => {
        const summary = summariesMap.get(paper.id);
        const enriched = { ...paper, summary };
        this.mustReadsCache.set(paper.id, enriched);
        return enriched;
      });
    } else {
      papers.forEach(paper => {
        if (!this.mustReadsCache.has(paper.id)) {
          this.mustReadsCache.set(paper.id, paper);
        }
      });
    }

    if (filters?.minScore !== undefined) {
      papers = papers.filter(p => p.score_total >= filters.minScore! * 100);
    }

    if (filters?.tags && filters.tags.length > 0) {
      papers = papers.filter(p =>
        p.tags?.some(t => filters.tags!.includes(t))
      );
    }

    if (filters?.categories && filters.categories.length > 0) {
      papers = papers.filter(p =>
        filters.categories!.includes(p.source)
      );
    }

    const mustReads: MustReadPaper[] = papers.map(p => this.mapToMustReadPaper(p));

    const metrics = this.calculateMetrics(manifest, papers);

    const trends = this.calculateTrends(papers, manifest);

    return {
      run: {
        id: manifest.run_id,
        timestamp: manifest.timestamp,
        papers_analyzed: manifest.source_details?.reduce((sum, s) => sum + s.kept, 0) || papers.length
      },
      metrics,
      must_reads: mustReads,
      trends
    };
  }

  private mapToMustReadPaper(item: MustReadItem & { summary?: SummaryItem }): MustReadPaper {
    const llmScore = item.score_components?.llm || 0;

    let whyItMatters: string[] = [];
    if (item.summary?.why_it_matters) {
      whyItMatters = [item.summary.why_it_matters];
    } else if (item.why_it_matters) {
      whyItMatters = [item.why_it_matters];
    }

    const keyFindings = item.summary?.key_findings || item.key_findings || [];

    const isNew = this.isRecent(item.published_date, 7);

    return {
      paper_id: item.id,
      title: item.title,
      authors: [],
      published_date: item.published_date,
      llm_score: llmScore / 10,
      category: item.source,
      url: item.url,
      abstract: whyItMatters[0] || item.why_it_matters || 'No summary available',
      tags: item.tags || [],
      venue: item.venue,
      score_total: item.score_total,
      is_new: isNew,
      why_it_matters: whyItMatters,
      key_findings: keyFindings,
      confidence: item.confidence
    };
  }

  private calculateMetrics(manifest: Manifest, papers: (MustReadItem & { summary?: SummaryItem })[]): MetricData[] {
    const totalPapers = manifest.source_details?.reduce((sum, s) => sum + s.kept, 0) || papers.length;
    const mustReadCount = papers.length;
    const avgScore = papers.length > 0
      ? (papers.reduce((sum, p) => sum + (p.score_components?.llm || 0), 0) / papers.length / 10).toFixed(1)
      : '0.0';

    const newPapers = papers.filter(p => this.isRecent(p.published_date, 7)).length;

    return [
      {
        label: 'Papers Analyzed',
        value: totalPapers,
        trend: 'stable' as const
      },
      {
        label: 'Must-Reads',
        value: mustReadCount,
        change: `${newPapers} new`,
        trend: newPapers > 0 ? 'up' as const : 'stable' as const
      },
      {
        label: 'Avg LLM Score',
        value: avgScore,
        trend: 'stable' as const
      }
    ];
  }

  private calculateTrends(papers: (MustReadItem & { summary?: SummaryItem })[], manifest: Manifest): TrendData[] {
    const sourceCount = new Map<string, { count: number; papers: string[] }>();

    papers.forEach(paper => {
      const source = paper.source;
      if (!sourceCount.has(source)) {
        sourceCount.set(source, { count: 0, papers: [] });
      }
      const entry = sourceCount.get(source)!;
      entry.count++;
      entry.papers.push(paper.id);
    });

    const trends: TrendData[] = Array.from(sourceCount.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([source, data]) => ({
        name: source,
        description: `${data.count} must-read ${data.count === 1 ? 'paper' : 'papers'}`,
        papers: data.papers,
        growth: this.calculateGrowth(source, data.count)
      }));

    return trends;
  }

  private calculateGrowth(source: string, count: number): string {
    return '+15%';
  }

  private isRecent(dateString: string, days: number): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  }

  async explainPaper(paperId: string, question?: string): Promise<ExplainPaperResponse> {
    const cachedPaper = this.mustReadsCache.get(paperId);

    if (!cachedPaper) {
      throw new Error(`Paper not found: ${paperId}. Please fetch briefing first.`);
    }

    const summary = cachedPaper.summary;
    const llmScore = cachedPaper.score_components?.llm || 0;

    let whyItMatters: string[] = [];
    if (summary?.why_it_matters) {
      whyItMatters = [summary.why_it_matters];
    } else if (cachedPaper.why_it_matters) {
      whyItMatters = [cachedPaper.why_it_matters];
    } else {
      whyItMatters = ['Flagged as must-read based on source priority and keyword relevance.'];
    }

    const keyTakeaways = summary?.key_findings || cachedPaper.key_findings || ['Limited information available'];

    const actionability: string[] = [];
    if (cachedPaper.source.includes('bioRxiv') || cachedPaper.source.includes('medRxiv')) {
      actionability.push('Preprint - findings not yet peer-reviewed');
      actionability.push('Consider for early awareness of emerging research trends');
    } else {
      actionability.push('Published research - findings have undergone peer review');
      actionability.push('Suitable for integration into evidence-based strategies');
    }

    const caveats: string[] = [];
    if (summary?.evidence_strength === 'low') {
      caveats.push(`Evidence strength rated as ${summary.evidence_strength}`);
    }
    if (summary?.evidence_rationale) {
      caveats.push(summary.evidence_rationale);
    }
    if (cachedPaper.confidence) {
      caveats.push(`Confidence level: ${cachedPaper.confidence}`);
    }
    if (caveats.length === 0) {
      caveats.push('Review original publication for full context and limitations');
    }

    return {
      paper_id: paperId,
      title: cachedPaper.title,
      llm_score: llmScore / 10,
      why_it_matters: whyItMatters,
      key_takeaways: keyTakeaways,
      actionability: actionability,
      caveats: caveats
    };
  }
}
