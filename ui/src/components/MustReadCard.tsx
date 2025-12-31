import React, { useState } from 'react';
import type { MustReadPaper } from '../types';

interface MustReadCardProps {
  paper: MustReadPaper;
  rank: number;
  isSaved: boolean;
  isRead: boolean;
  theme?: 'light' | 'dark';
  onExplain: (paperId: string) => void;
  onToggleSave: (paperId: string) => void;
  onToggleRead: (paperId: string) => void;
  onOpen: (url: string) => void;
}

export function MustReadCard({
  paper,
  rank,
  isSaved,
  isRead,
  theme = 'light',
  onExplain,
  onToggleSave,
  onToggleRead,
  onOpen
}: MustReadCardProps) {
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getScoreBanding = (score?: number) => {
    if (score === undefined || score === null || isNaN(score)) {
      return {
        label: '—',
        band: 'neutral',
        color: isDark ? '#6b7280' : '#6b7280',
        bgColor: isDark ? '#374151' : '#f3f4f6'
      };
    }

    // Score is 0-10, convert to 0-100 for banding
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

  const scoreBanding = getScoreBanding(paper.llm_score);

  // Get summary text (use abstract as fallback)
  const summaryText = paper.abstract || 'No summary available.';
  const needsExpand = summaryText.length > 150;

  // Get why it matters bullets (max 2)
  const whyItMatters = paper.why_it_matters?.slice(0, 2) || [];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '14px',
        borderRadius: '8px',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        marginBottom: '8px',
        transition: 'all 0.15s ease-in-out',
        boxShadow: isHovered
          ? isDark
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          : 'none',
        transform: isHovered ? 'translateY(-1px)' : 'none'
      }}
    >
      {/* A) Header row: Rank + Title + Score chip */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
        {/* Rank pill */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: isDark ? '#374151' : '#f3f4f6',
            color: isDark ? '#9ca3af' : '#6b7280',
            flexShrink: 0
          }}
        >
          #{rank}
        </span>

        {/* NEW badge */}
        {paper.is_new && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 7px',
              borderRadius: '4px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              flexShrink: 0,
              letterSpacing: '0.5px'
            }}
          >
            NEW
          </span>
        )}

        {/* Title (clickable) */}
        <h3
          onClick={() => onOpen(paper.url)}
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: isDark ? '#f9fafb' : '#111827',
            lineHeight: '1.4',
            margin: 0,
            flex: 1,
            cursor: 'pointer',
            textDecoration: isHovered ? 'underline' : 'none',
            transition: 'text-decoration 0.15s'
          }}
        >
          {paper.title}
        </h3>

        {/* Score chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: scoreBanding.bgColor,
            color: scoreBanding.color,
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <span>{scoreBanding.label}</span>
          {scoreBanding.band !== 'neutral' && (
            <span style={{ fontSize: '10px', opacity: 0.8 }}>• {scoreBanding.band}</span>
          )}
        </div>
      </div>

      {/* B) Metadata row */}
      <div
        style={{
          fontSize: '12px',
          color: isDark ? '#9ca3af' : '#6b7280',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap'
        }}
      >
        <span>{paper.category}</span>
        <span>•</span>
        <span>{new Date(paper.published_date).toLocaleDateString()}</span>

        {/* Tags (max 4 + overflow) */}
        {paper.tags && paper.tags.length > 0 && (
          <>
            {paper.tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontWeight: 500
                }}
              >
                {tag}
              </span>
            ))}
            {paper.tags.length > 4 && (
              <span
                style={{
                  fontSize: '11px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontWeight: 500
                }}
              >
                +{paper.tags.length - 4}
              </span>
            )}
          </>
        )}
      </div>

      {/* C) Summary (clamped) */}
      <div style={{ marginBottom: '10px' }}>
        <div
          style={{
            fontSize: '13px',
            color: isDark ? '#d1d5db' : '#374151',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: isExpanded ? 'visible' : 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {summaryText}
        </div>
        {needsExpand && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              fontSize: '12px',
              color: isDark ? '#60a5fa' : '#3b82f6',
              background: 'none',
              border: 'none',
              padding: '4px 0',
              cursor: 'pointer',
              fontWeight: 500,
              marginTop: '4px'
            }}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>

      {/* D) Why it matters (optional, max 2 bullets) */}
      {whyItMatters.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: isDark ? '#9ca3af' : '#6b7280',
              marginBottom: '4px'
            }}
          >
            Why it matters:
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: '18px',
              fontSize: '12px',
              color: isDark ? '#d1d5db' : '#374151',
              lineHeight: '1.5'
            }}
          >
            {whyItMatters.map((item, i) => (
              <li key={i} style={{ marginBottom: '2px' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* E) Actions row */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          onClick={() => onExplain(paper.paper_id)}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          Explain
        </button>

        <button
          onClick={() => onToggleSave(paper.paper_id)}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            backgroundColor: 'transparent',
            color: isDark ? '#f9fafb' : '#374151',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span>{isSaved ? '★' : '☆'}</span>
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          onClick={() => onToggleRead(paper.paper_id)}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            backgroundColor: 'transparent',
            color: isDark ? '#f9fafb' : '#374151',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span>{isRead ? '✓' : ''}</span>
          <span>{isRead ? 'Read' : 'Mark Read'}</span>
        </button>

        <button
          onClick={() => onOpen(paper.url)}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            backgroundColor: 'transparent',
            color: isDark ? '#f9fafb' : '#374151',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Open →
        </button>
      </div>
    </div>
  );
}
