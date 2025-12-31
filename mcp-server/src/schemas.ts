import { z } from 'zod';

export const ManifestSchema = z.object({
  run_id: z.string(),
  timestamp: z.string(),
  since_date: z.string(),
  active_sources: z.array(z.string()),
  source_details: z.array(z.object({
    name: z.string(),
    type: z.string(),
    kept: z.number(),
  })).optional(),
});

export const MustReadItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  published_date: z.string(),
  source: z.string(),
  venue: z.string().optional(),
  url: z.string(),
  score_total: z.number(),
  score_components: z.object({
    heuristic: z.number(),
    llm: z.number(),
  }).optional(),
  why_it_matters: z.string().optional(),
  key_findings: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  confidence: z.string().optional(),
});

export const MustReadsResponseSchema = z.object({
  must_reads: z.array(MustReadItemSchema),
});

export const SummaryItemSchema = z.object({
  pub_id: z.string(),
  title: z.string(),
  source: z.string(),
  venue: z.string().optional(),
  published_date: z.string(),
  url: z.string(),
  why_it_matters: z.string().optional(),
  key_findings: z.array(z.string()).optional(),
  study_type: z.string().optional(),
  evidence_strength: z.string().optional(),
  evidence_rationale: z.string().optional(),
});

export const SummariesResponseSchema = z.object({
  generated_at: z.string(),
  summary_version: z.string(),
  total_count: z.number(),
  summaries: z.array(SummaryItemSchema),
});

export type Manifest = z.infer<typeof ManifestSchema>;
export type MustReadItem = z.infer<typeof MustReadItemSchema>;
export type MustReadsResponse = z.infer<typeof MustReadsResponseSchema>;
export type SummaryItem = z.infer<typeof SummaryItemSchema>;
export type SummariesResponse = z.infer<typeof SummariesResponseSchema>;
