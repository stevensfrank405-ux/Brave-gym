import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_PROGRAMS, INITIAL_TRAINERS, INITIAL_MEMBERSHIPS, INITIAL_SCHEDULE } from "../lib/mockData";
import { api, SERVER_BASE_URL } from "../services/api";

const GymContext = createContext(null);

export function GymProvider({ children }) {
  // Current user state (null when not logged in)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("brave_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [programs] = useState(INITIAL_PROGRAMS);
  const [trainers] = useState(INITIAL_TRAINERS);
  const [memberships, setMemberships] = useState(() => {
    const saved = localStorage.getItem("brave_memberships");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_MEMBERSHIPS;
  });
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);

  // User's booked classes
  const [bookings, setBookings] = useState([]);

  // Admin view of all member bookings across the facility
  const [adminBookings, setAdminBookings] = useState([]);

  // Workout log items (current user)
  const [workoutLogs, setWorkoutLogs] = useState([]);

  // All registered athletes/profiles and logs across facility for Admin Dossier inspection
  const [allUsersRoster, setAllUsersRoster] = useState([]);
  const [allWorkoutLogs, setAllWorkoutLogs] = useState([]);

  // Consultation Requests sent to Admin
  const [consultationRequests, setConsultationRequests] = useState([]);

  // Admin stats
  const [adminStats, setAdminStats] = useState({
    monthlyRevenue: 2850,
    activeMembers: 12,
    todayOccupancy: 84,
    newSignupsThisWeek: 4,
    recentTransactions: []
  });

  // Real-time notifications
  const [userNotifications, setUserNotifications] = useState(() => {
    const saved = localStorage.getItem("brave_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to local cache as fallback
  useEffect(() => {
    localStorage.setItem("brave_notifications", JSON.stringify(userNotifications));
  }, [userNotifications]);

  useEffect(() => {
    localStorage.setItem("brave_consultations", JSON.stringify(consultationRequests));
  }, [consultationRequests]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("brave_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("brave_user");
    }
  }, [currentUser]);

  // ==========================================================
  // BACKEND DATA SYNC (NODE.JS REST API)
  // ==========================================================
  const loadRemoteData = useCallback(async (userId, role = null) => {
    try {
      // 1. Load Classes
      const remoteClasses = await api.getClasses().catch(() => null);
      if (Array.isArray(remoteClasses) && remoteClasses.length > 0) {
        setSchedule(
          remoteClasses.map((c) => ({
            id: c.id,
            day: c.day,
            time: c.time,
            classTitle: c.classTitle || c.class_title,
            trainer: c.trainer,
            spotsLeft: c.spotsLeft ?? c.spots_left ?? c.total,
            total: c.total
          }))
        );
      }

      // 2. Load Membership Tiers
      const remoteTiers = await api.getMembershipTiers().catch(() => null);
      if (Array.isArray(remoteTiers) && remoteTiers.length > 0) {
        const mappedTiers = remoteTiers.map((t) => ({
          id: t.id,
          name: t.name,
          price: Number(t.price),
          interval: t.interval || t.billing || "monthly",
          billing: t.billing || t.interval || "monthly",
          description: t.description || "",
          features: Array.isArray(t.features) ? t.features : [],
          popular: !!t.popular,
          cta: t.cta || `Claim ${t.name}`
        }));
        setMemberships(mappedTiers);
        localStorage.setItem("brave_memberships", JSON.stringify(mappedTiers));
      }

      // 3. Load Consultations
      const remoteConsultations = await api.getConsultations().catch(() => null);
      if (Array.isArray(remoteConsultations)) {
        setConsultationRequests(remoteConsultations);
      }

      // 4. Load Admin Telemetry
      const stats = await api.getAdminStats().catch(() => null);
      if (stats) {
        setAdminStats({
          monthlyRevenue: stats.monthlyRevenue || 0,
          activeMembers: stats.activeMembers || 0,
          todayOccupancy: stats.todayOccupancy || 0,
          newSignupsThisWeek: stats.newSignupsThisWeek || 0,
          recentTransactions: stats.recentTransactions || []
        });
        if (Array.isArray(stats.allUsersRoster)) setAllUsersRoster(stats.allUsersRoster);
        if (Array.isArray(stats.allWorkoutLogs)) setAllWorkoutLogs(stats.allWorkoutLogs);
        if (Array.isArray(stats.adminBookings)) setAdminBookings(stats.adminBookings);
      }

      // 5. User Specific Data
      if (userId) {
        const [myBookings, myLogs, myNotifs] = await Promise.all([
          api.getBookings(userId).catch(() => []),
          api.getWorkoutLogs(userId).catch(() => []),
          api.getNotifications(userId).catch(() => [])
        ]);

        if (Array.isArray(myBookings)) setBookings(myBookings);
        if (Array.isArray(myLogs)) setWorkoutLogs(myLogs);
        if (Array.isArray(myNotifs)) setUserNotifications(myNotifs);
      }
    } catch (err) {
      console.warn("Backend data sync completed with local cache active:", err.message);
    }
  }, [currentUser?.role]);

  // Initial load
  useEffect(() => {
    // Attempt auto-login if token exists
    const initAuth = async () => {
      const user = await api.getCurrentUser().catch(() => null);
      if (user) {
        setCurrentUser(user);
        loadRemoteData(user.id, user.role);
      } else {
        loadRemoteData(currentUser?.id, currentUser?.role);
      }
    };
    initAuth();
  }, [loadRemoteData, currentUser?.id, currentUser?.role]);

  // ==========================================
  // AUTH METHODS (NODE.JS BACKEND)
  // ==========================================

  const login = async (email, password, role = "user") => {
    try {
      const { user } = await api.login(email, password, role);
      setCurrentUser(user);
      loadRemoteData(user.id, user.role);
      return user;
    } catch (err) {
      console.error("Backend login error:", err.message);
      throw err;
    }
  };

  const register = async (name, email, password, role = "user", initialMembership = "Brave Trial") => {
    try {
      const { user } = await api.register(name, email, password, role, initialMembership);
      setCurrentUser(user);
      loadRemoteData(user.id, user.role);
      return user;
    } catch (err) {
      console.error("Backend register error:", err.message);
      // Throw the genuine error so user sees the validation error on the form
      throw err;
    }
  };

  const logout = async () => {
    api.logout();
    setCurrentUser(null);
  };

  // ==========================================
  // CLASS BOOKINGS
  // ==========================================

  // ==========================================
  // CLASS BOOKINGS
  // ==========================================

  const bookClass = async (scheduleItem) => {
    // 🛡️ Restrict booking if user membership is Pending
    if (currentUser && currentUser.role !== "admin" && (currentUser.status === "Pending" || currentUser.status?.toLowerCase().includes("pending"))) {
      throw new Error("Your membership is currently pending Admin verification. Please wait for confirmation or use the Chat below to reach HQ.");
    }

    const newBookingData = {
      id: "bk-" + Date.now(),
      classTitle: scheduleItem.classTitle,
      trainer: scheduleItem.trainer,
      date: `${scheduleItem.day}, ${scheduleItem.time}`,
      status: "Confirmed",
      room: "Main Athletic Floor",
      userName: currentUser?.name || "Athlete",
      userEmail: currentUser?.email || ""
    };

    setBookings((prev) => [newBookingData, ...prev]);
    setAdminBookings((prev) => [newBookingData, ...prev]);

    setSchedule((prev) =>
      prev.map((sc) => (sc.id === scheduleItem.id ? { ...sc, spotsLeft: Math.max(0, sc.spotsLeft - 1) } : sc))
    );

    try {
      const savedBooking = await api.createBooking(scheduleItem, {
        name: currentUser?.name,
        email: currentUser?.email
      });
      return savedBooking || newBookingData;
    } catch (err) {
      console.warn("Saved booking locally:", err.message);
      return newBookingData;
    }
  };

  const purchasePlan = async (plan) => {
    // 1. Update current user state to Pending approval
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        membership: plan.name,
        membership_tier: plan.name,
        status: "Pending",
        renewalDate: "Pending Admin Approval"
      };
      localStorage.setItem("brave_user", JSON.stringify(updated));
      return updated;
    });

    try {
      const result = await api.purchasePlan(plan, { name: currentUser?.name });
      if (result?.transaction) {
        setAdminStats((prev) => ({
          ...prev,
          recentTransactions: [result.transaction, ...prev.recentTransactions.filter(t => t.id !== result.transaction.id)]
        }));
      }
      return result;
    } catch (err) {
      console.warn("Purchase plan submitted with local pending state:", err.message);
    }
  };

  const approveMembershipOrder = async (orderId, athleteUserId, planName) => {
    try {
      await api.approveMembershipOrder(orderId, athleteUserId, planName);
      
      // Update local roster in real time
      setAllUsersRoster((prev) =>
        prev.map((u) => (u.id === athleteUserId ? { ...u, status: "Active", membership: planName || u.membership, renewalDate: "30 Days Active" } : u))
      );

      // If viewing self
      if (currentUser?.id === athleteUserId) {
        setCurrentUser((prev) => ({ ...prev, status: "Active", membership: planName || prev.membership, renewalDate: "30 Days Active" }));
      }

      // Update admin stats
      setAdminStats((prev) => ({
        ...prev,
        recentTransactions: prev.recentTransactions.map((tx) =>
          tx.id === orderId ? { ...tx, status: "Confirmed" } : tx
        )
      }));
    } catch (err) {
      console.error("Failed to approve order:", err.message);
      throw err;
    }
  };

  const rejectMembershipOrder = async (orderId, athleteUserId, reason) => {
    try {
      await api.rejectMembershipOrder(orderId, athleteUserId, reason);
      setAdminStats((prev) => ({
        ...prev,
        recentTransactions: prev.recentTransactions.map((tx) =>
          tx.id === orderId ? { ...tx, status: "Declined" } : tx
        )
      }));
    } catch (err) {
      console.error("Failed to reject order:", err.message);
      throw err;
    }
  };

  const sendNegotiationMessage = async (consultationId, text, sender = "user") => {
    try {
      const res = await api.sendConsultationMessage(consultationId, text, sender);
      if (res?.data) {
        setConsultationRequests((prev) =>
          prev.map((c) => (c.id === consultationId ? res.data : c))
        );
      }
      return res?.data;
    } catch (err) {
      console.error("Failed to send message:", err.message);
      throw err;
    }
  };

  const cancelBooking = async (bookingId) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setAdminBookings((prev) => prev.filter((b) => b.id !== bookingId));
    try {
      await api.cancelBooking(bookingId);
    } catch (err) {
      console.warn("Cancelled booking locally:", err.message);
    }
  };

  // ==========================================
  // WORKOUT LOGS
  // ==========================================

  const addWorkoutLog = async (entry) => {
    const newLog = { id: "log-" + Date.now(), ...entry };
    setWorkoutLogs((prev) => [newLog, ...prev]);

    try {
      await api.addWorkoutLog(entry);
    } catch (err) {
      console.warn("Saved workout log locally:", err.message);
    }
  };

  // ==========================================
  // CONSULTATIONS & LEADS
  // ==========================================

  const addConsultationRequest = async (requestData) => {
    const newReq = {
      id: "req-" + Date.now().toString().slice(-4),
      createdAt: "Just now",
      status: "Pending",
      userId: currentUser?.id,
      ...requestData
    };
    setConsultationRequests((prev) => [newReq, ...prev]);

    try {
      const created = await api.submitConsultation(newReq);
      return created || newReq;
    } catch (err) {
      console.warn("Saved consultation locally:", err.message);
      return newReq;
    }
  };

  const updateConsultationStatus = async (id, newStatus) => {
    setConsultationRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    try {
      await api.updateConsultationStatus(id, newStatus);
    } catch (err) {
      console.warn("Updated consultation status locally:", err.message);
    }
  };

  const removeConsultationRequest = async (id) => {
    setConsultationRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await api.deleteConsultation(id);
    } catch (err) {
      console.warn("Removed consultation locally:", err.message);
    }
  };

  // ==========================================
  // MEMBERSHIP TIERS MANAGEMENT
  // ==========================================

  const addMembershipTier = async (tier) => {
    setMemberships((prev) => {
      const updated = [tier, ...prev];
      localStorage.setItem("brave_memberships", JSON.stringify(updated));
      return updated;
    });

    try {
      await api.createMembershipTier(tier);
    } catch (err) {
      console.warn("Saved tier locally:", err.message);
    }
  };

  const removeMembershipTier = async (tierId) => {
    setMemberships((prev) => {
      const updated = prev.filter((t) => t.id !== tierId);
      localStorage.setItem("brave_memberships", JSON.stringify(updated));
      return updated;
    });

    try {
      await api.deleteMembershipTier(tierId);
    } catch (err) {
      console.warn("Removed tier locally:", err.message);
    }
  };

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const markNotificationsAsRead = async () => {
    setUserNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markNotificationsAsRead(currentUser?.id);
    } catch (err) {
      console.warn("Marked notifications read locally:", err.message);
    }
  };

  const createNotification = async (title, message, type = "admin_response") => {
    const newNotif = {
      id: "notif-" + Date.now(),
      title,
      message,
      type,
      read: false,
      time: "Just now"
    };
    setUserNotifications((prev) => [newNotif, ...prev]);

    try {
      await api.createNotification(title, message, type, currentUser?.id);
    } catch (err) {
      console.warn("Saved notification locally:", err.message);
    }
  };

  // ==========================================
  // PROFILE & AVATAR UPLOAD
  // ==========================================

  const updateProfile = async (updatedFields) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("brave_user", JSON.stringify(updated));
      return updated;
    });

    try {
      const savedUser = await api.updateProfile(updatedFields);
      if (savedUser) setCurrentUser(savedUser);
    } catch (err) {
      console.warn("Updated profile locally:", err.message);
    }
  };

  const uploadUserAvatar = async (file) => {
    if (!file) return null;
    try {
      const publicUrl = await api.uploadAvatar(file);
      if (publicUrl) {
        updateProfile({ avatar: publicUrl });
        return publicUrl;
      }
    } catch (err) {
      console.warn("Avatar upload fallback:", err.message);
    }
    return null;
  };

  // ==========================================
  // TIMETABLE ADMIN ACTIONS
  // ==========================================

  const addScheduleClass = async (classData) => {
    const newEntry = {
      id: "sc-" + Date.now(),
      day: classData.day,
      time: classData.time,
      classTitle: classData.classTitle,
      trainer: classData.trainer,
      spotsLeft: Number(classData.total),
      total: Number(classData.total)
    };
    setSchedule((prev) => [newEntry, ...prev]);

    try {
      await api.createClass(newEntry);
    } catch (err) {
      console.warn("Created class locally:", err.message);
    }
  };

  const removeScheduleClass = async (classId) => {
    setSchedule((prev) => prev.filter((sc) => sc.id !== classId));
    try {
      await api.deleteClass(classId);
    } catch (err) {
      console.warn("Removed class locally:", err.message);
    }
  };

  return (
    <GymContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateProfile,
        uploadUserAvatar,
        programs,
        trainers,
        memberships,
        schedule,
        bookings,
        adminBookings,
        bookClass,
        cancelBooking,
        workoutLogs,
        addWorkoutLog,
        consultationRequests,
        addConsultationRequest,
        updateConsultationStatus,
        removeConsultationRequest,
        adminStats,
        userNotifications,
        markNotificationsAsRead,
        createNotification,
        addMembershipTier,
        removeMembershipTier,
        addScheduleClass,
        removeScheduleClass,
        allUsersRoster,
        allWorkoutLogs,
        purchasePlan,
        approveMembershipOrder,
        rejectMembershipOrder,
        sendNegotiationMessage,
        isBackendConnected: true
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error("useGym must be used within a GymProvider");
  }
  return context;
}
