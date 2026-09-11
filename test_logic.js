const bDate = "2026-09-11 07:00";
const parsedDate = new Date(bDate.replace(" ", "T"));
console.log(parsedDate);
console.log(parsedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase());
