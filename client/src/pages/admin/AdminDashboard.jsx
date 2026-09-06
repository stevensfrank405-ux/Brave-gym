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
  Upload
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useGym } from "../../context/GymContext";

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
    allWorkoutLogs
  } = useGym();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDossierAthlete, setSelectedDossierAthlete] = useState(null);
  const [athleteSearchQuery, setAthleteSearchQuery] = useState("");
  const [athleteFilterTier, setAthleteFilterTier] = useState("ALL");
  const [inspectRequest, setInspectRequest] = useState(null);
  const [newClassModal, setNewClassModal] = useState(false);
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [newTierModal, setNewTierModal] = useState(false);

  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: currentUser?.name || "Marcus Vance HQ",
    email: currentUser?.email || "admin@bravegym.com",
    roleTitle: "Director & Head of Operations",
    accessLevel: "Tier-4 Sovereign Master",
    facility: "Brave Gym HQ · Main Arena",
    bio: "Full jurisdiction over facility security protocols, coaches timetable scheduling, athlete subscriptions, and financial audits."
  });

  // Keep admin profile in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setAdminProfileForm((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email
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

  const handleSaveAdminProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: adminProfileForm.name
    });
    setIsEditingAdminProfile(false);
  };

  // Listen for ?view=profile or ?tab=... from Topbar / mobile drawer
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const viewParam = searchParams.get("view");

    if (viewParam === "profile") {
      setShowAdminProfileModal(true);
      setSearchParams({}, { replace: true });
    } else if (tabParam) {
      if (["overview", "athletes", "bookings", "requests", "schedule", "finances", "tiers"].includes(tabParam)) {
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

  const sidebarNavItems = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard, desc: "Live KPI Telemetry" },
    { id: "athletes", label: "Athlete Monitoring", icon: UserCheck, badge: allUsersRoster?.length, desc: "Full Client Dossier Monitoring" },
    { id: "bookings", label: "Athlete Bookings", icon: Users, badge: adminBookings?.length, desc: "Reserved Spots Roster" },
    { id: "requests", label: "Consultation Orders", icon: MessageSquare, badge: consultationRequests?.length, desc: "Athlete Intake Leads" },
    { id: "schedule", label: "Timetable & Classes", icon: Calendar, desc: "Arena Scheduling" },
    { id: "finances", label: "Finances & Spatial", icon: DollarSign, desc: "Revenue & Zone Share" },
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
        className={`transition-all duration-300 bg-[#121212] border-r border-white/10 hidden md:flex flex-col justify-between shrink-0 z-30 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain ${
        sidebarCollapsed ? "w-20" : "w-72"
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
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-sm transition-all text-left group relative ${
                  isActive
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
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-2 ${
                          isActive ? "bg-black text-white" : "bg-amber-400 text-black shadow"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono block truncate ${
                      isActive ? "text-black/70" : "text-[#8C8C8C]"
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
              <p className="text-[10px] text-[#8C8C8C] whitespace-nowrap">86 / 100 safe capacity</p>
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

        {/* Tab Content: Athlete Roster & Client Dossier Monitoring */}
        {(activeTab === "overview" || activeTab === "athletes") && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
                  Comprehensive Client Surveillance & Management
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-white uppercase">
                    Athlete Dossiers & Client Monitoring
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400 text-black shadow-sm">
                    {allUsersRoster?.length || 0} Registered Clients
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8C8C8C] max-w-sm">
                Real-time dossiers with each user's active tier, reserved combine sessions, intake chat transcripts, and logged training outputs.
              </p>
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
                const filteredAthletes = (allUsersRoster || []).filter((ath) => {
                  const q = athleteSearchQuery.toLowerCase();
                  const matchesQuery =
                    !q ||
                    ath.name?.toLowerCase().includes(q) ||
                    ath.email?.toLowerCase().includes(q) ||
                    ath.discipline?.toLowerCase().includes(q) ||
                    ath.weight_class?.toLowerCase().includes(q) ||
                    ath.id?.toLowerCase().includes(q);

                  const tier = ath.membership_tier || "Iron Standard";
                  const matchesTier =
                    athleteFilterTier === "ALL" ||
                    tier.toLowerCase().includes(athleteFilterTier.toLowerCase());

                  return matchesQuery && matchesTier;
                });

                if (filteredAthletes.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-[#8C8C8C]">
                      {allUsersRoster?.length === 0
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
                    (l) => l.user_id === ath.id
                  );

                  // Compute athlete's consultation requests & chats
                  const athleteRequests = (consultationRequests || []).filter(
                    (r) =>
                      r.userId === ath.id ||
                      (ath.email && r.athleteEmail?.toLowerCase() === ath.email?.toLowerCase())
                  );

                  const tierName = ath.membership_tier || "Iron Standard";
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
                            {ath.role === "admin" && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-red-500/40 bg-red-500/10 text-red-400 font-bold">
                                Admin
                              </span>
                            )}
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
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C] block">
                  Class Attendance & Reservations
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-white uppercase">
                    Athlete Bookings Roster
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-black shadow-sm">
                    {adminBookings?.length || 0} Booked
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8C8C8C] max-w-sm">
                Real-time synchronized athlete bookings for scheduled arena combine sessions.
              </p>
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
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
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

        {/* Tab Content: Consultation Requests & Orders */}
        {(activeTab === "overview" || activeTab === "requests") && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C] block">
                  Athletic Inquiries & Leads
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-white uppercase">
                    Consultation Orders & Intake Requests
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400 text-black shadow-sm">
                    {consultationRequests?.length || 0} Total
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8C8C8C] max-w-sm">
                Review athlete intake requirements, address, contact numbers, and AI chatbot conversation logs.
              </p>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-sm divide-y divide-white/10">
              {consultationRequests && consultationRequests.length > 0 ? (
                consultationRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h4 className="font-display text-base sm:text-lg font-bold text-white uppercase">
                          {req.userName}
                        </h4>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/80">
                          Coach: {req.trainerName}
                        </span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          req.status === "Pending"
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : req.status === "Contacted"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#8C8C8C]">
                        <span>📞 {req.phone}</span>
                        <span>•</span>
                        <span>📍 {req.address}</span>
                        <span>•</span>
                        <span className="text-white/70">🎯 {req.serviceType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <select
                        value={req.status}
                        onChange={(e) => updateConsultationStatus(req.id, e.target.value)}
                        className="px-3 py-1.5 bg-[#1F1F1F] border border-white/15 rounded text-xs font-mono text-white focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted User</option>
                        <option value="Approved">Approved & Scheduled</option>
                      </select>

                      <button
                        onClick={() => setInspectRequest(req)}
                        className="px-3.5 py-1.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-[#F5F5F3] transition-colors"
                      >
                        Inspect Dossier
                      </button>

                      <button
                        onClick={() => removeConsultationRequest(req.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
                        title="Delete consultation record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#8C8C8C]">
                  No consultation requests currently pending.
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
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">Timetable Control</span>
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
                    <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">Revenue Stream</span>
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">Supabase Ledger</span>
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
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">Audit Trail</span>
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
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">Subscription Architecture</span>
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
                      <div className={`p-2 rounded max-w-[85%] ${
                        m.sender === "user" ? "bg-white text-black font-semibold" : "bg-white/10 text-white/90"
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
        {selectedDossierAthlete && (
          <div
            onClick={() => setSelectedDossierAthlete(null)}
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] border border-white/20 p-5 sm:p-8 max-w-4xl w-full rounded-sm space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto overscroll-contain"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDossierAthlete(null)}
                className="absolute top-5 right-5 p-1.5 text-white/60 hover:text-white bg-white/5 rounded-full transition-colors"
                title="Close Dossier"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header: Athlete Identity & Membership Tier */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 bg-white/5 flex items-center justify-center text-amber-400 font-display text-2xl font-bold shrink-0">
                    {selectedDossierAthlete.avatar_url ? (
                      <img
                        src={selectedDossierAthlete.avatar_url}
                        alt={selectedDossierAthlete.name}
                        className="w-full h-full object-cover grayscale contrast-125"
                      />
                    ) : (
                      (selectedDossierAthlete.name || "A").substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                        Athlete Surveillance Dossier
                      </span>
                      {selectedDossierAthlete.role === "admin" && (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                          Admin Role
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white uppercase">
                      {selectedDossierAthlete.name || "Unnamed Athlete"}
                    </h3>
                    <p className="text-xs font-mono text-white/60">
                      ID: {selectedDossierAthlete.id}
                    </p>
                  </div>
                </div>

                {/* Active Tier Badge */}
                <div className="flex flex-col sm:items-end">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C8C8C]">
                    Active Package / Tier
                  </span>
                  <div className="font-display text-lg font-bold text-amber-400 uppercase">
                    {selectedDossierAthlete.membership_tier || "Iron Standard"}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Status: Active Member
                  </span>
                </div>
              </div>

              {/* Dossier Grid Section 1: Biological & Athletic Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded-sm space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#8C8C8C]">Discipline Focus</span>
                  <div className="font-display text-sm font-bold text-white uppercase truncate">
                    {selectedDossierAthlete.discipline || "All-Round MMA"}
                  </div>
                </div>
                <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded-sm space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#8C8C8C]">Weight Class</span>
                  <div className="font-display text-sm font-bold text-white uppercase truncate">
                    {selectedDossierAthlete.weight_class || "Cruiserweight"}
                  </div>
                </div>
                <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded-sm space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#8C8C8C]">Direct Contact</span>
                  <div className="font-mono text-xs text-white truncate">
                    {selectedDossierAthlete.phone || "No phone listed"}
                  </div>
                </div>
                <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded-sm space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#8C8C8C]">Registered Email</span>
                  <div className="font-mono text-xs text-white truncate">
                    {selectedDossierAthlete.email || "No email listed"}
                  </div>
                </div>
              </div>

              {/* Athlete Bio */}
              {selectedDossierAthlete.bio && (
                <div className="p-3.5 bg-[#171717] border border-white/10 rounded-sm space-y-1">
                  <span className="text-[10px] uppercase font-mono text-amber-400">Athlete Statement / Bio</span>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    "{selectedDossierAthlete.bio}"
                  </p>
                </div>
              )}

              {/* Dossier Section 2: Active & Reserved Classes */}
              {(() => {
                const athleteBookings = (adminBookings || []).filter(
                  (b) =>
                    b.userId === selectedDossierAthlete.id ||
                    (selectedDossierAthlete.email &&
                      b.userEmail?.toLowerCase() === selectedDossierAthlete.email?.toLowerCase())
                );

                return (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <h4 className="font-display text-base font-bold text-white uppercase">
                          Reserved Sessions & Classes
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {athleteBookings.length} Active / Completed
                      </span>
                    </div>

                    {athleteBookings.length > 0 ? (
                      <div className="bg-[#181818] border border-white/10 rounded-sm divide-y divide-white/10 max-h-48 overflow-y-auto">
                        {athleteBookings.map((b) => (
                          <div key={b.id} className="p-3 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-white uppercase font-display text-sm">
                                {b.classTitle}
                              </div>
                              <div className="text-[11px] text-[#8C8C8C] flex gap-3 pt-0.5">
                                <span>Coach: {b.trainer}</span>
                                <span>•</span>
                                <span>Arena: {b.room}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-right">
                              <span className="text-white/70">{b.date}</span>
                              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#181818] rounded-sm text-center text-xs text-[#8C8C8C]">
                        No class reservations currently recorded for this athlete.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Dossier Section 3: Training & Daily Workout Logs */}
              {(() => {
                const athleteLogs = (allWorkoutLogs || []).filter(
                  (l) => l.user_id === selectedDossierAthlete.id
                );

                return (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-display text-base font-bold text-white uppercase">
                          Daily Training & Workout Logs
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {athleteLogs.length} Output Sessions Logged
                      </span>
                    </div>

                    {athleteLogs.length > 0 ? (
                      <div className="bg-[#181818] border border-white/10 rounded-sm divide-y divide-white/10 max-h-48 overflow-y-auto">
                        {athleteLogs.map((l) => (
                          <div key={l.id} className="p-3 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <div className="font-bold text-white uppercase font-display text-sm">
                                {l.exercise}
                              </div>
                              <div className="text-[11px] text-[#8C8C8C] flex gap-3">
                                {l.notes && <span>Notes: "{l.notes}"</span>}
                              </div>
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
                      <div className="p-4 bg-[#181818] rounded-sm text-center text-xs text-[#8C8C8C]">
                        No workout logs entered yet by this athlete.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Dossier Section 4: Consultation Requests & Intake Chat Transcripts */}
              {(() => {
                const athleteRequests = (consultationRequests || []).filter(
                  (r) =>
                    r.userId === selectedDossierAthlete.id ||
                    (selectedDossierAthlete.email &&
                      r.athleteEmail?.toLowerCase() === selectedDossierAthlete.email?.toLowerCase())
                );

                return (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <h4 className="font-display text-base font-bold text-white uppercase">
                          Consultation Orders & AI Chat Transcripts
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {athleteRequests.length} Transcripts
                      </span>
                    </div>

                    {athleteRequests.length > 0 ? (
                      <div className="space-y-3">
                        {athleteRequests.map((req) => (
                          <div
                            key={req.id}
                            className="p-4 bg-[#181818] border border-white/10 rounded-sm space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2 text-xs">
                              <div>
                                <span className="font-bold text-amber-400 uppercase font-mono">
                                  Service: {req.serviceType || "General Assessment"}
                                </span>
                                <div className="text-[11px] text-[#8C8C8C] pt-0.5">
                                  Date: {req.submittedAt} · Preferred: {req.preferredDate} ({req.preferredTime})
                                </div>
                              </div>
                              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                                req.status === "confirmed"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              }`}>
                                {req.status}
                              </span>
                            </div>

                            {req.details && (
                              <div className="text-xs text-white/80">
                                <span className="text-[10px] uppercase font-mono text-[#8C8C8C] block">Client Message:</span>
                                "{req.details}"
                              </div>
                            )}

                            {/* Chat Transcript */}
                            {req.chatHistory && req.chatHistory.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] uppercase font-mono text-blue-400 block font-bold">
                                  Conversation Transcript ({req.chatHistory.length} messages)
                                </span>
                                <div className="bg-[#121212] p-3 rounded border border-white/5 space-y-2 max-h-36 overflow-y-auto text-xs">
                                  {req.chatHistory.map((msg, mIdx) => (
                                    <div
                                      key={mIdx}
                                      className={`flex flex-col ${
                                        msg.sender === "user" ? "items-end" : "items-start"
                                      }`}
                                    >
                                      <span className="text-[9px] font-mono text-[#8C8C8C] uppercase">
                                        {msg.sender === "user" ? "Athlete" : "Brave AI Coordinator"}
                                      </span>
                                      <div
                                        className={`px-3 py-1.5 rounded max-w-[85%] text-xs ${
                                          msg.sender === "user"
                                            ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                                            : "bg-white/10 text-white border border-white/15"
                                        }`}
                                      >
                                        {msg.text}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#181818] rounded-sm text-center text-xs text-[#8C8C8C]">
                        No intake chat orders on file for this athlete.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Dossier Modal Footer */}
              <div className="flex justify-end pt-4 border-t border-white/10">
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
        )}

      </main>
    </div>
  );
}
