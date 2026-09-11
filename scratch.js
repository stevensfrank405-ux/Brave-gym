// Mock localStorage
global.localStorage = {
  store: { brave_user: JSON.stringify({ id: "usr-admin", email: "admin@bravegym.com" }) },
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; },
  removeItem(k) { delete this.store[k]; }
};

// Mock fetch
let fetchCalls = 0;
global.fetch = async (url, options) => {
  fetchCalls++;
  console.log(`Fetch ${fetchCalls}: ${url}`, options.headers);
  if (url.includes("/auth/sync-token")) {
    return {
      ok: true,
      json: async () => ({ success: true, data: { user: { id: "usr-admin" }, token: "NEW_TOKEN" } })
    };
  }
  if (url.includes("/programs")) {
    if (options.headers.Authorization) {
      return { ok: true, json: async () => ({ success: true, data: { id: "prog1" } }) };
    }
    return {
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: "No authentication token provided" })
    };
  }
  return { ok: true, json: async () => ({}) };
};

import fs from 'fs';
let apiCode = fs.readFileSync('./client/src/services/api.js', 'utf8');
apiCode = apiCode.replace(/import\.meta\.env\.VITE_API_URL/g, 'undefined');
apiCode = apiCode.replace(/import\.meta\.env\.VITE_SERVER_URL/g, 'undefined');
fs.writeFileSync('./client/src/services/api_test.js', apiCode);

import('./client/src/services/api_test.js').then(async (module) => {
  const api = module.api;
  try {
    const res = await api.createProgram({ title: "Test" });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err.message);
  }
});
