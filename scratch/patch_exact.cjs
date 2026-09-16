const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const t1 = `                {aniversariantes.length > 0 && (`;
const r1 = `                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', marginTop: 0 }}>Agenda</h1>
                </div>
                {aniversariantes.length > 0 ? (`;
code = code.replace(t1, r1);

const t2 = `                       </div>
                    </div>
                )}
            </div>`;
const r2 = `                       </div>
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
code = code.replace(t2, r2);

const t3 = `RefreshCw, Filter, `;
const r3 = `RefreshCw, Filter, ZoomIn, ZoomOut, `;
code = code.replace(t3, r3);

const t4 = `const [view, setView] = useState('tabela');`;
const r4 = `const [view, setView] = useState('tabela');
  const [zoomLevel, setZoomLevel] = useState(1);`;
code = code.replace(t4, r4);

code = code.replace(/height: '60px',/g, 'height: `${60 * zoomLevel}px`,');

const t5 = `<button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>
              </div>`;
const r5 = `<button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>
                <div style={{ display: 'flex', background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginLeft: '8px' }}>
                  <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer' }} title="Diminuir Zoom"><ZoomOut size={18} /></button>
                  <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }} title="Aumentar Zoom"><ZoomIn size={18} /></button>
                </div>
              </div>`;
code = code.replace(t5, r5);

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('patched exactly');
