const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const r = `</div>
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

code = code.replace(/<\/div>\r?\n\s*<\/div>\r?\n\s*\)\}\r?\n\s*<\/div>/, r);
fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('patched');
