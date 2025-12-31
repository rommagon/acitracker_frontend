export const BACKEND_BASE_URL = process.env.ACITRACK_BACKEND_URL || 'https://acitracker-backend.onrender.com';

export const HEALTH_PATH = '/health';
export const MANIFEST_PATH = '/manifest';
export const MUST_READS_PATH = '/api/must-reads';
export const SUMMARIES_PATH = '/api/summaries';

export function getEndpointUrl(path: string): string {
  return `${BACKEND_BASE_URL}${path}`;
}

export const ENDPOINTS = {
  HEALTH: getEndpointUrl(HEALTH_PATH),
  MANIFEST: getEndpointUrl(MANIFEST_PATH),
  MUST_READS: getEndpointUrl(MUST_READS_PATH),
  SUMMARIES: getEndpointUrl(SUMMARIES_PATH),
} as const;
