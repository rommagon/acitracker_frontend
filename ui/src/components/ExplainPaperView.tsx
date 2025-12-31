import type { ExplainPaperData } from '../types';

interface ExplainPaperViewProps {
  data: ExplainPaperData | null;
  theme?: 'light' | 'dark';
  isLoading?: boolean;
}

export function ExplainPaperView({ data, theme = 'light', isLoading = false }: ExplainPaperViewProps) {
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div>
        {/* Skeleton loading state */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              height: '24px',
              width: '70%',
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              borderRadius: '4px',
              marginBottom: '8px'
            }}
          />
          <div
            style={{
              height: '20px',
              width: '100px',
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              borderRadius: '4px'
            }}
          />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div
              style={{
                height: '16px',
                width: '40%',
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                borderRadius: '4px',
                marginBottom: '8px'
              }}
            />
            <div
              style={{
                height: '14px',
                width: '100%',
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                borderRadius: '4px',
                marginBottom: '4px'
              }}
            />
            <div
              style={{
                height: '14px',
                width: '90%',
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                borderRadius: '4px'
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
          No explanation available.
        </p>
      </div>
    );
  }

  const getScoreBanding = (score: number) => {
    const normalized = score * 10;
    if (normalized >= 90) {
      return {
        label: score.toFixed(1),
        band: 'Top',
        color: isDark ? '#10b981' : '#059669',
        bgColor: isDark ? '#064e3b' : '#d1fae5'
      };
    } else if (normalized >= 75) {
      return {
        label: score.toFixed(1),
        band: 'High',
        color: isDark ? '#f59e0b' : '#d97706',
        bgColor: isDark ? '#78350f' : '#fef3c7'
      };
    } else {
      return {
        label: score.toFixed(1),
        band: 'Med',
        color: isDark ? '#6b7280' : '#6b7280',
        bgColor: isDark ? '#374151' : '#f3f4f6'
      };
    }
  };

  const scoreBanding = getScoreBanding(data.llm_score);

  const Section = ({ title, items }: { title: string; items: string[] }) => (
    <div style={{ marginBottom: '24px' }}>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: isDark ? '#f9fafb' : '#111827',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {title}
      </h3>
      <ul
        style={{
          margin: 0,
          paddingLeft: '20px',
          color: isDark ? '#d1d5db' : '#374151',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
      >
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: isDark ? '#f9fafb' : '#111827',
            marginBottom: '12px',
            lineHeight: '1.3'
          }}
        >
          {data.title}
        </h2>

        {/* Score chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: scoreBanding.bgColor,
            color: scoreBanding.color
          }}
        >
          <span>{scoreBanding.label}</span>
          <span style={{ fontSize: '10px', opacity: 0.8 }}>• {scoreBanding.band}</span>
        </div>
      </div>

      <Section title="Why It Matters" items={data.why_it_matters} />
      <Section title="Key Takeaways" items={data.key_takeaways} />
      <Section title="Actionability" items={data.actionability} />
      <Section title="Caveats" items={data.caveats} />
    </div>
  );
}
