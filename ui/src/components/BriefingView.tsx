import { MetricTile } from './MetricTile';
import { MustReadCard } from './MustReadCard';
import { TrendCard } from './TrendCard';
import type { BriefingData } from '../types';

interface BriefingViewProps {
  data: BriefingData;
  savedIds: string[];
  readIds: string[];
  theme?: 'light' | 'dark';
  onExplain: (paperId: string) => void;
  onToggleSave: (paperId: string) => void;
  onToggleRead: (paperId: string) => void;
  onOpen: (url: string) => void;
}

export function BriefingView({
  data,
  savedIds,
  readIds,
  theme = 'light',
  onExplain,
  onToggleSave,
  onToggleRead,
  onOpen
}: BriefingViewProps) {
  const isDark = theme === 'dark';

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: isDark ? '#f9fafb' : '#111827',
            marginBottom: '4px'
          }}
        >
          AciTrack Briefing
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: 0
          }}
        >
          {new Date(data.run.timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: isDark ? '#f9fafb' : '#111827',
            marginBottom: '12px'
          }}
        >
          Metrics
        </h2>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {data.metrics.map((metric, i) => (
            <MetricTile key={i} metric={metric} theme={theme} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: isDark ? '#111827' : '#ffffff',
            paddingTop: '8px',
            paddingBottom: '12px',
            marginBottom: '8px',
            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            zIndex: 10
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: isDark ? '#f9fafb' : '#111827',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Must-Reads
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}
            >
              {data.must_reads.length}
            </span>
          </h2>
        </div>
        {data.must_reads.map((paper, index) => (
          <MustReadCard
            key={paper.paper_id}
            paper={paper}
            rank={index + 1}
            isSaved={savedIds.includes(paper.paper_id)}
            isRead={readIds.includes(paper.paper_id)}
            theme={theme}
            onExplain={onExplain}
            onToggleSave={onToggleSave}
            onToggleRead={onToggleRead}
            onOpen={onOpen}
          />
        ))}
      </div>

      {data.trends.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: isDark ? '#f9fafb' : '#111827',
              marginBottom: '12px'
            }}
          >
            Trends
          </h2>
          {data.trends.map((trend, i) => (
            <TrendCard key={i} trend={trend} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}
