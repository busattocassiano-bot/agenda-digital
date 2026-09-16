const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const t5 = /<button style=\{\{\s*background:\s*'#f1f5f9',\s*color:\s*'var\(--text-main\)',\s*border:\s*'none',\s*borderRadius:\s*'8px',\s*padding:\s*'8px',\s*cursor:\s*'pointer'\s*\}\}><RefreshCw size=\{18\} \/><\/button>\r?\n\s*<\/div>/;

const r5 = `<button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>
                <div style={{ display: 'flex', background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginLeft: '8px' }}>
                  <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer' }} title="Diminuir Zoom"><ZoomOut size={18} /></button>
                  <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }} title="Aumentar Zoom"><ZoomIn size={18} /></button>
                </div>
              </div>`;

code = code.replace(t5, r5);
fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('zoom buttons added');
