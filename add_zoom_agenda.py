import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add ZoomIn and ZoomOut to lucide-react imports
if 'ZoomIn, ZoomOut' not in content:
    content = content.replace("Activity\n  } from 'lucide-react';", "Activity, ZoomIn, ZoomOut\n  } from 'lucide-react';")

# 2. Add zoom state
if 'const [zoomLevel, setZoomLevel] = useState(1);' not in content:
    content = content.replace("const [view, setView] = useState('week');", "const [view, setView] = useState('week');\n  const [zoomLevel, setZoomLevel] = useState(1);")

# 3. Add Zoom buttons next to the view switcher
buttons = """<div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ display: 'flex', background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer' }} title="Diminuir Zoom"><ZoomOut size={18} /></button>
                <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }} title="Aumentar Zoom"><ZoomIn size={18} /></button>
              </div>"""

content = content.replace("<div style={{ display: 'flex', gap: '8px' }}>", buttons, 1)

# 4. Update the cell height calculation for daily/weekly grid
content = re.sub(r"height: '60px'", r"height: `${60 * zoomLevel}px`", content)

# 5. Update pxPerMin calculation
content = content.replace("const pxPerMin = 60 / interval;", "const pxPerMin = (60 * zoomLevel) / interval;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Zoom buttons added!")
