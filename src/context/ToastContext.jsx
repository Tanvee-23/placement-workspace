import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// Context API: any component can call useToast() without prop drilling.
const ToastContext = createContext(null);

const TYPE_STYLES = {
  success: { icon: '✓', color: 'var(--mint)', bg: 'rgba(52, 211, 153, 0.14)' },
  error: { icon: '⚠', color: 'var(--coral)', bg: 'rgba(255, 122, 107, 0.14)' },
  info: { icon: 'ℹ', color: 'var(--violet)', bg: 'rgba(124, 110, 240, 0.16)' }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', duration = 4500) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // keep at most 3 on screen
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    show,
    dismiss,
    success: (msg, ms) => show(msg, 'success', ms),
    error: (msg, ms) => show(msg, 'error', ms),
    info: (msg, ms) => show(msg, 'info', ms)
  }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}
      >
        {toasts.map((t) => {
          const s = TYPE_STYLES[t.type] || TYPE_STYLES.info;
          return (
            <div
              key={t.id}
              role="status"
              style={{
                display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12,
                background: 'var(--paper-3)', border: `1px solid ${s.color}`, boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
                fontSize: 13.5, lineHeight: 1.45, color: 'var(--ink)'
              }}
            >
              <span style={{ background: s.bg, color: s.color, width: 22, height: 22, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {s.icon}
              </span>
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}