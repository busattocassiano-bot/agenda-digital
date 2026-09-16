import re

with open("src/components/Sidebar.jsx", 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for <NavLink ... >Cargos</NavLink>
content = re.sub(r'\s*<NavLink to="/cargos".*?>\s*Cargos\s*</NavLink>', '', content, flags=re.DOTALL)
# Pattern for <NavLink ... >Grupos</NavLink>
content = re.sub(r'\s*<NavLink to="/grupos".*?>\s*Grupos\s*</NavLink>', '', content, flags=re.DOTALL)

with open("src/components/Sidebar.jsx", 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Sidebar.jsx")
