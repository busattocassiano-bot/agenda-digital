const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

// 1. Zoom logic
// Add imports
code = code.replace(/RefreshCw, Filter,/, 'RefreshCw, Filter, ZoomIn, ZoomOut,');
// Add state
code = code.replace(/const \[view, setView\] = useState\('tabela'\);/, 'const [view, setView] = useState(\'tabela\');\n  const [zoomLevel, setZoomLevel] = useState(1);');
// Change height
code = code.replace(/height: '60px',/g, 'height: `${60 * zoomLevel}px`,');

// 2. Fix the header to add title, add zoom buttons, and add aniversariantes fallback!
const oldHeader = `              {/* Header and Controls */}
        <div className="flex-between" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                {aniversariantes.length > 0 && (
                    <div style={{
                        background: '#f2f5ed',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        minWidth: '360px',
                        maxHeight: '240px',
                        overflowY: 'auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border-color)'
                    }}>
                       <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                           Aniversariantes
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           {aniversariantes.map((a, i) => (
                               <div key={i} style={{ fontSize: '1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                   <strong style={{ background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>{a.dia.toString().padStart(2, '0')}</strong> 
                                   <span>{a.nome.split(' ')[0]}</span>
                               </div>
                           ))}
                       </div>
                    </div>
                )}
            </div>`;

const newHeader = `              {/* Header and Controls */}
        <div className="flex-between" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', marginTop: 0 }}>Agenda</h1>
                </div>
                {aniversariantes.length > 0 ? (
                    <div style={{
                        background: '#f2f5ed',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        minWidth: '360px',
                        maxHeight: '240px',
                        overflowY: 'auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border-color)'
                    }}>
                       <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                           Aniversariantes
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           {aniversariantes.map((a, i) => (
                               <div key={i} style={{ fontSize: '1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                   <strong style={{ background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>{a.dia.toString().padStart(2, '0')}</strong> 
                                   <span>{a.nome.split(' ')[0]}</span>
                               </div>
                           ))}
                       </div>
                    </div>
                ) : (
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        minWidth: '280px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed var(--border-color)'
                    }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Nenhum aniversariante neste mês.</p>
                    </div>
                )}
            </div>`;

code = code.replace(oldHeader, newHeader);

// 3. Zoom buttons replacement
const oldButtons = `<button onClick={() => {
                setDataInicio(format(currentDate, 'yyyy-MM-dd'));
                setAgendamentoModalOpen(true);
              }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Plus size={18} /></button>
              <button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>`;

const newButtons = `<button onClick={() => {
                setDataInicio(format(currentDate, 'yyyy-MM-dd'));
                setAgendamentoModalOpen(true);
              }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Plus size={18} /></button>
              <button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>
              <div style={{ display: 'flex', background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer' }} title="Diminuir Zoom"><ZoomOut size={18} /></button>
                <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }} title="Aumentar Zoom"><ZoomIn size={18} /></button>
              </div>`;

code = code.replace(oldButtons, newButtons);

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('all patched');
