const fs = require('fs');
const file = 'client/src/App.jsx';
let code = fs.readFileSync(file, 'utf8');
console.log(code.substring(0, 500));
