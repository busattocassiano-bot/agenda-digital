const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const regex = /\{\/\* Header and Controls \*\/\}.*?\{\/\* Calendar Area \*\/\}/s;

const newBlock = `{/* Header and Controls */}
        <div className="flex-between" style={{ marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={goToday} style={{ padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--text-dark)' }}>Hoje</button>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={prevDate} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronLeft size={18} /></button>
                <div style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '1rem', minWidth: '180px', textAlign: 'center' }}>
                  {calendarView === 'mes' ? (
                    format(currentDate, "MMMM yyyy", { locale: ptBR }).toUpperCase()
                  ) : calendarView === 'dia' ? (
                    format(currentDate, "d 'de' MMMM", { locale: ptBR })
                  ) : (
                    \`De \${format(days[0], "d/MMM.", { locale: ptBR })} a \${format(days[days.length-1], "d/MMM./yyyy", { locale: ptBR })}\`
                  )}
                </div>
                <button onClick={nextDate} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronRight size={18} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                <button 
                  onClick={() => setCalendarView('dia')}
                  style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: calendarView === 'dia' ? 'white' : 'transparent', fontWeight: calendarView === 'dia' ? 600 : 500, color: calendarView === 'dia' ? 'var(--text-dark)' : 'var(--text-muted)', boxShadow: calendarView === 'dia' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                >Dia</button>
                <button 
                  onClick={() => setCalendarView('semana')}
                  style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: calendarView === 'semana' ? 'white' : 'transparent', fontWeight: calendarView === 'semana' ? 600 : 500, color: calendarView === 'semana' ? 'var(--text-dark)' : 'var(--text-muted)', boxShadow: calendarView === 'semana' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                >Semana</button>
                <button 
                  onClick={() => setCalendarView('mes')}
                  style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: calendarView === 'mes' ? 'white' : 'transparent', fontWeight: calendarView === 'mes' ? 600 : 500, color: calendarView === 'mes' ? 'var(--text-dark)' : 'var(--text-muted)', boxShadow: calendarView === 'mes' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                >Mês</button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => {
                  setDataInicio(format(currentDate, 'yyyy-MM-dd'));
                  setAgendamentoModalOpen(true);
                }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Plus size={18} /></button>
                <button onClick={() => window.location.reload()} style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>
                <div style={{ display: 'flex', background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginLeft: '8px' }}>
                  <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer' }} title="Diminuir Zoom"><ZoomOut size={18} /></button>
                  <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }} title="Aumentar Zoom"><ZoomIn size={18} /></button>
                </div>
              </div>
            </div>
        </div>

        {/* Calendar Area */}`;

if (!regex.test(content)) {
    console.error("Pattern not found!");
    process.exit(1);
}

content = content.replace(regex, newBlock);
fs.writeFileSync('src/pages/Agenda.jsx', content);
console.log('Successfully replaced block!');
