import React from 'react';

interface ErrorStateProps {
  error: string;
  theme?: 'light' | 'dark';
  onRetry?: () => void;
}

export function ErrorState({ error, theme = 'light', onRetry }: ErrorStateProps) {
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        minHeight: '300px'
      }}
    >
      <div
        style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}
      >
        ⚠️
      </div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: isDark ? '#f9fafb' : '#111827',
          marginBottom: '8px'
        }}
      >
        Something went wrong
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280',
          textAlign: 'center',
          maxWidth: '400px',
          marginBottom: '16px'
        }}
      >
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
