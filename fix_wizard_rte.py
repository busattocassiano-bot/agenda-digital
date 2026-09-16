import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\components\AvaliacaoWizardModal.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ReactQuill imports
imp_pat = re.compile(r"import ReactQuill from 'react-quill';\nimport 'react-quill/dist/quill\.snow\.css';")
content = imp_pat.sub(r"import RichTextEditor from './RichTextEditor';", content)

# Remove quillModules
mod_pat = re.compile(r"\s*const quillModules = \{.*?toolbar: \[.*?\]\s*\};\s*", re.DOTALL)
content = mod_pat.sub(r"\n    ", content)

# Replace ReactQuill usage
q_pat = re.compile(r"<div style=\{\{ background: 'white', borderRadius: '8px', overflow: 'hidden' \}\}>\s*<ReactQuill theme=\"snow\" value=\{([^\}]+)\} onChange=\{\(val\) => setAvaliacaoData\(\{([^,]+), ([^:]+): val\}\)\} modules=\{quillModules\} placeholder=\"([^\"]+)\" />\s*</div>")

def replacer(match):
    val = match.group(1)
    spread = match.group(2)
    prop = match.group(3)
    placeholder = match.group(4)
    min_height = "150px" if prop == "queixaPrincipal" else "100px"
    return f'<RichTextEditor value={{{val}}} onChange={{(val) => setAvaliacaoData({{{spread}, {prop}: val}})}} placeholder="{placeholder}" minHeight="{min_height}" />'

content = q_pat.sub(replacer, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced with custom RichTextEditor!")
