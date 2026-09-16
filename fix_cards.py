import re

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r"<td \n                          key=\{dayIdx\} \n                          style=\{\{ \n                            borderRight: '1px solid var\(--border-color\)', \n                            borderBottom: '1px solid var\(--border-color\)', \n                            height: '60px',\n                            background: isSameDay\(day, new Date\(\)\) \? '#f8fafc' : 'white',\n                            cursor: feriado \? 'not-allowed' : 'pointer',\n                            verticalAlign: 'top',\n                            padding: '4px'\n                          \}\}\n                          onClick=\{\(\) => handleOpenSlot\(day, time\)\}\n                        >\n                          \{\!feriado && slotAgendamentos\.map\(a => \{\n                              const srv = servicos\.find\(s => s\.id === a\.servicoId\);\n                              const baseColor = srv\?\.cor \|\| '#0ea5e9';\n                              \n                              return \(\n                              <div key=\{a\.id\} \n                                  onClick=\{\(e\) => handleEventClick\(e, a\)\}\n                                  style=\{\{\n                                      background: baseColor \+ '20',\n                                      borderLeft: `4px solid \$\{baseColor\}`,\n                                      borderRadius: '4px',\n                                      padding: '6px',\n                                      marginBottom: '4px',\n                                      fontSize: '0\.75rem',\n                                      textAlign: 'left',\n                                      cursor: 'pointer',\n                                      boxShadow: '0 1px 2px rgba\(0,0,0,0\.05\)',\n                                      color: '#1e293b'\n                                  \}\}\n                              >",
    re.DOTALL
)

new_code = """<td 
                          key={dayIdx} 
                          style={{ 
                            borderRight: '1px solid var(--border-color)', 
                            borderBottom: '1px solid var(--border-color)', 
                            height: '60px',
                            background: isSameDay(day, new Date()) ? '#f8fafc' : 'white',
                            cursor: feriado ? 'not-allowed' : 'pointer',
                            verticalAlign: 'top',
                            padding: '4px',
                            position: 'relative'
                          }}
                          onClick={() => handleOpenSlot(day, time)}
                        >
                          {!feriado && slotAgendamentos.map(a => {
                              const srv = servicos.find(s => s.id === a.servicoId);
                              const baseColor = srv?.cor || '#0ea5e9';
                              
                              // Calculate duration and top offset
                              const [h, m] = (a.hora || '00:00').split(':').map(Number);
                              const topOffset = m;
                              
                              let endH = h + 1;
                              let endM = m;
                              if (a.horaFim) {
                                const parts = a.horaFim.split(':').map(Number);
                                endH = parts[0];
                                endM = parts[1];
                              }
                              const durationMins = (endH * 60 + endM) - (h * 60 + m);
                              
                              return (
                              <div key={a.id} 
                                  onClick={(e) => handleEventClick(e, a)}
                                  style={{
                                      position: 'absolute',
                                      top: `${topOffset}px`,
                                      left: '4px',
                                      right: '4px',
                                      height: `${Math.max(25, durationMins)}px`,
                                      zIndex: 10,
                                      overflow: 'hidden',
                                      background: baseColor + '20',
                                      borderLeft: `4px solid ${baseColor}`,
                                      borderRadius: '4px',
                                      padding: '4px 6px',
                                      fontSize: '0.75rem',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                      color: '#1e293b'
                                  }}
                              >"""

if pattern.search(content):
    content = pattern.sub(new_code, content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully!")
else:
    print("Pattern not found!")
