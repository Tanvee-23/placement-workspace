import React, { useEffect, useMemo, useRef, useState } from 'react';
import { validateRoleName, normalizeRoleName } from '../../data/roles';

/**
 * Searchable dropdown (combobox) with an "Add custom role" option.
 * Controlled, reusable component: all data comes in through props.
 */
export default function RoleSelect({ value, builtInRoles, customRoles, onChange, onAddCustom, onRemoveCustom, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const customNames = customRoles.map((r) => r.name);

  const items = useMemo(() => {
    const q = normalizeRoleName(query);
    const lower = q.toLowerCase();
    const all = [
      ...builtInRoles.map((name) => ({ name, custom: false })),
      ...customNames.map((name) => ({ name, custom: true }))
    ];
    const filtered = all.filter((o) => o.name.toLowerCase().includes(lower));
    const exact = all.find((o) => o.name.toLowerCase() === lower);
    const nameError = q && !exact ? validateRoleName(q) : '';
    const list = [...filtered];
    if (q && !exact && !nameError) list.push({ name: q, add: true });
    return { list, nameError, q };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, builtInRoles, customRoles]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(0);
  };

  const choose = (item) => {
    if (item.add) onAddCustom(item.name);
    else onChange(item.name);
    close();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items.list[active]) choose(items.list[active]);
    } else if (e.key === 'Escape') {
      close();
    }
  };

  const borderColor = error ? 'var(--coral)' : open ? 'var(--violet)' : 'var(--line)';

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${borderColor}`,
          background: 'var(--paper-2)', color: value ? 'var(--ink)' : 'var(--muted)', fontSize: 13.5,
          fontFamily: 'inherit', textAlign: 'left', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', cursor: 'pointer'
        }}
      >
        <span>{value || 'Select or type a target role...'}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
            background: 'var(--paper-3)', border: '1px solid var(--violet)', borderRadius: 12,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search a role, or type your own..."
            maxLength={40}
            style={{
              width: '100%', padding: '11px 14px', border: 'none', borderBottom: '1px solid var(--line)',
              background: 'transparent', color: 'var(--ink)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none'
            }}
          />

          <ul role="listbox" style={{ listStyle: 'none', margin: 0, padding: 6, maxHeight: 240, overflowY: 'auto' }}>
            {items.list.map((item, idx) => {
              const isActive = idx === active;
              const isSelected = item.name === value && !item.add;
              return (
                <li
                  key={`${item.add ? 'add' : 'opt'}-${item.name}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => choose(item)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                    padding: '9px 10px', borderRadius: 8, fontSize: 13.5, cursor: 'pointer',
                    background: isActive ? 'var(--violet-soft)' : 'transparent',
                    color: item.add ? 'var(--mint)' : 'var(--ink)', fontWeight: item.add || isSelected ? 700 : 500
                  }}
                >
                  <span>
                    {item.add ? `＋ Add “${item.name}” as custom role` : item.name}
                    {item.custom && (
                      <span className="mono" style={{ marginLeft: 8, fontSize: 10, color: 'var(--violet)' }}>CUSTOM</span>
                    )}
                    {isSelected && <span style={{ marginLeft: 8, color: 'var(--mint)' }}>✓</span>}
                  </span>
                  {item.custom && (
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => { e.stopPropagation(); onRemoveCustom(item.name); }}
                      style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  )}
                </li>
              );
            })}

            {items.list.length === 0 && (
              <li style={{ padding: '10px', fontSize: 13, color: items.nameError ? 'var(--coral)' : 'var(--muted)' }}>
                {items.nameError || 'No roles found.'}
              </li>
            )}
            {items.list.length > 0 && items.nameError && (
              <li style={{ padding: '8px 10px', fontSize: 12, color: 'var(--coral)' }}>{items.nameError}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}