import { useState, useEffect, useRef } from 'react';

const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function PacienteAutocomplete({ pacientes, value, onChange, placeholder = 'Digite o nome do paciente...' }) {
  const selected = pacientes.find(p => p.id === value);
  const [query, setQuery] = useState(selected?.nome || '');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => { setQuery(selected?.nome || ''); }, [value, selected?.nome]);

  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const q = normalize(query.trim());
  const results = q
    ? pacientes
        .filter(p => normalize(p.nome).includes(q))
        .sort((a, b) => {
          const sa = normalize(a.nome).startsWith(q) ? 0 : 1;
          const sb = normalize(b.nome).startsWith(q) ? 0 : 1;
          return sa - sb || (a.nome || '').localeCompare(b.nome || '');
        })
        .slice(0, 10)
    : [];

  const pick = (p) => { onChange(p.id); setQuery(p.nome); setOpen(false); };

  const onKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(results[highlight]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); if (value) onChange(''); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
      />
      {open && q && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.12)', zIndex: 50, maxHeight: '260px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum paciente encontrado</div>
          ) : results.map((p, i) => (
            <div
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); pick(p); }}
              onMouseEnter={() => setHighlight(i)}
              style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '0.9rem', background: i === highlight ? '#f1f5f9' : 'white' }}
            >
              {p.nome}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
