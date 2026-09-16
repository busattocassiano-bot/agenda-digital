import React from 'react';
import { Search, FileSpreadsheet, Printer, Calendar as CalendarIcon, ChevronDown, RefreshCw } from 'lucide-react';

export default function AlunosExperimentais() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* Header & Buttons */}
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Alunos experimentais</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FileSpreadsheet size={18} /> Exportar aulas
            </button>
            <button style={{ background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Printer size={18} /> Salvar e Imprimir
            </button>
            <button style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'flex-end' }}>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data início</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
               <div style={{ background: '#cbd5e1', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <CalendarIcon size={18} />
               </div>
               <input type="text" defaultValue="01/07/2026" style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)' }} />
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data final</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
               <div style={{ background: '#cbd5e1', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <CalendarIcon size={18} />
               </div>
               <input type="text" defaultValue="31/07/2026" style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)' }} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Cliente:</label>
            <div style={{ position: 'relative' }}>
              <select style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer' }}>
                <option></option>
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ paddingBottom: '0' }}>
            <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 32px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', height: '42px' }}>
              <Search size={18} /> Buscar
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div style={{ background: '#fef08a', color: '#854d0e', padding: '16px 20px', borderRadius: '8px', fontSize: '0.95rem' }}>
          <strong style={{ fontWeight: 700 }}>Atenção!</strong> <span style={{ fontWeight: 500 }}>Nenhum registro foi encontrado.</span>
        </div>

      </div>

    </div>
  );
}
