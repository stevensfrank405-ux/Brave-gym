/**
 * Brave Gym Backend REST API Client
 * Clean MVVM Model Service replacing Supabase
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

class ApiService {
  getToken() {
    return localStorage.getItem("brave_token") || "";
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("brave_token", token);
    } else {
      localStorage.removeItem("brave_token");
    }
  }

  getHeaders(isMultipart = false) {
    const headers = {};
    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getHeaders(options.isMultipart),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`[API] ${options.method || "GET"} ${endpoint} error:`, err.message);
      throw err;
    }
  }

  // Auth & Profile
  async register(name, email, password, role = "user", membership = "Brave Trial") {
    const res = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, membership })
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async login(email, password, role = "user") {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role })
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await this.request("/auth/me");
      return res.data;
    } catch {
      this.setToken(null);
      return null;
    }
  }

  async updateProfile(fields) {
    const res = await this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(fields)
    });
    return res.data;
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await this.request("/auth/avatar", {
      method: "POST",
      isMultipart: true,
      body: formData
    });

    const avatarUrl = res.data?.avatarUrl;
    return avatarUrl ? `${SERVER_BASE_URL}${avatarUrl}` : null;
  }

  logout() {
    this.setToken(null);
  }

  // Classes & Schedule
  async getClasses() {
    const res = await this.request("/classes");
    return res.data || [];
  }

  async createClass(classData) {
    const res = await this.request("/classes", {
      method: "POST",
      body: JSON.stringify(classData)
    });
    return res.data;
  }

  async deleteClass(classId) {
    const res = await this.request(`/classes/${classId}`, {
      method: "DELETE"
    });
    return res.success;
  }

  // Bookings
  async getBookings(userId = null, all = false) {
    const query = all ? "?all=true" : (userId ? `?userId=${encodeURIComponent(userId)}` : "");
    const res = await this.request(`/bookings${query}`);
    return res.data || [];
  }

  async createBooking(bookingData, userMeta = {}) {
    const res = await this.request("/bookings", {
      method: "POST",
      body: JSON.stringify({
        scheduleItem: bookingData,
        userMeta
      })
    });
    return res;
  }

  async cancelBooking(bookingId) {
    const res = await this.request(`/bookings/${bookingId}`, {
      method: "DELETE"
    });
    return res.success;
  }

  async updateBooking(bookingId, updates) {
    const res = await this.request(`/bookings/${bookingId}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
    return res.data;
  }

  // Workout Logs
  async getWorkoutLogs(userId = null, all = false) {
    const query = all ? "?all=true" : (userId ? `?userId=${encodeURIComponent(userId)}` : "");
    const res = await this.request(`/workouts${query}`);
    return res.data || [];
  }

  async addWorkoutLog(entry) {
    const res = await this.request("/workouts", {
      method: "POST",
      body: JSON.stringify(entry)
    });
    return res.data;
  }

  // Consultations & Intake Leads
  async getConsultations() {
    const res = await this.request("/consultations");
    return res.data || [];
  }

  async submitConsultation(data) {
    const res = await this.request("/consultations", {
      method: "POST",
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async updateConsultationStatus(id, status) {
    const res = await this.request(`/consultations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    return res.data;
  }

  async deleteConsultation(id) {
    const res = await this.request(`/consultations/${id}`, {
      method: "DELETE"
    });
    return res.success;
  }

  // Notifications
  async getNotifications(userId = null) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const res = await this.request(`/notifications${query}`);
    return res.data || [];
  }

  async markNotificationsAsRead(userId = null) {
    const res = await this.request("/notifications/read", {
      method: "PATCH",
      body: JSON.stringify({ userId })
    });
    return res.success;
  }

  async createNotification(title, message, type = "admin_response", userId = null) {
    const res = await this.request("/notifications", {
      method: "POST",
      body: JSON.stringify({ title, message, type, userId })
    });
    return res.data;
  }

  // Memberships & Financial Tiers
  async getMembershipTiers() {
    const res = await this.request("/memberships");
    return res.data || [];
  }

  async createMembershipTier(tier) {
    const res = await this.request("/memberships", {
      method: "POST",
      body: JSON.stringify(tier)
    });
    return res.data;
  }

  async deleteMembershipTier(tierId) {
    const res = await this.request(`/memberships/${tierId}`, {
      method: "DELETE"
    });
    return res.success;
  }

  async purchasePlan(plan, userMeta = {}) {
    const res = await this.request("/memberships/purchase", {
      method: "POST",
      body: JSON.stringify({ plan, userMeta })
    });
    return res.data;
  }

  async getMembershipOrders() {
    const res = await this.request("/memberships/orders");
    return res.data || [];
  }

  async approveMembershipOrder(orderId, userId, planName) {
    const res = await this.request("/memberships/approve", {
      method: "POST",
      body: JSON.stringify({ orderId, userId, planName })
    });
    return res.data;
  }

  async rejectMembershipOrder(orderId, userId, reason) {
    const res = await this.request("/memberships/reject", {
      method: "POST",
      body: JSON.stringify({ orderId, userId, reason })
    });
    return res.data;
  }

  async sendConsultationMessage(threadId, text, sender = "user", userMeta = {}) {
    const res = await this.request(`/consultations/${threadId}/message`, {
      method: "POST",
      body: JSON.stringify({
        text,
        sender,
        userId: userMeta.userId,
        userName: userMeta.userName
      })
    });
    return res.data;
  }

  // Admin Telemetry & Statistics
  async getAdminStats() {
    const res = await this.request("/admin/stats");
    return res.data;
  }

  async deleteUser(userId) {
    const res = await this.request(`/admin/users/${userId}`, {
      method: "DELETE"
    });
    return res;
  }
}

export const api = new ApiService();
export { SERVER_BASE_URL, API_BASE_URL };
