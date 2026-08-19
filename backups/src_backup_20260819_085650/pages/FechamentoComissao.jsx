import React from 'react';
import { Calendar as CalendarIcon, Calculator, ChevronDown } from 'lucide-react';

export default function FechamentoComissao() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Main Card */}
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 24px 0', color: '#1e293b' }}>Fechamento de Comissões</h2>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data fechamento</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
               <div style={{ background: '#cbd5e1', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <CalendarIcon size={18} />
               </div>
               <input type="text" defaultValue="01/07/2026" style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} />
            </div>
          </div>

          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Profissional:</label>
            <div style={{ position: 'relative' }}>
              <select style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
                <option>Todos</option>
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ paddingBottom: '2px' }}>
            <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 32px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', height: '42px' }}>
              <Calculator size={18} /> Calcular
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
