import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\PacientePerfil.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Queixa
q_pattern = re.compile(r"<strong>Queixa Principal:</strong> \{av\.queixaPrincipal \|\| 'N/A'\}</div>")
q_repl = r"<strong>Queixa Principal:</strong> <div style={{marginTop: '4px'}} dangerouslySetInnerHTML={{ __html: av.queixaPrincipal || 'N/A' }}></div></div>"
content = q_pattern.sub(q_repl, content)

# Habitos
h_pattern = re.compile(r"<strong>H[^<]*bitos de Vida:</strong> \{av\.habitosVida \|\| 'N/A'\}</div>")
h_repl = r"<strong>Hábitos de Vida:</strong> <div style={{marginTop: '4px'}} dangerouslySetInnerHTML={{ __html: av.habitosVida || 'N/A' }}></div></div>"
content = h_pattern.sub(h_repl, content)

# Testes Funcionais
t_pattern = re.compile(r"<strong>Testes Funcionais e Observa[^<]*es:</strong> \{av\.expectativas \|\| 'N/A'\}</div>")
t_repl = r"<strong>Testes Funcionais e Observações:</strong> <div style={{marginTop: '4px'}} dangerouslySetInnerHTML={{ __html: av.expectativas || 'N/A' }}></div></div>"
content = t_pattern.sub(t_repl, content)

# Plano de Tratamento
p_pattern = re.compile(r"<strong>Plano de Tratamento:</strong> \{av\.planoTratamento \|\| 'N/A'\}</div>")
p_repl = r"<strong>Plano de Tratamento:</strong> <div style={{marginTop: '4px'}} dangerouslySetInnerHTML={{ __html: av.planoTratamento || 'N/A' }}></div></div>"
content = p_pattern.sub(p_repl, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced Perfil!")
