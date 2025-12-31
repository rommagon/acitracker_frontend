import type { TrendData } from '../types';

interface TrendCardProps {
  trend: TrendData;
  theme?: 'light' | 'dark';
}

export function TrendCard({ trend, theme = 'light' }: TrendCardProps) {
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        marginBottom: '8px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isDark ? '#f9fafb' : '#111827',
            margin: 0
          }}
        >
          {trend.name}
        </h4>
        <span
          style={{
            fontSize: '12px',
            color: '#10b981',
            fontWeight: 500
          }}
        >
          {trend.growth}
        </span>
      </div>
      <p
        style={{
          fontSize: '12px',
          color: isDark ? '#9ca3af' : '#6b7280',
          margin: 0
        }}
      >
        {trend.description}
      </p>
    </div>
  );
}
