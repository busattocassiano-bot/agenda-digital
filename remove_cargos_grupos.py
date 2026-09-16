import re

# App.jsx
with open("src/App.jsx", 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = re.sub(r"import Cargos from './pages/Cargos';\n", "", app_content)
app_content = re.sub(r"import Grupos from './pages/Grupos';\n", "", app_content)
app_content = re.sub(r"\s*<Route path=\"cargos\" element=\{<Cargos />\} />\n", "\n", app_content)
app_content = re.sub(r"\s*<Route path=\"grupos\" element=\{<Grupos />\} />\n", "\n", app_content)

with open("src/App.jsx", 'w', encoding='utf-8') as f:
    f.write(app_content)

# Sidebar.jsx
with open("src/components/Sidebar.jsx", 'r', encoding='utf-8') as f:
    sidebar_content = f.read()

sidebar_content = re.sub(r"\s*\{\s*name:\s*'Cargos'[^}]*\},?", "", sidebar_content)
sidebar_content = re.sub(r"\s*\{\s*name:\s*'Grupos'[^}]*\},?", "", sidebar_content)

with open("src/components/Sidebar.jsx", 'w', encoding='utf-8') as f:
    f.write(sidebar_content)

# AppDataContext.jsx
with open("src/context/AppDataContext.jsx", 'r', encoding='utf-8') as f:
    context_content = f.read()

context_content = context_content.replace("'pacientes', 'profissionais', 'cargos', 'planos', 'servicos',", "'pacientes', 'profissionais', 'planos', 'servicos',")
context_content = re.sub(r"\s*const \[cargos, setCargos\] = useState\(\(\) => loadState\('cargos', \[\]\)\);\n", "\n", context_content)
context_content = re.sub(r"\s*setCargos\(loadState\('cargos', \[\]\)\);\n", "\n", context_content)
context_content = re.sub(r"\s*useEffect\(\(\) => \{ localStorage\.setItem\(prefix \+ 'cargos', JSON\.stringify\(cargos\)\); \}, \[cargos\]\);\n", "\n", context_content)
context_content = re.sub(r"\s*const addCargo = \(cargo\) => \{\s*setCargos\(\[\.\.\.cargos, \{ \.\.\.cargo, id: Date\.now\(\)\.toString\(\) \}\]\);\s*\};\n", "\n", context_content)
context_content = re.sub(r"\s*cargos, addCargo, setCargos,\n", "\n", context_content)

with open("src/context/AppDataContext.jsx", 'w', encoding='utf-8') as f:
    f.write(context_content)
print("Done!")
