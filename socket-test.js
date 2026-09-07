const io = require("socket.io-client");
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server");
  
  // Make an API request to create a booking
  fetch("http://localhost:3000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "usr-test",
      scheduleItem: { classTitle: "Boxing", trainer: "Mike", day: "Monday", time: "09:00 AM" }
    })
  }).then(res => res.json()).then(data => console.log("API Response:", data)).catch(err => console.error(err));
});

socket.on("bookingCreated", (data) => console.log("SOCKET bookingCreated:", data));
socket.on("bookingUpdated", (data) => console.log("SOCKET bookingUpdated:", data));
socket.on("refreshNotifications", (data) => console.log("SOCKET refreshNotifications:", data));

setTimeout(() => process.exit(0), 3000);
