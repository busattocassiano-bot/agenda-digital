$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$source = "C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src"
$dest = "C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\backups\src_backup_$timestamp"

Copy-Item -Path $source -Destination $dest -Recurse
Write-Host "Backup criado com sucesso em: $dest"
