const fs = require('fs');
const file = 'client/src/pages/admin/AdminDashboard.jsx';
let code = fs.readFileSync(file, 'utf8');

const pStart = code.indexOf('{/* Tab Content: Curriculum / Programs */}');
const pEnd = code.indexOf('{/* Tab Content: Schedule Management */}');
const programsBlock = code.substring(pStart, pEnd);

const bStart = code.indexOf('{/* Tab Content: Athlete Bookings (Real-Time Class Reservations) */}');

// Remove programsBlock from its original position
code = code.substring(0, pStart) + code.substring(pEnd);

// Insert programsBlock before bStart
const newCode = code.substring(0, bStart) + programsBlock + code.substring(bStart);

if (fs.readFileSync(file, 'utf8') !== newCode) {
  fs.writeFileSync(file, newCode);
  console.log("Moved successfully.");
}
