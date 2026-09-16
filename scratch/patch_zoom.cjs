const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

// Add imports
code = code.replace(/RefreshCw, Filter,/, 'RefreshCw, Filter, ZoomIn, ZoomOut,');

// Add state
code = code.replace(/const \[view, setView\] = useState\('tabela'\);/, 'const [view, setView] = useState(\'tabela\');\n  const [zoomLevel, setZoomLevel] = useState(1);');

// Change height
code = code.replace(/height: '60px',/g, 'height: `${60 * zoomLevel}px`,');

// Add buttons
const target = `<button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>`;

const zoomButtons = `<button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>
                <div style={{ display: 'flex', background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer' }} title="Diminuir Zoom"><ZoomOut size={18} /></button>
                  <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }} title="Aumentar Zoom"><ZoomIn size={18} /></button>
                </div>`;

code = code.replace(target, zoomButtons);

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('patched');
