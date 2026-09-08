const fs = require('fs');
const file = 'client/src/pages/admin/AdminDashboard.jsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';")) {
  code = code.replace(
    'import {',
    "import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';\nimport {"
  );
  fs.writeFileSync(file, code);
  console.log("Added recharts import.");
}
