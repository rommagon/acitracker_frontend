import React, { useState } from 'react';

interface AskAciTrackProps {
  onSend: (prompt: string) => void;
  theme?: 'light' | 'dark';
}

export function AskAciTrack({ onSend, theme = 'light' }: AskAciTrackProps) {
  const [input, setInput] = useState('');
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AciTrack anything..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            backgroundColor: isDark ? '#111827' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: input.trim() ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'),
            color: input.trim() ? '#ffffff' : (isDark ? '#6b7280' : '#9ca3af'),
            fontSize: '14px',
            fontWeight: 500,
            cursor: input.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          Ask
        </button>
      </div>
    </form>
  );
}
