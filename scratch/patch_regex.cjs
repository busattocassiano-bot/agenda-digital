const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

// 1. Zoom Logic
if (!code.includes('ZoomIn, ZoomOut')) {
    code = code.replace(/RefreshCw, Filter,/, 'RefreshCw, Filter, ZoomIn, ZoomOut,');
}
if (!code.includes('zoomLevel')) {
    code = code.replace(/const \[view, setView\] = useState\('tabela'\);/, 'const [view, setView] = useState(\'tabela\');\n  const [zoomLevel, setZoomLevel] = useState(1);');
}
code = code.replace(/height: '60px'/g, 'height: `${60 * zoomLevel}px`');

// 2. Aniversariantes fallback
code = code.replace(
    /\{aniversariantes\.length > 0 && \(\s*([\s\S]*?)\s*\)\}\s*<\/div>/,
    `{aniversariantes.length > 0 ? (
                    $1
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
            </div>`
);

// 3. Add Agenda title
if (!code.includes('Agenda</h1>')) {
    code = code.replace(
        /\{aniversariantes\.length > 0 \? \(/,
        `<div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', marginTop: 0 }}>Agenda</h1>
                </div>
                {aniversariantes.length > 0 ? (`
    );
}

// 4. Zoom buttons
const zoomBtns = `
              <div style={{ display: 'flex', background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginLeft: '8px' }}>
                <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer' }} title="Diminuir Zoom"><ZoomOut size={18} /></button>
                <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }} title="Aumentar Zoom"><ZoomIn size={18} /></button>
              </div>`;

if (!code.includes('ZoomOut size={18}')) {
    code = code.replace(
        /<button style=\{\{ background: '#f1f5f9', color: 'var\(--text-main\)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' \}\}>\s*<RefreshCw size=\{18\} \/>\s*<\/button>/,
        `$&` + zoomBtns
    );
}

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('regex patch done');
