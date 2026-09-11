import http from "http";
import jwt from "jsonwebtoken";

const BASE_URL = "http://localhost:5000";

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTestSuite() {
  console.log("==================================================");
  console.log("🛡️  BRAVE GYM: A-TO-Z PRODUCTION SECURITY & API SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  }

  // 1. Health check
  console.log("1. System Health & Connectivity:");
  const health = await request("GET", "/api/health");
  assert(health.status === 200 && health.body.status === "healthy", "Health endpoint responds 200 OK");

  // 2. Public Endpoints
  console.log("\n2. Public Catalog & Schedule Verification:");
  const progs = await request("GET", "/api/programs");
  assert(progs.status === 200 && Array.isArray(progs.body.data), "GET /api/programs returns programs array");

  const classes = await request("GET", "/api/classes");
  assert(classes.status === 200 && Array.isArray(classes.body.data), "GET /api/classes returns timetable classes array");

  const tiers = await request("GET", "/api/memberships");
  assert(tiers.status === 200 && Array.isArray(tiers.body.data), "GET /api/memberships returns tier catalog");

  // 3. Authentication & Role Boundaries
  console.log("\n3. Authentication & Access Control Boundaries:");
  const randNum = Date.now();
  const testAthlete = {
    email: `athlete_test_${randNum}@bravegym.com`,
    password: "SecureAthletePassword123!",
    name: "Automated Tester",
    membership: "Trial Pass"
  };

  const regRes = await request("POST", "/api/auth/register", testAthlete);
  assert(regRes.status === 201 && regRes.body.data?.token, "Athlete registration returns 201 and JWT token");
  const athleteToken = regRes.body.data?.token;

  // Verify non-admin cannot access admin-only endpoints
  console.log("\n4. Security & Privilege Escalation Defenses:");
  const unauthorizedAdminUpload = await request("POST", "/api/admin/upload", {}, athleteToken);
  assert(unauthorizedAdminUpload.status === 403, "Non-admin cannot access /api/admin/upload (Blocked with 403 Forbidden)");

  const unauthorizedMigrate = await request("GET", "/api/admin/force-migrate", null, athleteToken);
  assert(unauthorizedMigrate.status === 403, "Non-admin cannot trigger /api/admin/force-migrate (Blocked with 403 Forbidden)");

  const unauthorizedCreateClass = await request("POST", "/api/classes", { classTitle: "Hacked Class" }, athleteToken);
  assert(unauthorizedCreateClass.status === 403, "Non-admin cannot create classes (Blocked with 403 Forbidden)");

  const unauthorizedCreateTier = await request("POST", "/api/memberships", { name: "Free Tier", price: 0 }, athleteToken);
  assert(unauthorizedCreateTier.status === 403, "Non-admin cannot create membership tiers (Blocked with 403 Forbidden)");

  // 5. Booking Workflow with schedule_id & State Preservation
  console.log("\n5. Class Reservation & Scheduling Integrity:");
  const bookingPayload = {
    scheduleItem: {
      id: "sc-test-101",
      classTitle: "Championship Boxing",
      trainer: "Marcus Vance",
      day: "Tuesday",
      time: "07:00 AM",
      date: "2026-09-15 07:00 AM",
      room: "Arena Boxing Ring"
    }
  };

  const bookRes = await request("POST", "/api/bookings", bookingPayload, athleteToken);
  assert(bookRes.status === 201 && bookRes.body.data?.id, "Athlete can book scheduled session (Returns 201 Created)");
  const createdBooking = bookRes.body.data;
  assert(createdBooking?.scheduleId === "sc-test-101", "Booking records and returns exact scheduleId");
  assert(createdBooking?.status === "Pending", "New booking defaults securely to 'Pending' status");

  // Athlete fetches own bookings
  const myBookings = await request("GET", `/api/bookings?userId=${regRes.body.data?.user?.id}`, null, athleteToken);
  assert(
    myBookings.status === 200 && Array.isArray(myBookings.body.data) && myBookings.body.data.some(b => b.id === createdBooking.id),
    "Athlete can retrieve own bookings containing newly created reservation"
  );

  // 6. Consultations & AI Chat Intake
  console.log("\n6. Consultation Requests & AI Intake Chat:");
  const consultPayload = {
    userName: "Automated Tester",
    phone: "+1 555 019 9999",
    address: "Downtown Combat Arena",
    serviceType: "Boxing & Kinetic Protocol",
    customRequirements: "Preparing for state championship qualifiers",
    trainerName: "Marcus Vance"
  };

  const consultRes = await request("POST", "/api/consultations", consultPayload, athleteToken);
  assert(consultRes.status === 201 && consultRes.body.data?.id, "Athlete can submit consultation / coach request");

  console.log("\n==================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Ensure server is accessible before running suite
const checkReq = http.request(new URL("/api/health", BASE_URL), { method: "GET", timeout: 2000 }, (res) => {
  runTestSuite();
});
checkReq.on("error", () => {
  console.log("⚠️ Server is not running on port 5000.");
  process.exit(2);
});
checkReq.end();
