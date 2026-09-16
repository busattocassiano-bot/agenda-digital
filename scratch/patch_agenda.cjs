const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const t = `        {/* Header and Controls */}
        <div className="flex-between" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                {aniversariantes.length > 0 && (`;
const r = `        {/* Header and Controls */}
        <div className="flex-between" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', marginTop: 0 }}>Agenda</h1>
                </div>
                {aniversariantes.length > 0 ? (`;
code = code.replace(t, r);

const t2 = `                        </div>
                    </div>
                )}
            </div>

          <div style={{ display: 'flex', gap: '8px' }}>`;
const r2 = `                        </div>
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
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum aniversariante neste mês.</p>
                    </div>
                )}
            </div>

          <div style={{ display: 'flex', gap: '8px' }}>`;
code = code.replace(t2, r2);

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
