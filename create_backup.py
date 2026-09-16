import zipfile
import os

zip_name = "backup_28_08_2026.zip"
files_to_zip = ["src", "public", "index.html", "package.json", "vite.config.js"]
base_dir = r"C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital"

with zipfile.ZipFile(os.path.join(base_dir, zip_name), 'w', zipfile.ZIP_DEFLATED) as zipf:
    for item in files_to_zip:
        item_path = os.path.join(base_dir, item)
        if os.path.isdir(item_path):
            for root, dirs, files in os.walk(item_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, base_dir)
                    zipf.write(file_path, arcname)
        elif os.path.isfile(item_path):
            arcname = os.path.relpath(item_path, base_dir)
            zipf.write(item_path, arcname)

print(f"Created {zip_name} successfully!")
