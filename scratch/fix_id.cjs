const fs = require('fs');

let code = fs.readFileSync('src/context/AppDataContext.jsx', 'utf8');

const t = "const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));";
const r = "const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));";

code = code.replace(t, r);
fs.writeFileSync('src/context/AppDataContext.jsx', code);
console.log('done');
