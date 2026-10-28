# Regras do projeto agenda-digital

- Fluxo de deploy: TODAS as alterações vão primeiro para o branch `teste` (preview na Vercel).
- Só fazer merge de `teste` em `main` (site oficial) quando o usuário disser explicitamente "aprovado".
- Nunca excluir dados (Firebase) nem arquivos do usuário; apenas fazer atualizações. Site de teste usa o MESMO banco do oficial.
- Comunicação em português, linguagem simples.
