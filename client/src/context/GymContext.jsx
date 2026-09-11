import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_PROGRAMS, INITIAL_MEMBERSHIPS, INITIAL_SCHEDULE } from "../lib/mockData";
import { api, SERVER_BASE_URL } from "../services/api";
import { io } from "socket.io-client";

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

  const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
  const [trainers, setTrainers] = useState([]);
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

  // Admin stats (Live Database Telemetry)
  const [adminStats, setAdminStats] = useState({
    monthlyRevenue: 0,
    activeMembers: 0,
    todayOccupancy: 0,
    newSignupsThisWeek: 0,
    recentTransactions: []
  });

  // Real-time notifications
  const [userNotifications, setUserNotifications] = useState([]);

  // Sync to local cache as fallback (scoped to current user)
  useEffect(() => {
    if (currentUser?.id) {
      const storageKey = `brave_notifications_${currentUser.id}`;
      localStorage.setItem(storageKey, JSON.stringify(userNotifications));
    }
  }, [userNotifications, currentUser?.id]);

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

  // Sync auth state across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "brave_user") {
        if (!e.newValue) {
          setCurrentUser(null);
          api.setToken(null);
        } else {
          try {
            setCurrentUser(JSON.parse(e.newValue));
          } catch {}
        }
      }
      if (e.key === "brave_token") {
        api.setToken(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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

      // 2. Load Programs
      const remotePrograms = await api.getPrograms().catch(() => null);
      if (Array.isArray(remotePrograms) && remotePrograms.length > 0) {
        setPrograms(remotePrograms);
      }

      // 3. Load Membership Tiers
      const remoteTiers = await api.getMembershipTiers().catch(() => null);
      if (Array.isArray(remoteTiers)) {
        if (remoteTiers.length > 0) {
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
        } else {
          setMemberships([]);
          localStorage.setItem("brave_memberships", JSON.stringify([]));
        }
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

      // 4.5 Load Trainers
      const remoteTrainers = await api.getTrainers().catch(() => null);
      if (Array.isArray(remoteTrainers) && remoteTrainers.length > 0) {
        setTrainers(remoteTrainers);
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

  // Initial load & WebSocket for real-time updates
  const currentUserRef = React.useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    let socket;

    // Attempt auto-login if token exists
    const initAuth = async () => {
      let activeUserId = currentUser?.id;
      let activeUserRole = currentUser?.role;

      const user = await api.getCurrentUser().catch(() => null);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem("brave_user", JSON.stringify(user));
        activeUserId = user.id;
        activeUserRole = user.role;
      }
      
      await loadRemoteData(activeUserId, activeUserRole);

      // Initialize WebSocket connection
      socket = io(SERVER_BASE_URL);
      
      socket.on("connect", () => {
        console.log("[Socket] Connected for real-time updates");
      });

      socket.on("consultationUpdated", (updatedConsultation) => {
        setConsultationRequests((prev) => {
          const exists = prev.some((c) => c.id === updatedConsultation.id);
          if (exists) {
            return prev.map((c) => (c.id === updatedConsultation.id ? updatedConsultation : c));
          }
          return [updatedConsultation, ...prev];
        });
      });

      socket.on("bookingCreated", ({ booking, updatedClass }) => {
        const activeUserId = currentUserRef.current?.id;
        const activeUserRole = currentUserRef.current?.role;
        
        if (booking.userId === activeUserId) {
          setBookings((prev) => {
            if (prev.some(b => b.id === booking.id)) return prev;
            // Remove optimistic temp booking if it matches the new real booking
            const filtered = prev.filter(b => !(String(b.id || "").startsWith("bk-") && b.classTitle === booking.classTitle && b.date === booking.date));
            return [booking, ...filtered];
          });
        }
        if (currentUserRef.current?.role === "admin") {
          setAdminBookings((prev) => {
            if (prev.some(b => b.id === booking.id)) return prev;
            return [booking, ...prev];
          });
        }
        if (updatedClass) {
          setSchedule((prev) =>
            prev.map((sc) => (sc.id === updatedClass.id ? { ...sc, spotsLeft: updatedClass.spotsLeft } : sc))
          );
        }
      });

      socket.on("bookingUpdated", (updatedBooking) => {
        const activeUserId = currentUserRef.current?.id;
        const activeUserRole = currentUserRef.current?.role;
        
        // Remove strict userId === activeUserId check because prev.map already safely maps by b.id
        setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id || (String(b.id || "").startsWith("bk-") && b.classTitle === updatedBooking.classTitle && b.date === updatedBooking.date) ? updatedBooking : b)));
        
        if (activeUserRole === "admin") {
          setAdminBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
        }
      });

      socket.on("bookingDeleted", ({ id }) => {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setAdminBookings((prev) => prev.filter((b) => b.id !== id));
      });

      socket.on("scheduleClassCreated", (newClass) => {
        setSchedule((prev) => {
          if (prev.some(sc => sc.id === newClass.id)) return prev;
          return [newClass, ...prev];
        });
      });

      socket.on("scheduleClassDeleted", ({ id }) => {
        setSchedule((prev) => prev.filter((sc) => sc.id !== id));
      });

      socket.on("workoutLogCreated", (newLog) => {
        const activeUserId = currentUserRef.current?.id;
        const activeUserRole = currentUserRef.current?.role;

        if (newLog.userId === activeUserId) {
          setWorkoutLogs((prev) => {
            if (prev.some((l) => l.id === newLog.id)) return prev;
            // Filter out optimistic temp log if any
            const filtered = prev.filter(
              (l) => !(String(l.id || "").startsWith("log-") && l.exercise === newLog.exercise && l.date === newLog.date)
            );
            return [newLog, ...filtered];
          });
        }

        if (activeUserRole === "admin") {
          setAllWorkoutLogs((prev) => {
            if (prev.some((l) => l.id === newLog.id)) return prev;
            return [newLog, ...prev];
          });
        }
      });

      socket.on("workoutLogUpdated", (updatedLog) => {
        setWorkoutLogs((prev) =>
          prev.map((l) => (l.id === updatedLog.id ? updatedLog : l))
        );
        setAllWorkoutLogs((prev) =>
          prev.map((l) => (l.id === updatedLog.id ? updatedLog : l))
        );
      });

      socket.on("refreshNotifications", async ({ userId }) => {
        if (userId === currentUserRef.current?.id) {
          const myNotifs = await api.getNotifications(userId).catch(() => []);
          if (Array.isArray(myNotifs)) setUserNotifications(myNotifs);
        }
      });

      // 🥊 Real-time User Registration & Account State Updates
      socket.on("userRegistered", ({ user: newUser, order }) => {
        if (newUser) {
          setAllUsersRoster((prev) => {
            if (prev.some((u) => u.id === newUser.id)) return prev;
            return [newUser, ...prev];
          });
          setAdminStats((prev) => ({
            ...prev,
            activeMembers: prev.activeMembers + 1,
            newSignupsThisWeek: prev.newSignupsThisWeek + 1
          }));
        }
        if (order) {
          setAdminStats((prev) => {
            if (prev.recentTransactions.some((t) => t.id === order.id)) return prev;
            return {
              ...prev,
              recentTransactions: [order, ...prev.recentTransactions]
            };
          });
        }
      });

      socket.on("userUpdated", (updatedUser) => {
        const activeUserId = currentUserRef.current?.id;
        if (updatedUser.id === activeUserId) {
          setCurrentUser((prev) => {
            const merged = { ...prev, ...updatedUser };
            localStorage.setItem("brave_user", JSON.stringify(merged));
            return merged;
          });
        }
        setAllUsersRoster((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
        );
      });

      socket.on("membershipOrderCreated", (newOrder) => {
        setAdminStats((prev) => {
          if (prev.recentTransactions.some((t) => t.id === newOrder.id)) return prev;
          return {
            ...prev,
            recentTransactions: [newOrder, ...prev.recentTransactions]
          };
        });
      });

      socket.on("membershipOrderApproved", ({ orderId, userId, planName, user: updatedUser }) => {
        const activeUserId = currentUserRef.current?.id;
        if (userId === activeUserId) {
          setCurrentUser((prev) => {
            const merged = {
              ...prev,
              ...(updatedUser || {}),
              status: "Active",
              membership: planName || prev?.membership,
              renewalDate: "30 Days Active"
            };
            localStorage.setItem("brave_user", JSON.stringify(merged));
            return merged;
          });
        }

        setAllUsersRoster((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, ...(updatedUser || {}), status: "Active", membership: planName || u.membership, renewalDate: "30 Days Active" }
              : u
          )
        );

        setAdminStats((prev) => ({
          ...prev,
          recentTransactions: prev.recentTransactions.map((tx) =>
            tx.id === orderId ? { ...tx, status: "Confirmed" } : tx
          )
        }));
      });

      socket.on("membershipOrderRejected", ({ orderId, userId, reason }) => {
        const activeUserId = currentUserRef.current?.id;
        if (userId === activeUserId) {
          setCurrentUser((prev) => {
            const merged = {
              ...prev,
              status: "Pending",
              renewalDate: "Order Declined"
            };
            localStorage.setItem("brave_user", JSON.stringify(merged));
            return merged;
          });
        }

        setAllUsersRoster((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, status: "Pending", renewalDate: "Order Declined" }
              : u
          )
        );

        setAdminStats((prev) => ({
          ...prev,
          recentTransactions: prev.recentTransactions.map((tx) =>
            tx.id === orderId ? { ...tx, status: "Declined" } : tx
          )
        }));
      });

      // Synchronize created trainers in real-time
      socket.on("trainerCreated", (newTrainer) => {
        setTrainers((prev) => {
          if (prev.some((t) => t.id === newTrainer.id)) return prev;
          return [...prev, newTrainer];
        });
      });

      socket.on("trainerUpdated", (updatedTrainer) => {
        setTrainers((prev) =>
          prev.map((t) => (t.id === updatedTrainer.id ? updatedTrainer : t))
        );
      });

      socket.on("trainerDeleted", ({ id }) => {
        setTrainers((prev) => prev.filter((t) => t.id !== id));
      });

      // Synchronize programs in real-time
      socket.on("programCreated", (newProgram) => {
        setPrograms((prev) => {
          if (prev.some((p) => p.id === newProgram.id)) return prev;
          return [...prev, newProgram];
        });
      });

      socket.on("programUpdated", (updatedProgram) => {
        setPrograms((prev) =>
          prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p))
        );
      });

      socket.on("programDeleted", ({ id }) => {
        setPrograms((prev) => prev.filter((p) => p.id !== id));
      });
    };
    initAuth();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [loadRemoteData]);

  // ==========================================
  // AUTH METHODS (NODE.JS BACKEND)
  // ==========================================

  const login = async (email, password, role = "user") => {
    try {
      const { user } = await api.login(email, password, role);
      setCurrentUser(user);
      localStorage.setItem("brave_user", JSON.stringify(user));
      await loadRemoteData(user.id, user.role);
      return user;
    } catch (err) {
      console.error("Backend login error:", err.message);
      throw err;
    }
  };

  const register = async (name, email, password, role = "user", initialMembership = "") => {
    try {
      const { user } = await api.register(name, email, password, role, initialMembership);
      setCurrentUser(user);
      localStorage.setItem("brave_user", JSON.stringify(user));
      await loadRemoteData(user.id, user.role);
      return user;
    } catch (err) {
      console.error("Backend register error:", err.message);
      // Throw the genuine error so user sees the validation error on the form
      throw err;
    }
  };

  const logout = async () => {
    api.logout();
    localStorage.removeItem("brave_user");
    setCurrentUser(null);
    setUserNotifications([]);
    setBookings([]);
    setWorkoutLogs([]);
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

    const tempId = "bk-" + Date.now();
    const newBookingData = {
      id: tempId,
      userId: currentUser?.id,
      classTitle: scheduleItem.classTitle,
      trainer: scheduleItem.trainer,
      date: scheduleItem.date || `${scheduleItem.day}, ${scheduleItem.time}`,
      status: scheduleItem.status || "Pending",
      room: scheduleItem.room || "Main Athletic Floor",
      userName: currentUser?.name || "Athlete",
      userEmail: currentUser?.email || ""
    };

    // Optimistic state updates
    setBookings((prev) => [newBookingData, ...prev]);
    setAdminBookings((prev) => [newBookingData, ...prev]);

    // Instantly reduce spots left in schedule view
    setSchedule((prev) =>
      prev.map((sc) => {
        const isMatch = sc.id === scheduleItem.id || 
          (sc.classTitle === scheduleItem.classTitle && sc.trainer === scheduleItem.trainer && sc.day === scheduleItem.day);
        return isMatch ? { ...sc, spotsLeft: Math.max(0, (sc.spotsLeft ?? sc.total) - 1) } : sc;
      })
    );

    // Add immediate confirmation notification to user notifications
    const newNotif = {
      id: "notif-" + Date.now(),
      userId: currentUser?.id,
      title: "Class Spot Requested",
      message: `Your reservation request in ${scheduleItem.classTitle} with coach ${scheduleItem.trainer} is pending admin approval (${newBookingData.date}).`,
      type: "admin_response",
      read: false,
      createdAt: new Date().toISOString()
    };
    setUserNotifications((prev) => [newNotif, ...(Array.isArray(prev) ? prev : [])]);

    try {
      const res = await api.createBooking(newBookingData, {
        name: currentUser?.name,
        email: currentUser?.email
      });

      const serverBooking = res?.data || res;
      if (serverBooking?.id) {
        setBookings((prev) => prev.map((b) => (b.id === tempId ? serverBooking : b)));
        setAdminBookings((prev) => prev.map((b) => (b.id === tempId ? serverBooking : b)));
      }

      if (res?.updatedClass) {
        setSchedule((prev) =>
          prev.map((sc) => (sc.id === res.updatedClass.id ? { ...sc, spotsLeft: res.updatedClass.spotsLeft } : sc))
        );
      }

      return serverBooking || newBookingData;
    } catch (err) {
      console.warn("Saved booking locally:", err.message);
      return newBookingData;
    }
  };

  const updateBooking = async (bookingId, updates) => {
    // Optimistic UI update immediately
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b)));
    setAdminBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b)));
    try {
      const res = await api.updateBooking(bookingId, updates);
      if (res) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...res } : b)));
        setAdminBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...res } : b)));
      }
      return res;
    } catch (err) {
      console.error("Error updating booking on server:", err.message);
      throw err;
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
      const userMeta = {
        userId: currentUser?.id,
        userName: currentUser?.name
      };
      const res = await api.sendConsultationMessage(consultationId, text, sender, userMeta);
      const updatedData = res?.data || res;
      if (updatedData && updatedData.id) {
        setConsultationRequests((prev) => {
          const exists = prev.some((c) => c.id === updatedData.id);
          if (exists) {
            return prev.map((c) => (c.id === updatedData.id ? updatedData : c));
          }
          return [updatedData, ...prev];
        });
      }
      return updatedData;
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
    // 🛡️ Restrict logging if user membership is Pending
    if (currentUser && currentUser.role !== "admin" && (currentUser.status === "Pending" || currentUser.status?.toLowerCase().includes("pending"))) {
      throw new Error("Your membership is currently pending Admin verification. You cannot log workouts until your profile is active.");
    }

    const newLog = { 
      id: "log-" + Date.now(), 
      status: "Pending",
      userName: currentUser?.name || "Athlete",
      userEmail: currentUser?.email || "",
      ...entry 
    };
    setWorkoutLogs((prev) => [newLog, ...prev]);

    try {
      const saved = await api.addWorkoutLog({
        ...entry,
        userName: currentUser?.name,
        userEmail: currentUser?.email
      });
      if (saved) {
        setWorkoutLogs((prev) => prev.map((l) => (l.id === newLog.id ? saved : l)));
      }
    } catch (err) {
      console.warn("Saved workout log locally:", err.message);
    }
  };

  const updateWorkoutLogStatus = async (logId, status) => {
    // Store original status for rollback
    let originalStatus = "Pending";
    setWorkoutLogs((prev) => {
      const orig = prev.find((l) => l.id === logId);
      if (orig) originalStatus = orig.status;
      return prev.map((l) => (l.id === logId ? { ...l, status } : l));
    });
    setAllWorkoutLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status } : l))
    );

    try {
      const updated = await api.updateWorkoutLogStatus(logId, status);
      // Sync with server response if returned
      if (updated) {
        setWorkoutLogs((prev) =>
          prev.map((l) => (l.id === logId ? { ...l, ...updated } : l))
        );
        setAllWorkoutLogs((prev) =>
          prev.map((l) => (l.id === logId ? { ...l, ...updated } : l))
        );
      }
    } catch (err) {
      // Revert optimistic update on failure
      setWorkoutLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, status: originalStatus } : l))
      );
      setAllWorkoutLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, status: originalStatus } : l))
      );
      console.error("Failed to update workout log status on server:", err.message);
      throw err; // Re-throw so the UI button can handle it
    }
  };

  const approveWorkoutLog = async (logId) => {
    return await updateWorkoutLogStatus(logId, "Approved");
  };

  const rejectWorkoutLog = async (logId) => {
    return await updateWorkoutLogStatus(logId, "Rejected");
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
    const tempId = "sc-" + Date.now();
    const newEntry = {
      id: tempId,
      day: classData.day,
      time: classData.time,
      classTitle: classData.classTitle,
      trainer: classData.trainer,
      spotsLeft: Number(classData.total),
      total: Number(classData.total)
    };
    setSchedule((prev) => [newEntry, ...prev]);

    try {
      const res = await api.createClass(newEntry);
      if (res) {
        setSchedule((prev) => {
          const alreadyHasReal = prev.some((sc) => sc.id === res.id);
          if (alreadyHasReal) {
            // Remove the temporary one, keep the real one added by WebSocket
            return prev.filter((sc) => sc.id !== tempId);
          }
          // Otherwise, replace the temporary one with the real one
          return prev.map((sc) => (sc.id === tempId ? res : sc));
        });
      }
      return res || newEntry;
    } catch (err) {
      console.error("Failed to save class to database:", err.message);
      throw err;
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

  const removeAthlete = async (userId) => {
    // Optimistically remove user and their records from Admin state
    setAllUsersRoster((prev) => prev.filter((u) => u.id !== userId));
    setAdminBookings((prev) => prev.filter((b) => b.userId !== userId));
    setConsultationRequests((prev) => prev.filter((c) => c.userId !== userId));
    setAllWorkoutLogs((prev) => prev.filter((w) => w.userId !== userId));

    try {
      await api.deleteUser(userId);
      if (currentUser?.role === "admin") {
        await loadRemoteData(currentUser.id, currentUser.role);
      }
      return true;
    } catch (err) {
      console.error("Failed to delete user:", err.message);
      throw err;
    }
  };


  // ==========================================
  // PROGRAM MANAGEMENT (Admin)
  // ==========================================

  const addProgram = async (programData) => {
    try {
      const newProgram = await api.createProgram(programData);
      setPrograms((prev) => {
        if (prev.some((p) => p.id === newProgram.id)) return prev;
        return [...prev, newProgram];
      });
      return newProgram;
    } catch (err) {
      console.error("Failed to add program:", err.message);
      throw err;
    }
  };

  const editProgram = async (programId, updates) => {
    try {
      const updated = await api.updateProgram(programId, updates);
      setPrograms((prev) => prev.map((p) => (p.id === programId ? updated : p)));
      return updated;
    } catch (err) {
      console.error("Failed to edit program:", err.message);
      throw err;
    }
  };

  const removeProgram = async (programId) => {
    try {
      await api.deleteProgram(programId);
      setPrograms((prev) => prev.filter((p) => p.id !== programId));
    } catch (err) {
      console.error("Failed to remove program:", err.message);
      throw err;
    }
  };

  // ==========================================
  // TRAINER MANAGEMENT (Admin)
  // ==========================================

  const addTrainer = async (trainerData) => {
    try {
      const newTrainer = await api.createTrainer(trainerData);
      setTrainers((prev) => {
        if (prev.some((t) => t.id === newTrainer.id)) return prev;
        return [...prev, newTrainer];
      });
      return newTrainer;
    } catch (err) {
      console.error("Failed to add trainer:", err.message);
      throw err;
    }
  };

  const editTrainer = async (trainerId, updates) => {
    try {
      const updated = await api.updateTrainer(trainerId, updates);
      setTrainers((prev) => prev.map((t) => (t.id === trainerId ? updated : t)));
      return updated;
    } catch (err) {
      console.error("Failed to edit trainer:", err.message);
      throw err;
    }
  };

  const removeTrainer = async (trainerId) => {
    try {
      await api.deleteTrainer(trainerId);
      setTrainers((prev) => prev.filter((t) => t.id !== trainerId));
      return true;
    } catch (err) {
      console.error("Failed to delete trainer:", err.message);
      throw err;
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
        updateBooking,
        cancelBooking,
        workoutLogs,
        addWorkoutLog,
        updateWorkoutLogStatus,
        approveWorkoutLog,
        rejectWorkoutLog,
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
        removeAthlete,

        addTrainer,
        editTrainer,
        removeTrainer,

        allUsersRoster,
        programs,
        addProgram,
        editProgram,
        removeProgram,
        allWorkoutLogs,
        addTrainer,
        editTrainer,
        removeTrainer,
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
