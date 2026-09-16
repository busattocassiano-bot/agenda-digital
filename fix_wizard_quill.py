import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\components\AvaliacaoWizardModal.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
import_pattern = re.compile(r"import \{ checkOverlapsAndCapacity \} from '\.\./utils/agendamentoUtils';\n")
import_repl = """import { checkOverlapsAndCapacity } from '../utils/agendamentoUtils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
"""
content = import_pattern.sub(import_repl, content)

# 2. Add modules
modules_repl = """    const quillModules = {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'bullet' }, { 'list': 'ordered' }]
      ]
    };
    
    // Step 1: Cadastro"""
content = content.replace("// Step 1: Cadastro", modules_repl)

# 3. Replace textareas
# Queixa Principal
ta_queixa = re.compile(r"<textarea rows=\"6\" value=\{avaliacaoData\.queixaPrincipal\} onChange=\{e => setAvaliacaoData\(\{\.\.\.avaliacaoData, queixaPrincipal: e\.target\.value\}\)\} placeholder=\"Descreva a queixa do paciente\.\.\.\" style=\{\{ width: '100%', padding: '10px 12px', border: '1px solid var\(--border-color\)', borderRadius: '8px', outline: 'none', resize: 'vertical' \}\}></textarea>")
repl_queixa = """<div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                  <ReactQuill theme="snow" value={avaliacaoData.queixaPrincipal} onChange={(val) => setAvaliacaoData({...avaliacaoData, queixaPrincipal: val})} modules={quillModules} placeholder="Descreva a queixa do paciente..." />
                </div>"""
content = ta_queixa.sub(repl_queixa, content)

# Habitos de Vida
ta_hab = re.compile(r"<textarea rows=\"4\" value=\{avaliacaoData\.habitosVida\} onChange=\{e => setAvaliacaoData\(\{\.\.\.avaliacaoData, habitosVida: e\.target\.value\}\)\} placeholder=\"Descreva os h[^\"]*bitos, atividades, etc\.\.\.\" style=\{\{ width: '100%', padding: '10px 12px', border: '1px solid var\(--border-color\)', borderRadius: '8px', outline: 'none', resize: 'vertical' \}\}></textarea>")
repl_hab = """<div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                  <ReactQuill theme="snow" value={avaliacaoData.habitosVida} onChange={(val) => setAvaliacaoData({...avaliacaoData, habitosVida: val})} modules={quillModules} placeholder="Descreva os hábitos, atividades, etc..." />
                </div>"""
content = ta_hab.sub(repl_hab, content)

# Testes Funcionais
ta_test = re.compile(r"<textarea rows=\"4\" value=\{avaliacaoData\.expectativas\} onChange=\{e => setAvaliacaoData\(\{\.\.\.avaliacaoData, expectativas: e\.target\.value\}\)\} placeholder=\"Testes funcionais e observa[^\"]*es adicionais\.\.\.\" style=\{\{ width: '100%', padding: '10px 12px', border: '1px solid var\(--border-color\)', borderRadius: '8px', outline: 'none', resize: 'vertical' \}\}></textarea>")
repl_test = """<div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                  <ReactQuill theme="snow" value={avaliacaoData.expectativas} onChange={(val) => setAvaliacaoData({...avaliacaoData, expectativas: val})} modules={quillModules} placeholder="Testes funcionais e observações adicionais..." />
                </div>"""
content = ta_test.sub(repl_test, content)

# Plano de Tratamento
ta_plano = re.compile(r"<textarea rows=\"4\" value=\{avaliacaoData\.planoTratamento\} onChange=\{e => setAvaliacaoData\(\{\.\.\.avaliacaoData, planoTratamento: e\.target\.value\}\)\} placeholder=\"Conduta, objetivos, plano de tratamento\.\.\.\" style=\{\{ width: '100%', padding: '10px 12px', border: '1px solid var\(--border-color\)', borderRadius: '8px', outline: 'none', resize: 'vertical' \}\}></textarea>")
repl_plano = """<div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                  <ReactQuill theme="snow" value={avaliacaoData.planoTratamento} onChange={(val) => setAvaliacaoData({...avaliacaoData, planoTratamento: val})} modules={quillModules} placeholder="Conduta, objetivos, plano de tratamento..." />
                </div>"""
content = ta_plano.sub(repl_plano, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced Wizard!")
