import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r"const slotAgendamentos = agendamentos\.filter.*?const durationMins = \(endH \* 60 \+ endM\) - \(h \* 60 \+ m\);\s*return \(",
    re.DOTALL
)

new_code = """const slotAgendamentos = agendamentos.filter(a => {
                        if (a.data !== format(day, 'yyyy-MM-dd')) return false;
                        if (selectedProfissional && a.profissionalId !== selectedProfissional) return false;
                        if (!a.hora) return false;
                        const [h, m] = a.hora.split(':').map(Number);
                        const aMins = h * 60 + m;
                        const slotMins = time.getHours() * 60 + time.getMinutes();
                        return aMins >= slotMins && aMins < slotMins + interval;
                      });
                      const feriado = isFeriado(day);
  
                      return (
                        <td 
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
                              
                              const [h, m] = (a.hora || '00:00').split(':').map(Number);
                              const aMins = h * 60 + m;
                              const slotMins = time.getHours() * 60 + time.getMinutes();
                              
                              // pixels per minute based on cell height (60px) and interval
                              const pxPerMin = 60 / interval;
                              const topOffset = (aMins - slotMins) * pxPerMin;
                              
                              let endH = h + 1;
                              let endM = m;
                              if (a.horaFim) {
                                const parts = a.horaFim.split(':').map(Number);
                                endH = parts[0];
                                endM = parts[1];
                              }
                              const durationMins = (endH * 60 + endM) - aMins;
                              const calculatedHeight = Math.max(25, durationMins * pxPerMin);
                              
                              return ("""

if not pattern.search(content):
    print("Pattern not found!")
    sys.exit(1)

content = pattern.sub(new_code, content)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced!")
