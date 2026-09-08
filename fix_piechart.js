const fs = require('fs');
const file = 'client/src/pages/admin/AdminDashboard.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/PieChart([^I])/g, "PieChartIcon$1");
code = code.replace("PieChartIcon, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'", "PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'");
code = code.replace("<PieChartIcon className=\"w-4 h-4", "<PieChartIcon className=\"w-4 h-4");

fs.writeFileSync(file, code);
console.log("Fixed PieChart conflict.");
