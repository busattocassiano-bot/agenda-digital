import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r"const slotAgendamentos = agendamentos\.filter\(a => a\.data === format\(day, 'yyyy-MM-dd'\) && a\.hora === format\(time, 'HH:mm'\).*?color: '#1e293b'\r?\n\s*\}\}\r?\n\s*>",
    re.DOTALL
)

new_code = """const slotAgendamentos = agendamentos.filter(a => {
                        if (a.data !== format(day, 'yyyy-MM-dd')) return false;
                        if (selectedProfissional && a.profissionalId !== selectedProfissional) return false;
                        if (!a.hora) return false;
                        const [h, m] = a.hora.split(':').map(Number);
                        const aMins = h * 60 + m;
                        const slotMins = time.getHours() * 60 + time.getMinutes();
                        // Get interval from selectedProfissionalData or default 30
                        const interval = selectedProfissionalData?.intervaloAgenda || companyData?.intervaloAgenda || 30;
                        return aMins >= slotMins && aMins < slotMins + interval;
                      });
                      const feriado = isFeriado(day);
                      // Calculate interval to pass to pxPerMin
                      const interval = selectedProfissionalData?.intervaloAgenda || companyData?.intervaloAgenda || 30;
  
                      return (
                        <td 
                          key={dayIdx} 
                          style={{ 
                            borderRight: '1px solid var(--border-color)', 
                            borderBottom: '1px solid var(--border-color)', 
                            height: `${60 * zoomLevel}px`,
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
                              let baseColor = a.tipo === 'bloqueio' ? '#94a3b8' : (srv?.cor || '#0ea5e9');
                              if (a.status === 'Realizado') baseColor = '#22c55e';
                              if (a.status === 'Falta') baseColor = '#ef4444';
                              if (a.status === 'Falta Justificada') baseColor = '#f59e0b';
                              
                              const [h, m] = (a.hora || '00:00').split(':').map(Number);
                              const aMins = h * 60 + m;
                              const slotMins = time.getHours() * 60 + time.getMinutes();
                              
                              const pxPerMin = (60 * zoomLevel) / interval;
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
                              
                              return (
                              <div key={a.id} 
                                  onClick={(e) => handleEventClick(e, a)}
                                  style={{
                                      background: baseColor + '20',
                                      borderLeft: `4px solid ${baseColor}`,
                                      borderRadius: '4px',
                                      padding: '6px',
                                      fontSize: '0.75rem',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                      color: '#1e293b',
                                      position: 'absolute',
                                      top: `${topOffset + 4}px`,
                                      height: `${calculatedHeight - 8}px`,
                                      width: 'calc(100% - 10px)',
                                      zIndex: 5,
                                      overflow: 'hidden'
                                  }}
                              >"""

if not pattern.search(content):
    print("Pattern not found!")
    sys.exit(1)

content = pattern.sub(new_code, content)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced!")
