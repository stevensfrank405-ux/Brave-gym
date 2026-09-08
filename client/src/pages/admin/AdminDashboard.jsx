import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  FileSpreadsheet,
  X,
  Phone,
  MessageSquare,
  Activity,
  Zap,
  Target,
  ShieldCheck,
  LayoutDashboard,
  Layers,
  UserCheck,
  Shield,
  ChevronRight,
  Menu,
  PieChart,
  Eye,
  Search,
  BookOpen,
  ClipboardList,
  Flame,
  Dumbbell,
  Award,
  Camera,
  Upload,
  Send
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useGym } from "../../context/GymContext";
import { api } from "../../services/api";

export default function AdminDashboard() {
  const {
    currentUser,
    adminStats,
    schedule,
    setSchedule,
    memberships,
    addMembershipTier,
    removeMembershipTier,
    consultationRequests,
    updateConsultationStatus,
    removeConsultationRequest,
    updateProfile,
    uploadUserAvatar,
    addScheduleClass,
    removeScheduleClass,
    adminBookings,
    allUsersRoster,
    allWorkoutLogs,
    approveMembershipOrder,
    rejectMembershipOrder,
    sendNegotiationMessage,
    removeAthlete,
    updateBooking,
    trainers,
    addTrainer,
    editTrainer,
    removeTrainer
  } = useGym();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDossierAthlete, setSelectedDossierAthlete] = useState(null);
  const [dossierTab, setDossierTab] = useState("profile"); // "profile" | "bookings" | "workouts" | "chat"
  const [athleteSearchQuery, setAthleteSearchQuery] = useState("");
  const [athleteFilterTier, setAthleteFilterTier] = useState("ALL");
  const [inspectRequest, setInspectRequest] = useState(null);
  const [newClassModal, setNewClassModal] = useState(false);
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [newTierModal, setNewTierModal] = useState(false);
  const [newTrainerModal, setNewTrainerModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminChatInput, setAdminChatInput] = useState("");
  const [activeNegotiationThread, setActiveNegotiationThread] = useState(null);
  const chatEndRef = React.useRef(null);

  // Booking management state
  const [manageBookingModal, setManageBookingModal] = useState(false);
  const [selectedManageBooking, setSelectedManageBooking] = useState(null);
  const [manageBookingDate, setManageBookingDate] = useState("");
  const [manageBookingTime, setManageBookingTime] = useState("");
  const [manageBookingStatus, setManageBookingStatus] = useState("Pending");

  // Auto-scroll admin chat
  useEffect(() => {
    if (activeNegotiationThread && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeNegotiationThread, consultationRequests]);

  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: currentUser?.name || "Admin Officer",
    email: currentUser?.email || "admin@bravegym.com",
    roleTitle: currentUser?.role === "admin" ? "Director & Head of Operations" : "Facility Staff",
    accessLevel: currentUser?.role === "admin" ? "Tier-4 Sovereign Master" : "Staff",
    facility: "Brave Gym HQ · Main Arena",
    bio: currentUser?.bio || "Full jurisdiction over facility security protocols, coaches timetable scheduling, athlete subscriptions, and financial audits."
  });

  // Keep admin profile in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setAdminProfileForm((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        bio: currentUser.bio || prev.bio
      }));
    }
  }, [currentUser]);

  const handleCustomAdminPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be under 5MB.");
        return;
      }
      try {
        const publicUrl = await uploadUserAvatar(file);
        if (publicUrl) {
          updateProfile({ avatar: publicUrl });
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          updateProfile({ avatar: reader.result });
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Admin avatar upload failed:", err);
      }
    }
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: adminProfileForm.name,
        bio: adminProfileForm.bio
      });
      setIsEditingAdminProfile(false);
    } catch (err) {
      console.error("Failed to save admin profile:", err);
    }
  };

  const openManageBookingModal = (booking) => {
    setSelectedManageBooking(booking);

    // Parse date and time if it's stored as "YYYY-MM-DD HH:MM"
    let d = "", t = "";
    if (booking.date && booking.date.includes(" ")) {
      const parts = booking.date.split(" ");
      if (parts.length >= 2 && parts[0].includes("-") && parts[1].includes(":")) {
        d = parts[0];
        t = parts[1];
      }
    }

    setManageBookingDate(d);
    setManageBookingTime(t);
    setManageBookingStatus(booking.status || "Pending");
    setManageBookingModal(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedManageBooking) return;
    try {
      const updates = { status: manageBookingStatus };
      if (manageBookingDate && manageBookingTime) {
        updates.date = `${manageBookingDate} ${manageBookingTime}`;
      }
      await updateBooking(selectedManageBooking.id, updates);
      setManageBookingModal(false);
      setSelectedManageBooking(null);
    } catch (err) {
      console.error("Failed to update booking:", err);
      alert("Failed to update booking. See console.");
    }
  };

  // Listen for ?view=profile or ?tab=... from Topbar / mobile drawer
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const viewParam = searchParams.get("view");

    if (viewParam === "profile") {
      setShowAdminProfileModal(true);
      setSearchParams({}, { replace: true });
    } else if (tabParam) {
      if (["overview", "athletes", "bookings", "requests", "schedule", "finances", "tiers", "trainers"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      setSearchParams({}, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchParams, setSearchParams]);

  const [newTierData, setNewTierData] = useState({
    name: "",
    price: "",
    billing: "billed monthly",
    description: "",
    features: "Full 24/7 access\nCoaching consultation\nRecovery suite"
  });

  // Lock background scroll when modal is open
  useEffect(() => {
    if (inspectRequest || newClassModal || showAdminProfileModal || newTierModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [inspectRequest, newClassModal, showAdminProfileModal, newTierModal]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setInspectRequest(null);
        setNewClassModal(false);
        setShowAdminProfileModal(false);
        setNewTierModal(false);
        setNewTrainerModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [newClassData, setNewClassData] = useState({
    day: "Monday",
    time: "07:00 AM",
    classTitle: "Championship Boxing",
    trainer: "Marcus Vance",
    total: 16
  });

  const [newTrainerData, setNewTrainerData] = useState({
    name: "",
    role: "",
    image: "",
    bio: "",
    quote: "",
    specialties: ""
  });
  const [newTrainerImageFile, setNewTrainerImageFile] = useState(null);
  const [isUploadingTrainer, setIsUploadingTrainer] = useState(false);

  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    try {
      setIsUploadingTrainer(true);
      let imageUrl = newTrainerData.image;

      if (newTrainerImageFile) {
        const uploadedUrl = await api.uploadAdminMedia(newTrainerImageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const specsArray = newTrainerData.specialties
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await addTrainer({
        ...newTrainerData,
        image: imageUrl,
        specialties: specsArray
      });
      setNewTrainerModal(false);
      setNewTrainerData({ name: "", role: "", image: "", bio: "", quote: "", specialties: "" });
      setNewTrainerImageFile(null);
    } catch (err) {
      alert("Failed to create trainer. See console.");
    } finally {
      setIsUploadingTrainer(false);
    }
  };

  const handleCreateClass = (e) => {
    e.preventDefault();
    const newEntry = {
      day: newClassData.day,
      time: newClassData.time,
      classTitle: newClassData.classTitle,
      trainer: newClassData.trainer,
      total: Number(newClassData.total)
    };
    addScheduleClass(newEntry);
    setNewClassModal(false);
  };

  const handleCreateTier = (e) => {
    e.preventDefault();
    const newTier = {
      id: "tier-" + Date.now(),
      name: newTierData.name,
      price: Number(newTierData.price) || newTierData.price,
      interval: newTierData.billing || "monthly",
      billing: newTierData.billing || "monthly",
      description: newTierData.description,
      features: newTierData.features.split("\n").filter((f) => f.trim() !== ""),
      popular: false,
      cta: `Claim ${newTierData.name}`
    };
    if (addMembershipTier) {
      addMembershipTier(newTier);
    }
    setNewTierModal(false);
    setNewTierData({
      name: "",
      price: "",
      billing: "billed monthly",
      description: "",
      features: "Full 24/7 access\nCoaching consultation\nRecovery suite"
    });
  };

  const handleDeleteClass = (id) => {
    removeScheduleClass(id);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pendingOrdersCount = (adminStats?.recentTransactions || []).filter(t => t.status === "Pending").length;

  // Filter out any admin users from client/athlete monitoring and live chats
  const athleteRoster = (allUsersRoster || []).filter(
    (u) => u.role !== "admin" && u.id !== "usr-admin"
  );
  const athleteConsultationRequests = (consultationRequests || []).filter(
    (req) =>
      req.userId !== "usr-admin" &&
      !(allUsersRoster || []).some(
        (u) => (u.id === req.userId || (req.userName && u.name?.toLowerCase() === req.userName?.toLowerCase())) && u.role === "admin"
      )
  );

  const sidebarNavItems = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard, desc: "Live KPI Telemetry" },
    { id: "orders", label: "Membership Orders", icon: ShieldCheck, badge: pendingOrdersCount, desc: "Verify Athlete Subscriptions" },
    { id: "athletes", label: "Athlete Monitoring", icon: UserCheck, badge: athleteRoster.length, desc: "Full Client Dossier Monitoring" },
    { id: "bookings", label: "Athlete Bookings", icon: Users, badge: adminBookings?.length, desc: "Reserved Spots Roster" },
    { id: "requests", label: "Live Athlete Chats", icon: MessageSquare, badge: athleteConsultationRequests.length, desc: "Real-Time Direct Negotiations" },
    { id: "schedule", label: "Timetable & Classes", icon: Calendar, desc: "Arena Scheduling" },
    { id: "finances", label: "Finances & Spatial", icon: DollarSign, desc: "Revenue & Zone Share" },
    { id: "trainers", label: "Trainers & Coaches", icon: UserCheck, desc: "Staff Profiles" },
    { id: "tiers", label: "Membership Tiers", icon: Flame, desc: "Manage & Create Tiers" }
  ];

  const [mobileAdminMenu, setMobileAdminMenu] = useState(false);

  // Dynamic calculations for Revenue and Booking Gauges
  const revenueValue = adminStats?.monthlyRevenue || 0;
  // Adaptive target so gauge fills dynamically as numbers increase:
  const revenueTarget = Math.max(1000, Math.ceil(Math.max(revenueValue, 1) / 500) * 500);
  const revenuePercent = revenueValue > 0 ? Math.min(100, Math.round((revenueValue / revenueTarget) * 100)) : 0;

  const totalBookingsCount = adminBookings?.length || 0;
  const bookingsTarget = Math.max(10, Math.ceil(Math.max(totalBookingsCount, 1) / 10) * 10);
  const bookingsPercent = totalBookingsCount > 0 ? Math.min(100, Math.round((totalBookingsCount / bookingsTarget) * 100)) : 0;

  const activeMembersCount = adminStats?.activeMembers || 0;
  const membersTarget = Math.max(10, Math.ceil(Math.max(activeMembersCount, 1) / 10) * 10);
  const membersPercent = activeMembersCount > 0 ? Math.min(100, Math.round((activeMembersCount / membersTarget) * 100)) : 0;

  // Real membership tier breakdown from verified transactions
  const totalTxCount = adminStats?.recentTransactions?.length || 0;
  const blackTierCount = (adminStats?.recentTransactions || []).filter(t => t.plan?.toLowerCase().includes("black")).length;
  const obsidianTierCount = (adminStats?.recentTransactions || []).filter(t => t.plan?.toLowerCase().includes("obsidian")).length;
  const trialTierCount = (adminStats?.recentTransactions || []).filter(t => t.plan?.toLowerCase().includes("trial")).length;
  const otherTierCount = Math.max(0, totalTxCount - blackTierCount - obsidianTierCount - trialTierCount);

  const blackTierPct = totalTxCount > 0 ? (blackTierCount / totalTxCount) * 100 : 0;
  const obsidianTierPct = totalTxCount > 0 ? (obsidianTierCount / totalTxCount) * 100 : 0;
  const trialTierPct = totalTxCount > 0 ? (trialTierCount / totalTxCount) * 100 : 0;
  const otherTierPct = totalTxCount > 0 ? (otherTierCount / totalTxCount) * 100 : 0;

  return (
    <div className="pt-20 bg-[#0A0A0A] min-h-screen text-white flex">

      {/* 🧭 Modern Real-Time Sticky Admin Sidebar (Desktop) */}
      <aside
        data-lenis-prevent
        className={`transition-all duration-300 bg-[#121212] border-r border-white/10 hidden md:flex flex-col justify-between shrink-0 z-30 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain ${sidebarCollapsed ? "w-20" : "w-72"
          }`}>
        {/* Top Header inside Sidebar */}
        <div className="p-5 border-b border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            {(!sidebarCollapsed || mobileAdminMenu) && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono uppercase text-[10px] tracking-widest text-[#8C8C8C]">Live Operational HQ</span>
              </div>
            )}

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:block p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-colors ml-auto"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Mobile close toggle */}
            <button
              onClick={() => setMobileAdminMenu(false)}
              className="md:hidden p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-colors ml-auto"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {(!sidebarCollapsed || mobileAdminMenu) && (
            <div>
              <h2 className="font-display font-extrabold text-xl uppercase tracking-tight text-white">
                Admin Console
              </h2>
              <p className="text-[11px] text-[#8C8C8C]">Director Command & Roster</p>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-3 space-y-1.5 flex-1">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileAdminMenu(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-sm transition-all text-left group relative ${isActive
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-[#8C8C8C] hover:text-white hover:bg-white/5"
                  }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-white/70 group-hover:text-white"}`} />

                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-2 ${isActive ? "bg-black text-white" : "bg-amber-400 text-black shadow"
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono block truncate ${isActive ? "text-black/70" : "text-[#8C8C8C]"
                      }`}>
                      {item.desc}
                    </span>
                  </div>
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-black rounded-r" />
                )}
              </button>
            );
          })}

          {/* Quick Action Buttons inside Sidebar */}
          {!sidebarCollapsed ? (
            <div className="pt-4 border-t border-white/10 space-y-2 px-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8C8C] block px-2">
                Fast Directives
              </span>
              <button
                onClick={() => setNewClassModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-xs uppercase tracking-wider font-semibold transition-all group"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Create A Session</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("tiers");
                  setNewTierModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-xs uppercase tracking-wider font-semibold transition-all group"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Create Membership Tier</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/10 space-y-2 text-center">
              <button
                onClick={() => setNewClassModal(true)}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-emerald-400 mx-auto block"
                title="Create A Session"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveTab("tiers");
                  setNewTierModal(true);
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-amber-400 mx-auto block"
                title="Create Membership Tier"
              >
                <Flame className="w-4 h-4" />
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar System Telemetry & Admin Profile Trigger */}
        {!sidebarCollapsed ? (
          <div
            onClick={() => setShowAdminProfileModal(true)}
            className="p-4 m-3 bg-black/60 hover:bg-black/90 cursor-pointer rounded border border-white/10 hover:border-white/30 transition-all space-y-2 group"
            title="Click to view & edit Admin Profile"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8C8C] uppercase">
              <span>Security Clearance</span>
              <span className="text-emerald-400 font-bold">L-4 Master</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                HQ
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                  <span>{currentUser?.name || "Gym Director"}</span>
                  <Edit3 className="w-3 h-3 text-[#8C8C8C] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-[#8C8C8C] truncate">{currentUser?.email || "admin@bravegym.com"}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C8C8C]">
              <span>Sync Status</span>
              <span className="text-emerald-400 font-mono">Live Master</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowAdminProfileModal(true)}
            className="p-3 text-center border-t border-white/10 cursor-pointer hover:bg-white/5"
            title="Admin Profile"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          </div>
        )}
      </aside>

      {/* 🖥️ Main Workstation Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-10 min-w-0 pb-20 w-full">

        {/* Top bar header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-[10px] uppercase font-mono tracking-widest text-white mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Administrative Command Suite
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight">
              {sidebarNavItems.find((t) => t.id === activeTab)?.label || "Brave HQ Management"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewClassModal(true)}
              className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-[#F5F5F3] flex items-center gap-1.5 transition-all shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Class Slot
            </button>
          </div>
        </div>

        {/* 1. Overview KPIs with Modern Circular Animated Radial Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* Circular Graph 1: Floor Occupancy */}
          <div className="p-5 bg-[#141414] border border-white/10 rounded-sm flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all group">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#8C8C8C] uppercase font-mono tracking-wider whitespace-nowrap">
                <Activity className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Floor Occupancy</span>
              </div>
              <div className="font-display text-2xl xl:text-3xl font-extrabold text-white">
                {adminStats.todayOccupancy}%
              </div>
              <p className="text-[10px] text-[#8C8C8C] whitespace-nowrap">
                {totalBookingsCount > 0 ? `${totalBookingsCount} arena bookings scheduled` : "Live arena floor status"}
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-white/10"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] transition-all duration-1000 ease-out"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - adminStats.todayOccupancy / 100)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
              <span className="absolute font-mono text-[10px] font-bold text-white">
                {adminStats.todayOccupancy}%
              </span>
            </div>
          </div>

          {/* Circular Graph 2: Revenue Target Fulfilment */}
          <div className="p-5 bg-[#141414] border border-white/10 rounded-sm flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all group">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#8C8C8C] uppercase font-mono tracking-wider whitespace-nowrap">
                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Monthly Revenue</span>
              </div>
              <div className="font-display text-2xl xl:text-3xl font-extrabold text-white whitespace-nowrap">
                ${revenueValue.toLocaleString()}
              </div>
              <p className="text-[10px] text-emerald-400 font-mono whitespace-nowrap">
                Target: ${revenueTarget.toLocaleString()} ({revenuePercent}%)
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-white/10"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)] transition-all duration-1000 ease-out"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - revenuePercent / 100)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
              <span className="absolute font-mono text-[10px] font-bold text-emerald-400">
                {revenuePercent}%
              </span>
            </div>
          </div>

          {/* Circular Graph 3: Active Athlete Retention */}
          <div className="p-5 bg-[#141414] border border-white/10 rounded-sm flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all group">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#8C8C8C] uppercase font-mono tracking-wider whitespace-nowrap">
                <Users className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Active Athletes</span>
              </div>
              <div className="font-display text-2xl xl:text-3xl font-extrabold text-white">
                {activeMembersCount}
              </div>
              <p className="text-[10px] text-white/60 whitespace-nowrap">
                Target: {membersTarget} ({membersPercent}%)
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-white/10"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)] transition-all duration-1000 ease-out"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - membersPercent / 100)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
              <span className="absolute font-mono text-[10px] font-bold text-amber-400">
                {membersPercent}%
              </span>
            </div>
          </div>

          {/* Circular Graph 4: Class Booking Utilization */}
          <div className="p-5 bg-[#141414] border border-white/10 rounded-sm flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all group">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#8C8C8C] uppercase font-mono tracking-wider whitespace-nowrap">
                <Zap className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Total Bookings</span>
              </div>
              <div className="font-display text-2xl xl:text-3xl font-extrabold text-white">
                {totalBookingsCount}
              </div>
              <p className="text-[10px] text-blue-400 font-mono whitespace-nowrap">
                Capacity: {bookingsTarget} ({bookingsPercent}%)
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-white/10"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.7)] transition-all duration-1000 ease-out"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - bookingsPercent / 100)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
              <span className="absolute font-mono text-[10px] font-bold text-blue-400">
                {bookingsPercent}%
              </span>
            </div>
          </div>

        </div>

        {/* Real-time Pending Orders Banner if any pending orders exist */}
        {pendingOrdersCount > 0 && activeTab !== "orders" && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 border border-amber-400/40">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase font-display tracking-wide">
                  {pendingOrdersCount} Pending Membership {pendingOrdersCount === 1 ? "Order" : "Orders"} Awaiting Verification
                </h4>
                <p className="text-xs text-[#8C8C8C]">
                  Athletes cannot book classes or access facility services until their membership is reviewed and confirmed.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("orders")}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors self-start sm:self-center shrink-0"
            >
              Review Orders
            </button>
          </div>
        )}

        {/* Tab Content: Membership Orders & Real-time Verification */}
        {(activeTab === "overview" || activeTab === "orders") && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-white uppercase">
                    Membership Orders & Payment Plans
                  </h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${pendingOrdersCount > 0 ? "bg-amber-400 text-black animate-pulse" : "bg-white/10 text-white"
                    }`}>
                    {pendingOrdersCount} Pending Approval
                  </span>
                </div>
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div className="space-y-4">
              {adminStats?.recentTransactions && adminStats.recentTransactions.length > 0 ? (
                adminStats.recentTransactions.map((order) => {
                  const athleteUser = (allUsersRoster || []).find(
                    (u) => u.id === order.userId || u.name?.toLowerCase() === order.member?.toLowerCase()
                  );
                  const isPending = order.status === "Pending";
                  const isConfirmed = order.status === "Confirmed";

                  // Find or associate consultation negotiation thread
                  const userConsultation = (consultationRequests || []).find(
                    (c) =>
                      (order.userId && (c.userId === order.userId || c.id === `order-user-${order.userId}`)) ||
                      c.id === `order-${order.id}` ||
                      c.userName?.toLowerCase() === order.member?.toLowerCase() ||
                      c.name?.toLowerCase() === order.member?.toLowerCase()
                  );

                  return (
                    <div
                      key={order.id}
                      className={`p-5 rounded-sm border transition-all ${isPending
                        ? "bg-[#18150e] border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.08)]"
                        : isConfirmed
                          ? "bg-[#141414] border-white/10"
                          : "bg-[#141414] border-red-500/20"
                        }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Member Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-sm bg-[#202020] border border-white/10 flex items-center justify-center shrink-0 font-display font-bold text-lg text-white">
                            {order.member ? order.member.charAt(0).toUpperCase() : "U"}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-lg font-bold text-white uppercase">
                                {order.member}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-bold ${isPending
                                  ? "bg-amber-400 text-black"
                                  : isConfirmed
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                  }`}
                              >
                                {order.status}
                              </span>
                              {isPending && (
                                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                  Services Locked Until Approved
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#8C8C8C]">
                              Plan: <strong className="text-white">{order.plan}</strong> · Amount: <strong className="text-white">{order.amount}</strong> · Order #{order.id}
                            </p>

                            {athleteUser && (
                              <p className="text-[11px] text-[#8C8C8C] font-mono">
                                Email: {athleteUser.email} · Registered: {athleteUser.createdAt ? new Date(athleteUser.createdAt).toLocaleDateString() : "Active"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                          {/* Chat / Negotiate Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              const threadId = userConsultation?.id || (order.userId ? `order-user-${order.userId}` : `order-${order.id}`);
                              setActiveNegotiationThread(userConsultation || {
                                id: threadId,
                                name: order.member,
                                email: athleteUser?.email || "athlete@bravegym.com",
                                chatMessages: [],
                                chatHistory: []
                              });
                            }}
                            className="px-3 py-2 bg-[#202020] hover:bg-[#2a2a2a] text-white border border-white/15 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            <span>Discuss / Negotiate</span>
                          </button>

                          {/* Inspect Athlete Dossier */}
                          {athleteUser && (
                            <button
                              type="button"
                              onClick={() => setSelectedDossierAthlete(athleteUser)}
                              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Dossier</span>
                            </button>
                          )}

                          {/* Approve / Reject Controls */}
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`Confirm and activate membership "${order.plan}" for athlete ${order.member}?`)) {
                                    try {
                                      await approveMembershipOrder(order.id, order.userId || athleteUser?.id, order.plan);
                                    } catch (e) {
                                      alert("Failed to confirm order: " + e.message);
                                    }
                                  }
                                }}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve & Activate</span>
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  const reason = window.prompt(`Provide reason for rejecting order #${order.id}:`, "Payment verification incomplete");
                                  if (reason) {
                                    try {
                                      await rejectMembershipOrder(order.id, order.userId || athleteUser?.id, reason);
                                    } catch (e) {
                                      alert("Failed to reject order: " + e.message);
                                    }
                                  }
                                }}
                                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-mono text-[#8C8C8C] uppercase flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Order Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 bg-[#141414] border border-white/10 rounded-sm text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-[#8C8C8C] mx-auto" />
                  <h4 className="text-white font-bold text-sm uppercase">No Orders On Record</h4>
                  <p className="text-xs text-[#8C8C8C]">
                    When an athlete registers or chooses a membership tier, their order appears here for verification.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Athlete Roster & Client Dossier Monitoring */}
        {(activeTab === "overview" || activeTab === "athletes") && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-white uppercase">
                    Athlete Dossiers & Client Monitoring
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400 text-black shadow-sm">
                    {athleteRoster.length} Registered Athletes
                  </span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 border border-white/10 rounded-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search athlete by name, email, discipline, or ID..."
                  value={athleteSearchQuery}
                  onChange={(e) => setAthleteSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#1B1B1B] border border-white/10 rounded text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#8C8C8C] uppercase hidden md:inline">Tier:</span>
                <select
                  value={athleteFilterTier}
                  onChange={(e) => setAthleteFilterTier(e.target.value)}
                  className="bg-[#1B1B1B] border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="Black Tier">Black Tier</option>
                  <option value="Obsidian Elite">Obsidian Elite</option>
                  <option value="Iron Standard">Iron Standard</option>
                  <option value="Free Tier">Free / Standard</option>
                </select>
              </div>
            </div>

            {/* Roster Cards / Table */}
            <div className="bg-[#141414] border border-white/10 rounded-sm divide-y divide-white/10">
              {(() => {
                const filteredAthletes = athleteRoster.filter((ath) => {
                  const q = athleteSearchQuery.toLowerCase();
                  const matchesQuery =
                    !q ||
                    ath.name?.toLowerCase().includes(q) ||
                    ath.email?.toLowerCase().includes(q) ||
                    ath.discipline?.toLowerCase().includes(q) ||
                    ath.weight_class?.toLowerCase().includes(q) ||
                    ath.id?.toLowerCase().includes(q);

                  const tier = ath.membership || ath.membership_tier || "Brave Trial";
                  const matchesTier =
                    athleteFilterTier === "ALL" ||
                    (athleteFilterTier === "Free Tier" && (tier.toLowerCase().includes("free") || tier.toLowerCase().includes("trial") || tier.toLowerCase().includes("standard"))) ||
                    tier.toLowerCase().includes(athleteFilterTier.toLowerCase());

                  return matchesQuery && matchesTier;
                });

                if (filteredAthletes.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-[#8C8C8C]">
                      {athleteRoster.length === 0
                        ? "No registered athletes recorded yet. As athletes register and book, their dossiers will populate here."
                        : "No athletes match the current search or tier filter."}
                    </div>
                  );
                }

                return filteredAthletes.map((ath) => {
                  // Compute athlete's active bookings
                  const athleteBookings = (adminBookings || []).filter(
                    (b) => b.userId === ath.id || (ath.email && b.userEmail?.toLowerCase() === ath.email?.toLowerCase())
                  );

                  // Compute athlete's workout logs
                  const athleteLogs = (allWorkoutLogs || []).filter(
                    (l) => (l.user_id && l.user_id === ath.id) || (l.userId && l.userId === ath.id)
                  );

                  // Compute athlete's consultation requests & chats
                  const athleteRequests = (athleteConsultationRequests || []).filter(
                    (r) =>
                      r.userId === ath.id ||
                      (ath.email && r.athleteEmail?.toLowerCase() === ath.email?.toLowerCase())
                  );

                  const tierName = ath.membership || ath.membership_tier || "Brave Trial";
                  const tierColor = tierName.toLowerCase().includes("obsidian")
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : tierName.toLowerCase().includes("black")
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-white/10 text-white/80 border-white/20";

                  return (
                    <div
                      key={ath.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center text-amber-400 font-display font-bold text-lg shrink-0">
                          {ath.avatar_url ? (
                            <img
                              src={ath.avatar_url}
                              alt={ath.name}
                              className="w-full h-full object-cover grayscale contrast-125"
                            />
                          ) : (
                            (ath.name || "A").substring(0, 2).toUpperCase()
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-display text-base font-bold text-white uppercase">
                              {ath.name || "Unnamed Athlete"}
                            </h4>
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${tierColor}`}>
                              {tierName}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8C8C8C]">
                            {ath.email && <span>✉️ {ath.email}</span>}
                            {ath.phone && <span>📞 {ath.phone}</span>}
                            {ath.weight_class && <span>⚖️ {ath.weight_class}</span>}
                            {ath.discipline && <span>🥋 {ath.discipline}</span>}
                          </div>

                          {/* Mini telemetry pills */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              {athleteBookings.length} Booked Classes
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                              <Dumbbell className="w-3 h-3 text-emerald-400" />
                              {athleteLogs.length} Training Logs
                            </span>
                            {athleteRequests.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                                <MessageSquare className="w-3 h-3" />
                                {athleteRequests.length} Intake Inquiries
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button: Inspect Complete Dossier */}
                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedDossierAthlete(ath)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-md"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Dossier</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to completely remove ${ath.name || ath.email}? This will delete all their bookings and data.`)) {
                              removeAthlete(ath.id);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors border border-red-500/20"
                          title="Remove Athlete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Tab Content: Athlete Bookings (Real-Time Class Reservations) */}
        {(activeTab === "overview" || activeTab === "bookings") && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-white uppercase">
                    Athlete Bookings Roster
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-black shadow-sm">
                    {adminBookings?.length || 0} Booked
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-sm divide-y divide-white/10">
              {adminBookings && adminBookings.length > 0 ? (
                adminBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h4 className="font-display text-base sm:text-lg font-bold text-white uppercase">
                          {bk.userName}
                        </h4>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/80">
                          {bk.classTitle}
                        </span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${bk.status === "Pending" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                          bk.status === "Confirmed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                            "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          }`}>
                          {bk.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#8C8C8C]">
                        {bk.userEmail && <span>✉️ {bk.userEmail}</span>}
                        <span>🏋️ Coach: {bk.trainer}</span>
                        <span>•</span>
                        <span>🏟️ {bk.room}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto">
                      <span className="text-xs font-mono text-white bg-white/5 px-3 py-1.5 rounded border border-white/10">
                        {bk.date}
                      </span>
                      {bk.status === "Pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateBooking(bk.id, { status: "Confirmed" })}
                            className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition-colors rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateBooking(bk.id, { status: "Rejected" })}
                            className="px-3 py-1 text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => openManageBookingModal(bk)}
                        className="px-3 py-1 text-xs font-bold bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black transition-colors rounded"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#8C8C8C]">
                  No athlete reservations logged yet. When athletes book classes in the curriculum schedule, they will appear here instantly.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Live Athlete Chats & Real-Time Negotiation */}
        {(activeTab === "overview" || activeTab === "requests") && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-white uppercase">
                    Live Athlete Chats & Support
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400 text-black shadow-sm">
                    {athleteConsultationRequests.length} Active Threads
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-sm divide-y divide-white/10">
              {athleteConsultationRequests && athleteConsultationRequests.length > 0 ? (
                athleteConsultationRequests.map((req) => {
                  const athleteUser = athleteRoster.find(
                    (u) => u.id === req.userId || u.name?.toLowerCase() === (req.userName || req.name)?.toLowerCase()
                  );
                  const matchingOrder = (adminStats?.recentTransactions || []).find(
                    (tx) => tx.userId === req.userId || tx.member?.toLowerCase() === (req.userName || req.name)?.toLowerCase()
                  );
                  const msgCount = (req.chatMessages || req.chatHistory || []).length;
                  const latestMsg = (req.chatMessages || req.chatHistory || [])[msgCount - 1];

                  return (
                    <div
                      key={req.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase border border-amber-400/30">
                            {(req.userName || req.name || "A")[0]}
                          </div>
                          <h4 className="font-display text-base sm:text-lg font-bold text-white uppercase">
                            {req.userName || req.name || "Athlete"}
                          </h4>
                          {athleteUser?.email && (
                            <span className="text-xs font-mono text-[#8C8C8C]">
                              {athleteUser.email}
                            </span>
                          )}
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${(athleteUser?.status || req.status) === "Pending"
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}>
                            {athleteUser?.status || req.status || "Active"}
                          </span>
                        </div>

                        {latestMsg ? (
                          <div className="text-xs bg-[#1A1A1A] p-2.5 rounded border border-white/10 text-white/90">
                            <span className="text-[10px] font-mono uppercase text-[#8C8C8C] block mb-0.5">
                              Latest Message ({latestMsg.sender === "admin" ? "Director HQ" : "Athlete"}):
                            </span>
                            <p className="line-clamp-1 italic">"{latestMsg.text}"</p>
                          </div>
                        ) : (
                          <div className="text-xs text-[#8C8C8C] italic">
                            No messages exchanged yet in this thread.
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#8C8C8C] font-mono">
                          <span>Channel: {req.serviceType || "Membership Discussion"}</span>
                          <span>•</span>
                          <span>{msgCount} {msgCount === 1 ? "Message" : "Messages"}</span>
                          {matchingOrder && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400">Order: {matchingOrder.plan} ({matchingOrder.status})</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(matchingOrder || null);
                            setActiveNegotiationThread(req);
                          }}
                          className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase rounded transition-colors flex items-center justify-center shadow"
                          title="Open Live Chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {athleteUser && (
                          <button
                            type="button"
                            onClick={() => setSelectedDossierAthlete(athleteUser)}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 rounded flex items-center justify-center transition-colors"
                            title="Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeConsultationRequest(req.id)}
                          className="px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded font-mono text-[10px] uppercase font-bold transition-colors"
                          title="Delete Chat Thread"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-xs text-[#8C8C8C] space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-[#8C8C8C]/40" />
                  <p className="text-white/80 font-semibold">No Active Chat Threads</p>
                  <p className="text-[11px] max-w-sm mx-auto">
                    When athletes start a negotiation from their dashboard or inquire regarding a membership order, their real-time channel will appear here instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Schedule Management */}
        {(activeTab === "overview" || activeTab === "schedule") && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Weekly Session Roster</h2>
              </div>
              <button
                onClick={() => setNewClassModal(true)}
                className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-[#F5F5F3] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Class
              </button>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-sm divide-y divide-white/10">
              {schedule && schedule.length > 0 ? (
                schedule.map((sc) => (
                  <div key={sc.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:bg-white/[0.02]">
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                      <div className="w-24 sm:w-28 shrink-0">
                        <span className="font-display font-bold text-white uppercase text-xs sm:text-sm block">{sc.day}</span>
                        <span className="text-[11px] sm:text-xs font-mono text-[#8C8C8C]">{sc.time}</span>
                      </div>

                      <div>
                        <h4 className="font-display text-sm sm:text-base font-bold text-white uppercase">{sc.classTitle}</h4>
                        <span className="text-xs text-[#8C8C8C]">Instructor: {sc.trainer}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-mono text-white block">
                          {sc.spotsLeft} of {sc.total} spots left
                        </span>
                        <span className="text-[11px] text-[#8C8C8C]">
                          {Math.round(((sc.total - sc.spotsLeft) / sc.total) * 100)}% Booked
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteClass(sc.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#8C8C8C] space-y-2">
                  <p>No timetable sessions scheduled yet.</p>
                  <p className="text-white/60">Click 'Schedule Class' above to create a live combine session for athletes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Financial & Operations Audit */}
        {(activeTab === "overview" || activeTab === "finances") && (
          <div className="space-y-6 pt-4">

            {/* Real Financial Analytics Donut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Circular Chart 1: Plan Distribution */}
              <div className="p-6 bg-[#141414] border border-white/10 rounded-sm space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white uppercase">Membership Tier Share</h3>
                  </div>
                  <PieChart className="w-4 h-4 text-white/60" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
                  {/* Concentric / Segmented SVG Donut */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#262626" strokeWidth="4" />
                      {totalTxCount > 0 ? (
                        <>
                          {/* Black Tier Slice (White) */}
                          {blackTierPct > 0 && (
                            <circle
                              cx="18" cy="18" r="15.9155" fill="none" stroke="#FFFFFF" strokeWidth="4"
                              strokeDasharray={`${blackTierPct} ${100 - blackTierPct}`}
                              strokeDashoffset="0"
                              className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                            />
                          )}
                          {/* Obsidian Tier Slice (Amber) */}
                          {obsidianTierPct > 0 && (
                            <circle
                              cx="18" cy="18" r="15.9155" fill="none" stroke="#FBBF24" strokeWidth="4"
                              strokeDasharray={`${obsidianTierPct} ${100 - obsidianTierPct}`}
                              strokeDashoffset={`-${blackTierPct}`}
                              className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                            />
                          )}
                          {/* Trial Passes Slice (Blue) */}
                          {trialTierPct > 0 && (
                            <circle
                              cx="18" cy="18" r="15.9155" fill="none" stroke="#60A5FA" strokeWidth="4"
                              strokeDasharray={`${trialTierPct} ${100 - trialTierPct}`}
                              strokeDashoffset={`-${blackTierPct + obsidianTierPct}`}
                              className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
                            />
                          )}
                          {/* Other Custom Tiers (Emerald) */}
                          {otherTierPct > 0 && (
                            <circle
                              cx="18" cy="18" r="15.9155" fill="none" stroke="#34D399" strokeWidth="4"
                              strokeDasharray={`${otherTierPct} ${100 - otherTierPct}`}
                              strokeDashoffset={`-${blackTierPct + obsidianTierPct + trialTierPct}`}
                              className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                            />
                          )}
                        </>
                      ) : null}
                    </svg>
                    <div className="absolute text-center">
                      <span className="font-display text-lg font-bold text-white block leading-none">
                        ${revenueValue.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-mono text-[#8C8C8C] uppercase">Live Gross</span>
                    </div>
                  </div>

                  {/* Dynamic Legend based on active tiers or actual orders */}
                  <div className="space-y-2 text-xs font-mono w-full sm:w-auto">
                    {totalTxCount > 0 ? (
                      <>
                        {blackTierCount > 0 && (
                          <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="flex items-center gap-2 text-white">
                              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_white]" />
                              Black Tier
                            </span>
                            <strong className="text-white">{blackTierCount} Orders ({Math.round(blackTierPct)}%)</strong>
                          </div>
                        )}
                        {obsidianTierCount > 0 && (
                          <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="flex items-center gap-2 text-amber-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                              Obsidian Private
                            </span>
                            <strong className="text-white">{obsidianTierCount} Orders ({Math.round(obsidianTierPct)}%)</strong>
                          </div>
                        )}
                        {trialTierCount > 0 && (
                          <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="flex items-center gap-2 text-blue-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                              Brave Trial Passes
                            </span>
                            <strong className="text-white">{trialTierCount} Orders ({Math.round(trialTierPct)}%)</strong>
                          </div>
                        )}
                        {otherTierCount > 0 && (
                          <div className="flex items-center justify-between sm:justify-start gap-3">
                            <span className="flex items-center gap-2 text-emerald-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                              Custom Tiers
                            </span>
                            <strong className="text-white">{otherTierCount} Orders ({Math.round(otherTierPct)}%)</strong>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[#8C8C8C] text-[11px] space-y-1">
                        <p className="text-white/80 font-semibold">Fresh Ledger · Zero Orders</p>
                        <p>When an athlete orders a membership tier or books a paid session, live distribution slices appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verified Financial Health Status */}
              <div className="p-6 bg-[#141414] border border-white/10 rounded-sm space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-end justify-end">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white uppercase">Financial Settlement Status</h3>
                </div>

                <div className="space-y-3 py-2">
                  <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                    <span className="text-[#8C8C8C]">Total Ledger Entries:</span>
                    <strong className="text-white font-bold">{adminStats.recentTransactions.length} Paid Records</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                    <span className="text-[#8C8C8C]">Registered Athlete Base:</span>
                    <strong className="text-white font-bold">{adminStats.activeMembers} Profiles</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#8C8C8C]">Settled Revenue:</span>
                    <strong className="text-emerald-400 font-bold">${adminStats.monthlyRevenue.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded text-[11px] text-[#8C8C8C]">
                  All payments and membership subscriptions sync in real-time with your Postgres database.
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Recent Transactions</h2>
              </div>
              <button className="text-xs uppercase tracking-wider font-semibold text-white/80 hover:text-white flex items-center gap-1.5 border border-white/20 px-3 py-1.5 rounded">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-sm divide-y divide-white/10">
              {adminStats.recentTransactions && adminStats.recentTransactions.length > 0 ? (
                adminStats.recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display text-base font-bold text-white uppercase">{tx.member}</h4>
                      <span className="text-xs text-[#8C8C8C]">{tx.plan} · Ref #{tx.id}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="font-display font-bold text-lg text-white block">{tx.amount}</span>
                        <span className="text-[11px] text-[#8C8C8C]">{tx.date}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#8C8C8C]">
                  No transactions recorded yet. When members order or upgrade membership plans, verified ledger records will appear here.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Membership Tiers Management */}
        {(activeTab === "overview" || activeTab === "tiers") && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Membership Tiers & Access Plans</h2>
              </div>
              <button
                onClick={() => setNewTierModal(true)}
                className="px-4 py-2 bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-amber-300 flex items-center gap-1.5 transition-all shadow"
              >
                <Plus className="w-3.5 h-3.5" /> Create Membership Tier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {memberships && memberships.length > 0 ? (
                memberships.map((tier) => (
                  <div key={tier.id} className="p-6 bg-[#141414] border border-white/10 rounded-sm space-y-4 shadow-lg hover:border-white/30 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold">
                          Active Tier
                        </span>
                        <Flame className="w-4 h-4 text-amber-400" />
                      </div>

                      <h3 className="font-display text-xl font-bold text-white uppercase">{tier.name}</h3>

                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl font-extrabold text-white">${tier.price}</span>
                        <span className="text-xs text-[#8C8C8C]">/{tier.billing || tier.interval || "monthly"}</span>
                      </div>

                      <p className="text-xs text-[#8C8C8C] leading-relaxed">{tier.description}</p>

                      <div className="pt-3 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] uppercase font-mono text-[#8C8C8C] block">Included Features:</span>
                        {tier.features?.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8C8C8C]">
                      <span className="font-mono">Ref #{tier.id}</span>
                      <button
                        onClick={() => removeMembershipTier && removeMembershipTier(tier.id)}
                        className="text-rose-400 hover:text-rose-300 hover:underline text-xs cursor-pointer"
                      >
                        Delete Tier
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-xs text-[#8C8C8C] bg-[#141414] border border-white/10 rounded-sm">
                  No membership tiers active. Click 'Create Membership Tier' to define access privileges.
                </div>
              )}
            </div>
          </div>)}
        {/* 8. TRAINERS TAB */},
        {(activeTab === "overview" || activeTab === "trainers") && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white uppercase tracking-tight">Staff Profiles</h2>
                <p className="text-[#8C8C8C] text-xs">Manage professional trainers, roles, and specialties.</p>
              </div>
              <button
                onClick={() => setNewTrainerModal(true)}
                className="bg-white text-black px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-sm hover:bg-[#E5E5E5] transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Trainer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trainers?.length > 0 ? (
                trainers.map((trainer) => (
                  <div key={trainer.id} className="bg-[#141414] border border-white/10 p-5 rounded-sm flex flex-col justify-between">
                    <div className="space-y-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/20">
                          {trainer.image ? (
                            <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#1F1F1F] flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-white/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-white uppercase">{trainer.name}</h3>
                          <span className="text-[10px] uppercase font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">{trainer.role}</span>
                        </div>
                      </div>

                      <p className="text-xs text-white/80 line-clamp-2 italic">"{trainer.quote}"</p>

                      <div className="pt-3 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] uppercase font-mono text-[#8C8C8C] block">Specialties:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {trainer.specialties?.map((spec, i) => (
                            <span key={i} className="text-[10px] uppercase bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8C8C8C]">
                      <span className="font-mono">Ref #{trainer.id}</span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${trainer.name}?`)) {
                            removeTrainer(trainer.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 hover:underline text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-xs text-[#8C8C8C] bg-[#141414] border border-white/10 rounded-sm">
                  No trainers found. Click 'Add Trainer' to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Class Modal */}
        {newClassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="bg-[#161616] border border-white/20 p-6 max-w-md w-full rounded-sm space-y-5">
              <h3 className="font-display text-2xl font-bold text-white uppercase">Add New Session</h3>

              <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="session-day" className="uppercase font-mono text-[#8C8C8C] block mb-1">Day of Week</label>
                  <select
                    id="session-day"
                    name="sessionDay"
                    value={newClassData.day}
                    onChange={(e) => setNewClassData({ ...newClassData, day: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="session-time" className="uppercase font-mono text-[#8C8C8C] block mb-1">Time Slot</label>
                  <input
                    id="session-time"
                    name="sessionTime"
                    type="text"
                    required
                    placeholder="e.g. 06:30 AM"
                    value={newClassData.time}
                    onChange={(e) => setNewClassData({ ...newClassData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="session-discipline" className="uppercase font-mono text-[#8C8C8C] block mb-1">Discipline</label>
                  <select
                    id="session-discipline"
                    name="sessionDiscipline"
                    value={newClassData.classTitle}
                    onChange={(e) => setNewClassData({ ...newClassData, classTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  >
                    <option>Championship Boxing</option>
                    <option>Iron Discipline Strength</option>
                    <option>Metabolic Warfare</option>
                    <option>Kinetic Reset & Ice Protocol</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="session-coach" className="uppercase font-mono text-[#8C8C8C] block mb-1">Lead Coach</label>
                  <input
                    id="session-coach"
                    name="sessionCoach"
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={newClassData.trainer}
                    onChange={(e) => setNewClassData({ ...newClassData, trainer: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="session-capacity" className="uppercase font-mono text-[#8C8C8C] block mb-1">Max Athlete Capacity</label>
                  <input
                    id="session-capacity"
                    name="sessionCapacity"
                    type="number"
                    min="1"
                    max="50"
                    value={newClassData.total}
                    onChange={(e) => setNewClassData({ ...newClassData, total: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewClassModal(false)}
                    className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white text-black font-bold uppercase rounded hover:bg-[#F5F5F3]"
                  >
                    Publish Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Inspect Consultation Request Modal */}
        {inspectRequest && (
          <div
            onClick={() => setInspectRequest(null)}
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-hidden animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/20 max-w-2xl w-full max-h-[92vh] overflow-y-auto rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl relative overscroll-contain"
            >
              <button
                onClick={() => setInspectRequest(null)}
                className="sticky sm:absolute top-2 right-2 sm:top-6 sm:right-6 float-right sm:float-none p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
                aria-label="Close dossier"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C8C8C] mb-1">
                  <span>Order Ref #{inspectRequest.id}</span>
                  <span>•</span>
                  <span className="text-emerald-400">{inspectRequest.createdAt}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white uppercase">
                  {inspectRequest.userName}
                </h3>
                <p className="text-xs text-[#8C8C8C]">Requested Coach: <strong className="text-white">{inspectRequest.trainerName}</strong></p>
              </div>

              {/* Contact Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#1A1A1A] p-4 rounded border border-white/10">
                <div>
                  <span className="text-[#8C8C8C] font-mono uppercase block">Phone / Mobile</span>
                  <strong className="text-white text-sm block mt-0.5">{inspectRequest.phone}</strong>
                </div>
                <div>
                  <span className="text-[#8C8C8C] font-mono uppercase block">Address / District</span>
                  <strong className="text-white text-sm block mt-0.5">{inspectRequest.address}</strong>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-white/10">
                  <span className="text-[#8C8C8C] font-mono uppercase block">Discipline Focus</span>
                  <span className="text-white font-semibold block mt-0.5">{inspectRequest.serviceType}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[#8C8C8C] font-mono uppercase block">Specific Goals & Requirements</span>
                  <p className="text-white/90 italic mt-0.5">"{inspectRequest.customRequirements}"</p>
                </div>
              </div>

              {/* AI Intake Chat Transcript */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-mono tracking-widest text-[#8C8C8C] block">
                  AI Intake Conversation Transcript
                </span>
                <div className="bg-[#111111] border border-white/10 rounded p-3 max-h-40 overflow-y-auto space-y-2 text-xs">
                  {inspectRequest.chatMessages && inspectRequest.chatMessages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-2 rounded max-w-[85%] ${m.sender === "user" ? "bg-white text-black font-semibold" : "bg-white/10 text-white/90"
                        }`}>
                        <span className="text-[9px] uppercase font-mono block opacity-60 mb-0.5">
                          {m.sender === "user" ? inspectRequest.userName : "AI Bot"}
                        </span>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8C8C8C]">Update Status:</span>
                  <select
                    value={inspectRequest.status}
                    onChange={(e) => {
                      updateConsultationStatus(inspectRequest.id, e.target.value);
                      setInspectRequest({ ...inspectRequest, status: e.target.value });
                    }}
                    className="px-3 py-1.5 bg-[#1F1F1F] border border-white/15 rounded text-xs font-mono text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted User</option>
                    <option value="Approved">Approved & Scheduled</option>
                  </select>
                </div>

                <a
                  href={`tel:${inspectRequest.phone}`}
                  className="px-5 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#F5F5F3]"
                >
                  Call Athlete Now
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Create Membership Tier Modal */}
        {newTierModal && (
          <div
            onClick={() => setNewTierModal(false)}
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#161616] border border-white/20 p-6 sm:p-8 max-w-md w-full rounded-sm space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setNewTierModal(false)}
                className="absolute top-5 right-5 p-1.5 text-white/60 hover:text-white bg-white/5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">Tier Configuration</span>
                <h3 className="font-display text-2xl font-bold text-white uppercase">Create Membership Tier</h3>
              </div>

              <form onSubmit={handleCreateTier} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="tier-name" className="uppercase font-mono text-[#8C8C8C] block mb-1">Tier Name</label>
                  <input
                    id="tier-name"
                    name="tierName"
                    type="text"
                    required
                    placeholder="e.g. Diamond Sovereign"
                    value={newTierData.name}
                    onChange={(e) => setNewTierData({ ...newTierData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tier-price" className="uppercase font-mono text-[#8C8C8C] block mb-1">Price</label>
                    <input
                      id="tier-price"
                      name="tierPrice"
                      type="text"
                      required
                      placeholder="e.g. $450"
                      value={newTierData.price}
                      onChange={(e) => setNewTierData({ ...newTierData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="tier-billing" className="uppercase font-mono text-[#8C8C8C] block mb-1">Billing Interval</label>
                    <input
                      id="tier-billing"
                      name="tierBilling"
                      type="text"
                      value={newTierData.billing}
                      onChange={(e) => setNewTierData({ ...newTierData, billing: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tier-description" className="uppercase font-mono text-[#8C8C8C] block mb-1">Description / Target</label>
                  <textarea
                    id="tier-description"
                    name="tierDescription"
                    rows="2"
                    placeholder="Brief description of tier perks..."
                    value={newTierData.description}
                    onChange={(e) => setNewTierData({ ...newTierData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="tier-features" className="uppercase font-mono text-[#8C8C8C] block mb-1">Features (One per line)</label>
                  <textarea
                    id="tier-features"
                    name="tierFeatures"
                    rows="3"
                    value={newTierData.features}
                    onChange={(e) => setNewTierData({ ...newTierData, features: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm font-mono focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewTierModal(false)}
                    className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-400 text-black font-bold uppercase rounded hover:bg-amber-300 transition-colors"
                  >
                    Deploy Tier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* New Trainer Modal */}
        {newTrainerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="bg-[#161616] border border-white/20 p-6 max-w-md w-full rounded-sm space-y-5">
              <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight">Onboard Staff</h3>

              <form onSubmit={handleCreateTrainer} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="trainer-name" className="uppercase font-mono text-[#8C8C8C] block mb-1">Full Name</label>
                  <input
                    id="trainer-name"
                    required
                    type="text"
                    value={newTrainerData.name}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label htmlFor="trainer-role" className="uppercase font-mono text-[#8C8C8C] block mb-1">Official Role</label>
                  <input
                    id="trainer-role"
                    required
                    type="text"
                    placeholder="e.g. Master Boxing Coach"
                    value={newTrainerData.role}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label htmlFor="trainer-image" className="uppercase font-mono text-[#8C8C8C] block mb-1">Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      id="trainer-image"
                      type="text"
                      placeholder="https://..."
                      value={newTrainerData.image}
                      onChange={(e) => setNewTrainerData({ ...newTrainerData, image: e.target.value })}
                      disabled={!!newTrainerImageFile}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
                    />
                    <label className="flex items-center justify-center px-4 bg-[#2A2A2A] hover:bg-[#333333] border border-white/15 rounded cursor-pointer transition-colors whitespace-nowrap text-sm">
                      <Upload className="w-4 h-4 mr-2" />
                      {newTrainerImageFile ? "Selected" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewTrainerImageFile(e.target.files[0]);
                          } else {
                            setNewTrainerImageFile(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="trainer-quote" className="uppercase font-mono text-[#8C8C8C] block mb-1">Signature Quote</label>
                  <input
                    id="trainer-quote"
                    type="text"
                    value={newTrainerData.quote}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, quote: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label htmlFor="trainer-bio" className="uppercase font-mono text-[#8C8C8C] block mb-1">Bio</label>
                  <textarea
                    id="trainer-bio"
                    rows="3"
                    value={newTrainerData.bio}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label htmlFor="trainer-specs" className="uppercase font-mono text-[#8C8C8C] block mb-1">Specialties (Comma Separated)</label>
                  <input
                    id="trainer-specs"
                    type="text"
                    placeholder="Striking, Strength, Conditioning"
                    value={newTrainerData.specialties}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, specialties: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewTrainerModal(false)}
                    className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingTrainer}
                    className="px-5 py-2 bg-amber-400 text-black font-bold uppercase rounded hover:bg-amber-300 transition-colors disabled:opacity-50"
                  >
                    {isUploadingTrainer ? "Uploading..." : "Add Trainer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Profile Dossier Modal */}
        {showAdminProfileModal && (
          <div
            onClick={() => {
              setShowAdminProfileModal(false);
              setIsEditingAdminProfile(false);
            }}
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/20 p-6 sm:p-8 max-w-lg w-full rounded-sm space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto overscroll-contain"
            >
              <button
                onClick={() => {
                  setShowAdminProfileModal(false);
                  setIsEditingAdminProfile(false);
                }}
                className="absolute top-5 right-5 p-1.5 text-white/60 hover:text-white bg-white/5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center text-amber-300 font-display text-2xl font-bold shadow-lg">
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="Admin" className="w-full h-full object-cover grayscale contrast-125" />
                    ) : (
                      "HQ"
                    )}
                  </div>
                  {/* Photo upload trigger */}
                  <label
                    className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-black rounded-full cursor-pointer hover:bg-amber-300 transition-colors shadow"
                    title="Upload Custom Admin Avatar"
                  >
                    <Camera className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomAdminPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-400/30">
                      System Administrator
                    </span>
                    <span className="text-[10px] uppercase font-mono text-emerald-400">● Online</span>
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-white uppercase mt-1 truncate">
                    {adminProfileForm.name}
                  </h3>
                  <p className="text-xs text-[#8C8C8C] truncate">{adminProfileForm.email}</p>
                </div>
              </div>

              {isEditingAdminProfile ? (
                /* EDIT FORM */
                <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="admin-name" className="uppercase font-mono text-[#8C8C8C] block mb-1">Director Name</label>
                    <input
                      id="admin-name"
                      name="adminName"
                      type="text"
                      required
                      value={adminProfileForm.name}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-role-title" className="uppercase font-mono text-[#8C8C8C] block mb-1">Administrative Title</label>
                    <input
                      id="admin-role-title"
                      name="adminRoleTitle"
                      type="text"
                      value={adminProfileForm.roleTitle}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, roleTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-facility" className="uppercase font-mono text-[#8C8C8C] block mb-1">Assigned Facility</label>
                    <input
                      id="admin-facility"
                      name="adminFacility"
                      type="text"
                      value={adminProfileForm.facility}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, facility: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-bio" className="uppercase font-mono text-[#8C8C8C] block mb-1">Jurisdiction & Mission Ethos</label>
                    <textarea
                      id="admin-bio"
                      name="adminBio"
                      rows="3"
                      value={adminProfileForm.bio}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, bio: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditingAdminProfile(false)}
                      className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded text-xs uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-400 text-black font-bold uppercase text-xs rounded hover:bg-amber-300 transition-colors shadow"
                    >
                      Save Admin Profile
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW MODE */
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#1A1A1A] rounded border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8C8C] uppercase font-mono">Administrative Role</span>
                      <strong className="text-white">{adminProfileForm.roleTitle}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8C8C] uppercase font-mono">Access Level</span>
                      <span className="text-emerald-400 font-mono font-bold">{adminProfileForm.accessLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8C8C] uppercase font-mono">Assigned Facility</span>
                      <strong className="text-white">{adminProfileForm.facility}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8C8C] uppercase font-mono">Direct Telemetry</span>
                      <span className="text-white font-mono">15,000 SQ FT Connected</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] rounded border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C8C8C] block">Jurisdiction & Mission Ethos</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      "{adminProfileForm.bio}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditingAdminProfile(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAdminProfileModal(false)}
                      className="px-5 py-2 bg-white text-black font-bold uppercase text-xs rounded hover:bg-[#F5F5F3]"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complete Athlete Dossier Monitoring Modal */}
        {/* Complete Athlete Dossier Monitoring Modal */}
        {selectedDossierAthlete && (() => {
          const athleteBookings = (adminBookings || []).filter(
            (b) =>
              b.userId === selectedDossierAthlete.id ||
              (selectedDossierAthlete.email &&
                b.userEmail?.toLowerCase() === selectedDossierAthlete.email?.toLowerCase())
          );

          const athleteLogs = (allWorkoutLogs || []).filter(
            (l) => (l.user_id && l.user_id === selectedDossierAthlete.id) || (l.userId && l.userId === selectedDossierAthlete.id)
          );

          const athleteOrders = (adminStats?.recentTransactions || []).filter(
            (tx) => tx.userId === selectedDossierAthlete.id || tx.member?.toLowerCase() === selectedDossierAthlete.name?.toLowerCase()
          );

          const athleteConsultation = (consultationRequests || []).find(
            (c) =>
              c.userId === selectedDossierAthlete.id ||
              c.id === `order-user-${selectedDossierAthlete.id}` ||
              c.userName?.toLowerCase() === selectedDossierAthlete.name?.toLowerCase() ||
              c.name?.toLowerCase() === selectedDossierAthlete.name?.toLowerCase()
          );

          const chatMsgs = athleteConsultation?.chatMessages || athleteConsultation?.chatHistory || [];

          return (
            <div
              onClick={() => setSelectedDossierAthlete(null)}
              onWheel={(e) => e.stopPropagation()}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-[#121212] border border-white/20 max-w-3xl w-full rounded-sm shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* Clean Header Bar */}
                <div className="p-6 border-b border-white/10 bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 bg-white/5 flex items-center justify-center text-amber-400 font-display text-xl font-bold shrink-0">
                      {selectedDossierAthlete.avatar_url || selectedDossierAthlete.avatar ? (
                        <img
                          src={selectedDossierAthlete.avatar_url || selectedDossierAthlete.avatar}
                          alt={selectedDossierAthlete.name}
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                      ) : (
                        (selectedDossierAthlete.name || "A").substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-bold text-white uppercase">
                          {selectedDossierAthlete.name || "Unnamed Athlete"}
                        </h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${selectedDossierAthlete.status === "Pending"
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}>
                          {selectedDossierAthlete.status || "Active"}
                        </span>
                        {selectedDossierAthlete.role === "admin" && (
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8C8C8C] font-mono">
                        {selectedDossierAthlete.email || "No email on record"} · ID: {selectedDossierAthlete.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        const threadId = athleteConsultation?.id || `order-user-${selectedDossierAthlete.id}`;
                        setActiveNegotiationThread(athleteConsultation || {
                          id: threadId,
                          name: selectedDossierAthlete.name,
                          email: selectedDossierAthlete.email,
                          chatMessages: [],
                          chatHistory: []
                        });
                        setSelectedDossierAthlete(null);
                      }}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Live Chat</span>
                    </button>
                    <button
                      onClick={() => setSelectedDossierAthlete(null)}
                      className="p-2 text-white/60 hover:text-white bg-white/5 rounded transition-colors"
                      title="Close Dossier"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* KPI Overview Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10 border-b border-white/10 bg-[#141414] text-center py-3">
                  <div className="px-3">
                    <span className="text-[10px] font-mono uppercase text-[#8C8C8C] block">Membership Tier</span>
                    <strong className="text-amber-400 font-display text-sm uppercase truncate block">
                      {selectedDossierAthlete.membership || selectedDossierAthlete.membership_tier || "Brave Trial"}
                    </strong>
                  </div>
                  <div className="px-3">
                    <span className="text-[10px] font-mono uppercase text-[#8C8C8C] block">Reserved Classes</span>
                    <strong className="text-white font-mono text-sm block">
                      {athleteBookings.length}
                    </strong>
                  </div>
                  <div className="px-3">
                    <span className="text-[10px] font-mono uppercase text-[#8C8C8C] block">Logged Workouts</span>
                    <strong className="text-white font-mono text-sm block">
                      {athleteLogs.length}
                    </strong>
                  </div>
                  <div className="px-3">
                    <span className="text-[10px] font-mono uppercase text-[#8C8C8C] block">Chat Messages</span>
                    <strong className="text-white font-mono text-sm block">
                      {chatMsgs.length}
                    </strong>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex border-b border-white/10 bg-[#161616] px-6 gap-2">
                  {[
                    { id: "profile", label: "Profile & Attributes", count: null },
                    { id: "bookings", label: "Classes & Schedule", count: athleteBookings.length },
                    { id: "workouts", label: "Workout Output", count: athleteLogs.length },
                    { id: "chat", label: "HQ Communication", count: chatMsgs.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDossierTab(tab.id)}
                      className={`py-3 px-3.5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-1.5 ${dossierTab === tab.id
                        ? "border-amber-400 text-white"
                        : "border-transparent text-[#8C8C8C] hover:text-white"
                        }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== null && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${dossierTab === tab.id ? "bg-amber-400 text-black" : "bg-white/10 text-white"
                          }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Scrollable Content Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  {/* TAB 1: Profile & Attributes */}
                  {dossierTab === "profile" && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 bg-[#181818] rounded border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#8C8C8C]">Discipline Focus</span>
                          <div className="font-display text-base font-bold text-white uppercase">
                            {selectedDossierAthlete.discipline || "All-Round MMA & Boxing"}
                          </div>
                        </div>
                        <div className="p-4 bg-[#181818] rounded border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#8C8C8C]">Weight Division</span>
                          <div className="font-display text-base font-bold text-white uppercase">
                            {selectedDossierAthlete.weight_class || "Cruiserweight (205 lbs)"}
                          </div>
                        </div>
                        <div className="p-4 bg-[#181818] rounded border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#8C8C8C]">Contact Phone</span>
                          <div className="font-mono text-sm text-white">
                            {selectedDossierAthlete.phone || "No phone listed"}
                          </div>
                        </div>
                        <div className="p-4 bg-[#181818] rounded border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#8C8C8C]">Renewal & Access</span>
                          <div className="font-mono text-sm text-amber-400">
                            {selectedDossierAthlete.renewalDate || selectedDossierAthlete.renewal_date || "Active Standard"}
                          </div>
                        </div>
                      </div>

                      {/* Bio Statement */}
                      <div className="p-4 bg-[#181818] rounded border border-white/10 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-amber-400 block">Athlete Statement & Goals</span>
                        <p className="text-xs text-white/85 leading-relaxed italic">
                          "{selectedDossierAthlete.bio || "No custom bio statement provided yet."}"
                        </p>
                      </div>

                      {/* Orders on File */}
                      {athleteOrders.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#8C8C8C] block">
                            Billing & Orders History
                          </span>
                          <div className="bg-[#181818] border border-white/10 rounded divide-y divide-white/10 text-xs">
                            {athleteOrders.map((ord) => (
                              <div key={ord.id} className="p-3 flex items-center justify-between">
                                <div>
                                  <strong className="text-white uppercase font-display">{ord.plan}</strong>
                                  <div className="text-[11px] text-[#8C8C8C] font-mono">Order #{ord.id} · {ord.date}</div>
                                </div>
                                <div className="text-right">
                                  <span className="text-amber-400 font-mono font-bold block">{ord.amount}</span>
                                  <span className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${ord.status === "Confirmed" ? "text-emerald-400" : "text-amber-400"
                                    }`}>
                                    {ord.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Booked Classes */}
                  {dossierTab === "bookings" && (
                    <div className="space-y-3">
                      {athleteBookings.length > 0 ? (
                        <div className="bg-[#181818] border border-white/10 rounded divide-y divide-white/10 text-xs">
                          {athleteBookings.map((b) => (
                            <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-white uppercase font-display text-sm">
                                    {b.classTitle}
                                  </h4>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {b.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#8C8C8C]">Coach: {b.trainer} · Room: {b.room}</p>
                              </div>
                              <span className="text-xs font-mono text-white/90 bg-white/5 px-3 py-1.5 rounded border border-white/10 self-start sm:self-center">
                                {b.date}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center text-xs text-[#8C8C8C] bg-[#181818] rounded border border-white/10 space-y-1">
                          <Calendar className="w-6 h-6 mx-auto text-[#8C8C8C]/50" />
                          <p className="text-white font-semibold">No Class Bookings</p>
                          <p className="text-[11px]">This athlete has not reserved spots in any upcoming timetable classes.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Workout Logs */}
                  {dossierTab === "workouts" && (
                    <div className="space-y-3">
                      {athleteLogs.length > 0 ? (
                        <div className="bg-[#181818] border border-white/10 rounded divide-y divide-white/10 text-xs">
                          {athleteLogs.map((l) => (
                            <div key={l.id} className="p-4 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <h4 className="font-bold text-white uppercase font-display text-sm">
                                  {l.exercise}
                                </h4>
                                {l.notes && <p className="text-[11px] text-[#8C8C8C]">"{l.notes}"</p>}
                              </div>
                              <div className="flex items-center gap-3 font-mono text-right">
                                <span className="text-white/60 text-[11px]">{l.date}</span>
                                <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                                  {l.weight}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center text-xs text-[#8C8C8C] bg-[#181818] rounded border border-white/10 space-y-1">
                          <Dumbbell className="w-6 h-6 mx-auto text-[#8C8C8C]/50" />
                          <p className="text-white font-semibold">No Training Logs</p>
                          <p className="text-[11px]">No workout performance entries have been logged by this athlete yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: HQ Communication & Chat */}
                  {dossierTab === "chat" && (
                    <div className="space-y-3">
                      {chatMsgs.length > 0 ? (
                        <div className="space-y-3">
                          <div className="bg-[#141414] border border-white/10 rounded p-4 space-y-3 max-h-64 overflow-y-auto text-xs">
                            {chatMsgs.map((msg, mIdx) => {
                              const isAdmin = msg.sender === "admin" || msg.sender === "assistant";
                              return (
                                <div
                                  key={mIdx}
                                  className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                                >
                                  <span className="text-[9px] font-mono text-[#8C8C8C] uppercase mb-1">
                                    {isAdmin ? "Director HQ" : (selectedDossierAthlete.name || "Athlete")} · {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}
                                  </span>
                                  <div
                                    className={`px-3.5 py-2 rounded max-w-[85%] text-xs ${isAdmin
                                      ? "bg-amber-400 text-black font-semibold rounded-br-none"
                                      : "bg-[#222222] text-white border border-white/15 rounded-bl-none"
                                      }`}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const threadId = athleteConsultation?.id || `order-user-${selectedDossierAthlete.id}`;
                              setActiveNegotiationThread(athleteConsultation || {
                                id: threadId,
                                name: selectedDossierAthlete.name,
                                email: selectedDossierAthlete.email,
                                chatMessages: [],
                                chatHistory: []
                              });
                              setSelectedDossierAthlete(null);
                            }}
                            className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Reply to Athlete in Live Chat Window</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-12 text-center text-xs text-[#8C8C8C] bg-[#181818] rounded border border-white/10 space-y-3">
                          <MessageSquare className="w-6 h-6 mx-auto text-[#8C8C8C]/50" />
                          <div>
                            <p className="text-white font-semibold">No Messages Exchanged</p>
                            <p className="text-[11px]">There is no negotiation or inquiry history with this athlete.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const threadId = athleteConsultation?.id || `order-user-${selectedDossierAthlete.id}`;
                              setActiveNegotiationThread({
                                id: threadId,
                                name: selectedDossierAthlete.name,
                                email: selectedDossierAthlete.email,
                                chatMessages: [],
                                chatHistory: []
                              });
                              setSelectedDossierAthlete(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-amber-300"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Start Conversation
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dossier Modal Footer */}
                <div className="p-4 border-t border-white/10 bg-[#161616] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#8C8C8C]">
                    Brave Gym Official Dossier Surveillance System
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDossierAthlete(null)}
                    className="px-5 py-2 bg-white text-black font-bold uppercase text-xs rounded hover:bg-[#F5F5F3] transition-colors"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Real-time Athlete & Admin Negotiation Chat Slide-out Drawer */}
        {activeNegotiationThread && (
          <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-fadeIn">
            {/* Clickable backdrop to close */}
            <div
              className="flex-1"
              onClick={() => {
                setActiveNegotiationThread(null);
                setSelectedOrder(null);
                setAdminChatInput("");
              }}
            />
            {/* Drawer Panel */}
            <div className="w-full sm:w-[450px] h-full bg-[#141414] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right fade-in duration-200">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#1A1A1A] to-[#141414]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white uppercase tracking-wide">
                      Live Negotiation & Support: {activeNegotiationThread.name || selectedOrder?.member || "Athlete"}
                    </h3>
                    <p className="text-[11px] text-[#8C8C8C] font-mono">
                      Order #{selectedOrder?.id || "N/A"} · Plan: {selectedOrder?.plan || "Membership"} · Status: {selectedOrder?.status || "Pending"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveNegotiationThread(null);
                    setSelectedOrder(null);
                    setAdminChatInput("");
                  }}
                  className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="p-5 flex-1 overflow-y-auto space-y-3 bg-[#0D0D0D]">
                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C8C8C] bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Encrypted Real-Time Communication Channel
                  </span>
                </div>

                {(() => {
                  const messages = activeNegotiationThread.chatMessages || activeNegotiationThread.chatHistory || [];
                  if (messages.length === 0) {
                    return (
                      <div className="py-12 text-center text-xs text-[#8C8C8C] space-y-2">
                        <MessageSquare className="w-8 h-8 mx-auto text-[#8C8C8C]/50" />
                        <p className="text-white/80 font-semibold">Start direct conversation with athlete.</p>
                        <p className="text-[11px] max-w-xs mx-auto">
                          Clarify payment plans, answer training inquiries, or offer custom terms before confirming their membership order.
                        </p>
                      </div>
                    );
                  }
                  return messages.map((msg, mIdx) => {
                    const isAdmin = msg.sender === "admin" || msg.sender === "assistant";
                    return (
                      <div
                        key={mIdx}
                        className={`flex flex-col group ${isAdmin ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-lg ${isAdmin
                            ? "bg-gradient-to-br from-[#202020] to-[#1a1a1a] text-white border border-white/10 font-medium rounded-tr-sm"
                            : "bg-[#1C1C1C]/80 backdrop-blur-md text-amber-400 border border-amber-500/20 rounded-tl-sm"
                            }`}
                        >
                          {msg.text}
                        </div>
                        <span className={`text-[10px] text-white/30 mt-1 mx-1 opacity-0 group-hover:opacity-100 transition-opacity ${isAdmin ? "text-right" : "text-left"}`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                      </div>
                    );
                  });
                })()}
                <div ref={chatEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-4 border-t border-white/10 bg-[#161616]">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!adminChatInput.trim()) return;
                    const text = adminChatInput.trim();
                    setAdminChatInput("");
                    try {
                      // Send message to backend
                      const updated = await sendNegotiationMessage(activeNegotiationThread.id, text, "admin");
                      if (updated) {
                        setActiveNegotiationThread(updated);
                      } else {
                        // local optimistic update
                        setActiveNegotiationThread((prev) => {
                          const existing = prev.chatMessages || prev.chatHistory || [];
                          const updatedMsgs = [
                            ...existing,
                            { sender: "admin", text, timestamp: new Date().toISOString() }
                          ];
                          return {
                            ...prev,
                            chatMessages: updatedMsgs,
                            chatHistory: updatedMsgs
                          };
                        });
                      }
                    } catch (err) {
                      // optimistic update fallback
                      setActiveNegotiationThread((prev) => {
                        const existing = prev.chatMessages || prev.chatHistory || [];
                        const updatedMsgs = [
                          ...existing,
                          { sender: "admin", text, timestamp: new Date().toISOString() }
                        ];
                        return {
                          ...prev,
                          chatMessages: updatedMsgs,
                          chatHistory: updatedMsgs
                        };
                      });
                    }
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={adminChatInput}
                    onChange={(e) => setAdminChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.form.requestSubmit();
                      }
                    }}
                    placeholder="Type message to athlete..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all resize-none min-h-[44px] max-h-[120px]"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!adminChatInput.trim()}
                    className="w-11 h-11 shrink-0 bg-white/10 hover:bg-white disabled:bg-white/5 disabled:text-white/20 text-white hover:text-black flex items-center justify-center rounded-xl transition-all shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                {selectedOrder && selectedOrder.status === "Pending" && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-[#8C8C8C]">
                      Order #{selectedOrder.id} is currently <strong className="text-amber-400">Pending</strong>
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await approveMembershipOrder(selectedOrder.id, selectedOrder.userId, selectedOrder.plan);
                          setSelectedOrder((prev) => ({ ...prev, status: "Confirmed" }));
                          alert("Membership successfully confirmed & athlete activated!");
                        } catch (e) {
                          alert("Failed to confirm: " + e.message);
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Order Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Admin Manage Booking Modal */}
      {manageBookingModal && selectedManageBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-white/10 rounded-sm w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h3 className="font-display text-2xl font-bold text-white uppercase mb-2">Manage Session</h3>
              <p className="text-xs text-[#8C8C8C]">
                Update booking for <strong className="text-white">{selectedManageBooking.userName}</strong> in <strong className="text-white">{selectedManageBooking.classTitle}</strong>.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Date</label>
                <input
                  type="date"
                  value={manageBookingDate}
                  onChange={(e) => setManageBookingDate(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Time</label>
                <input
                  type="time"
                  value={manageBookingTime}
                  onChange={(e) => setManageBookingTime(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Status</label>
                <select
                  value={manageBookingStatus}
                  onChange={(e) => setManageBookingStatus(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setManageBookingModal(false)}
                className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBooking}
                className="px-5 py-2 text-xs font-bold text-black bg-white hover:bg-[#F5F5F3] rounded-sm uppercase tracking-wider transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
