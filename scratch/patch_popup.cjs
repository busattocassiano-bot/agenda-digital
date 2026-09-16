const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const replacement = `    const handleEventClick = (e, agendamento) => {
      e.stopPropagation();
      setSelectedAgendamento(agendamento);
      const rect = e.currentTarget.getBoundingClientRect();
      const menuHeight = 320;
      let topPos = rect.bottom + 5;
      if (window.innerHeight - rect.bottom < menuHeight) {
        topPos = Math.max(20, rect.top - menuHeight);
      }
      let leftPos = rect.left;
      if (window.innerWidth - rect.left < 250) {
        leftPos = window.innerWidth - 250;
      }
      setMenuPosition({ x: leftPos, y: topPos });
      setEventMenuOpen(true);
    };`;

const regex = /const handleEventClick = \(e, agendamento\) => \{[\s\S]*?setEventMenuOpen\(true\);\r?\n\s*\};/;
code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('patched handleEventClick');
