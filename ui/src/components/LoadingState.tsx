interface LoadingStateProps {
  theme?: 'light' | 'dark';
}

export function LoadingState({ theme = 'light' }: LoadingStateProps) {
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
          width: '48px',
          height: '48px',
          border: `4px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <p
        style={{
          marginTop: '16px',
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}
      >
        Loading...
      </p>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
