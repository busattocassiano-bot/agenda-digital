import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\index.css'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace body font
pattern1 = re.compile(r"font-family: 'Inter', sans-serif;")
new_code1 = r"font-family: Arial, Helvetica, sans-serif;"

# Remove import
pattern2 = re.compile(r"@import url\('https://fonts.googleapis.com/css2\?family=Inter[^\)]+'\);\n*")
new_code2 = r""

if not pattern1.search(content):
    print("Pattern 1 not found!")
    sys.exit(1)

content = pattern1.sub(new_code1, content)
content = pattern2.sub(new_code2, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced font safely!")
