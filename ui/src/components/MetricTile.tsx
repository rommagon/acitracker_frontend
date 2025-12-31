import React from 'react';
import type { MetricData } from '../types';

interface MetricTileProps {
  metric: MetricData;
  theme?: 'light' | 'dark';
}

export function MetricTile({ metric, theme = 'light' }: MetricTileProps) {
  const isDark = theme === 'dark';

  const trendIcon = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→';
  const trendColor = metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#6b7280';

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        minWidth: '150px'
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: isDark ? '#9ca3af' : '#6b7280',
          marginBottom: '4px',
          fontWeight: 500
        }}
      >
        {metric.label}
      </div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: isDark ? '#f9fafb' : '#111827',
          marginBottom: '4px'
        }}
      >
        {metric.value}
      </div>
      {metric.trend && (
        <div
          style={{
            fontSize: '14px',
            color: trendColor,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>{trendIcon}</span>
          {metric.change && <span>{metric.change}</span>}
        </div>
      )}
    </div>
  );
}
