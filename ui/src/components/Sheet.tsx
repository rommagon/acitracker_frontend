import React, { useEffect, useState } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export function Sheet({ open, onClose, children, theme = 'light' }: SheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open && !isAnimating) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          opacity: open ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '450px',
          maxWidth: '90vw',
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.2)',
          zIndex: 51,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Close button */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: isDark ? '#9ca3af' : '#6b7280',
              padding: '4px 8px',
              lineHeight: 1,
              transition: 'color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = isDark ? '#f9fafb' : '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px'
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
