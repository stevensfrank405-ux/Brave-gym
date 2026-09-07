import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Flame, 
  Calendar, 
  Trophy, 
  Clock, 
  User, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Edit,
  Mail,
  Shield,
  Award,
  X,
  Camera,
  Upload,
  Send,
  Minimize2
} from "lucide-react";
import { useGym } from "../../context/GymContext";
import confetti from "canvas-confetti";

export default function UserDashboard() {
  const { 
    currentUser, 
    bookings, 
    cancelBooking, 
    workoutLogs, 
    addWorkoutLog, 
    userNotifications, 
    markNotificationsAsRead,
    consultationRequests,
    updateProfile,
    uploadUserAvatar,
    memberships,
    purchasePlan,
    sendNegotiationMessage
  } = useGym();
  
  const [newLog, setNewLog] = useState({ exercise: "", weight: "", notes: "" });
  const [showLogModal, setShowLogModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = React.useRef(null);
  
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg",
    bio: currentUser?.bio || "Discipline over motivation. Training for athletic excellence.",
    weightClass: currentUser?.weightClass || "Open Weight",
    discipline: currentUser?.discipline || "General Conditioning & Strength"
  });

  // Keep profileForm in sync with currentUser
  React.useEffect(() => {
    if (currentUser) {
      setProfileForm((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        avatar: currentUser.avatar || prev.avatar,
        bio: currentUser.bio || prev.bio,
        weightClass: currentUser.weightClass || prev.weightClass,
        discipline: currentUser.discipline || prev.discipline
      }));
    }
  }, [currentUser]);

  const availableAvatars = [
    "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg",
    "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg",
    "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
    "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
    "/media/hermes-rivera-Wbkp89Nn9-unsplash.jpg"
  ];

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be under 5MB.");
        return;
      }
      setIsUploadingPhoto(true);
      try {
        const publicUrl = await uploadUserAvatar(file);
        if (publicUrl) {
          setProfileForm((prev) => ({ ...prev, avatar: publicUrl }));
          setIsUploadingPhoto(false);
          return;
        }
        // Fallback local data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
          setIsUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Avatar upload failed:", err);
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileForm.name,
      avatar: profileForm.avatar
    });
    setIsEditingProfile(false);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "schedule" | "notifications" | "logs" | "tiers"
  const [chatMessageInput, setChatMessageInput] = useState("");
  const isPending = currentUser?.status === "Pending";

  // Auto scroll chat
  React.useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isChatOpen, consultationRequests]);

  // Find user's negotiation consultation thread
  const userConsultation = (consultationRequests || []).find(
    (c) =>
      c.userId === currentUser?.id ||
      c.id === `order-user-${currentUser?.id}` ||
      c.userName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
      c.name?.toLowerCase() === currentUser?.name?.toLowerCase()
  );

  const handleAddWorkout = (e) => {
    e.preventDefault();
    if (!newLog.exercise) return;
    addWorkoutLog({
      date: "Today",
      exercise: newLog.exercise,
      weight: newLog.weight || "Bodyweight",
      notes: newLog.notes || "Solid output"
    });
    setNewLog({ exercise: "", weight: "", notes: "" });
    setShowLogModal(false);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  const [selectedMetric, setSelectedMetric] = useState("stamina"); // "stamina" | "power" | "volume"

  // Dynamically derive 7-day progression telemetry from user's logged workouts
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyPerformance = weekDays.map((day, idx) => {
    // Check if user has a logged session matching this day or recent activity
    const matchingLog = (workoutLogs || []).find((l) => 
      (l.date && l.date.toLowerCase().includes(day.toLowerCase())) ||
      (idx === 6 && l.date === "Today")
    );

    const baseVal = matchingLog ? 85 + (idx * 2) : (workoutLogs.length > 0 ? 40 + (idx * 5) : 0);
    return {
      day,
      stamina: baseVal,
      power: baseVal > 0 ? Math.min(100, baseVal + 5) : 0,
      volume: baseVal > 0 ? Math.min(100, baseVal - 3) : 0,
      ratio: baseVal > 0 ? `+${(baseVal / 10).toFixed(1)}%` : "0%",
      focus: matchingLog ? `${matchingLog.exercise} (${matchingLog.weight})` : "Rest / Active Rest"
    };
  });

  const unreadCount = userNotifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="pt-24 sm:pt-28 pb-32 bg-[#0D0D0D] min-h-screen px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* User Hero Banner Header - Clickable to View Profile */}
        <div className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div 
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-5 cursor-pointer group select-none"
            title="Click to view & edit athlete profile"
          >
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 group-hover:border-white bg-black transition-all duration-300 group-hover:scale-105 shadow-md relative">
                <img
                  src={currentUser?.avatar || "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg"}
                  alt={currentUser?.name}
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:contrast-100 transition-all"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Edit className="w-5 h-5 text-white" />
                </div>
              </div>
              {/* Status indicator outside the overflow-hidden circle */}
              <span 
                className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-[#141414] rounded-full z-10 ${
                  isPending
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"
                    : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                }`}
                title={isPending ? "Membership Pending Verification" : "Active Athletic Standing"} 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight group-hover:text-white/80 transition-colors flex flex-wrap items-center gap-2">
                  <span>{currentUser?.name}</span>
                  <span className="text-xs text-[#8C8C8C] font-mono normal-case font-normal group-hover:underline">
                    (View Profile)
                  </span>
                </h1>
                <span className="px-3 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-white text-black font-bold shadow-sm">
                  {currentUser?.membership}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest font-bold ${
                  isPending
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {currentUser?.status || "Pending"}
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C] break-all">{currentUser?.email} · Member ID #{currentUser?.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-[#8C8C8C] block">Discipline Streak</span>
              <div className="flex items-center gap-2 text-white font-display text-xl sm:text-2xl font-bold">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>{currentUser?.streak || 0} Days</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-[#8C8C8C] block">Month Volume</span>
              <div className="flex items-center gap-2 text-white font-display text-2xl font-bold">
                <Trophy className="w-5 h-5 text-white/80" />
                <span>{currentUser?.sessionsThisMonth || 0} Sessions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean, Clear Pending Notification Banner for User */}
        {isPending && (
          <div className="p-5 bg-gradient-to-r from-amber-500/15 via-[#18150e] to-black border border-amber-500/40 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold text-white uppercase tracking-wide">
                    Membership Order Pending Admin Approval
                  </h3>
                  <span className="text-[10px] font-mono bg-amber-400 text-black font-bold px-2 py-0.5 rounded uppercase">
                    Order In Review
                  </span>
                </div>
                <p className="text-xs text-white/75 leading-relaxed">
                  Your <strong className="text-amber-400">{currentUser?.membership}</strong> order has been received by Brave HQ. Class booking and facility services will unlock as soon as Director Marcus Vance confirms your membership.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 shadow"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat with HQ / Negotiate</span>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Navigation Tabs - Responsive Horizontal Scrollable */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-1.5 bg-white/5 bg-opacity-10 backdrop-blur-md p-1 rounded-sm border border-white/10 overflow-x-auto max-w-full scrollbar-none">
            {[
              { id: "overview", label: "Hub Overview" },
              { id: "tiers", label: "Membership Tiers", badge: memberships?.length },
              { id: "schedule", label: "My Bookings", badge: bookings?.length },
              { id: "notifications", label: "Admin Dispatch", badge: unreadCount },
              { id: "logs", label: "Training Logs", badge: workoutLogs?.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? "bg-white text-black font-bold shadow"
                    : "text-[#8C8C8C] hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : tab.badge === "Pending"
                      ? "bg-amber-400 text-black font-bold"
                      : "bg-white/10 text-white font-bold"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded text-xs font-semibold uppercase tracking-wider transition-all sm:self-auto self-start"
          >
            <Plus className="w-3.5 h-3.5" /> Log Session
          </button>
        </div>

        {/* 1. Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            
            {/* Overview Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Next Booked Session Widget */}
              <div className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">
                  <span className="flex items-center gap-2 text-white">
                    <Clock className="w-3.5 h-3.5 text-white" /> Next Class
                  </span>
                  <span className="text-emerald-400 font-semibold">Active Slot</span>
                </div>

                {bookings.length > 0 ? (
                  <div className="p-4 bg-white/5 border border-white/10 rounded space-y-2">
                    <h3 className="font-display text-xl font-bold text-white uppercase">
                      {bookings[0].classTitle}
                    </h3>
                    <p className="text-xs text-[#8C8C8C]">Coach: {bookings[0].trainer}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-white/90 font-mono">
                      <span>{bookings[0].date}</span>
                      <span className="text-emerald-400">{bookings[0].room}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[#8C8C8C]">
                    No upcoming sessions reserved.
                  </div>
                )}

                <Link
                  to="/programs"
                  className="block w-full py-2.5 text-center text-xs uppercase tracking-widest font-semibold bg-white text-black hover:bg-[#F5F5F3] rounded transition-colors shadow"
                >
                  Reserve New Slot
                </Link>
              </div>

              {/* Membership Tier Status */}
              <div className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm p-6 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">
                    <span className="flex items-center gap-2 text-white">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" /> {isPending ? "Requested Plan" : "Active Plan"}
                    </span>
                    <span className={`font-semibold uppercase px-2 py-0.5 rounded text-[10px] ${
                      isPending
                        ? "bg-amber-400 text-black font-bold"
                        : "text-emerald-400"
                    }`}>
                      {currentUser?.status || "Pending"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-2xl font-bold text-white uppercase">{currentUser?.membership}</h3>
                    <p className="text-xs text-[#8C8C8C]">
                      {isPending
                        ? "Awaiting Admin Confirmation. Facility services locked."
                        : `Renews on ${currentUser?.renewalDate}.`}
                    </p>
                  </div>

                  {/* Dynamic inclusions from current tier */}
                  <div className="space-y-1.5 text-xs text-white/80 pt-2 border-t border-white/10">
                    {(() => {
                      const matchedTier = (memberships || []).find(
                        (t) => t.name?.toLowerCase() === currentUser?.membership?.toLowerCase()
                      );
                      const features = matchedTier?.features?.length > 0 
                        ? matchedTier.features 
                        : [
                            "Unlimited Strike & Barbell Access",
                            "7-Day Advance Floor Reservation",
                            "Sauna & Cold Plunge Suite Included"
                          ];
                      return features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isPending ? "text-amber-400" : "text-emerald-400"}`} />
                          <span className={isPending ? "text-white/60" : "text-white/90"}>{f}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="block w-full py-2.5 text-center text-xs uppercase tracking-widest font-semibold bg-amber-400 text-black hover:bg-amber-300 rounded transition-colors shadow"
                    >
                      Negotiate / Chat with Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab("tiers")}
                    className="block w-full py-2.5 text-center text-xs uppercase tracking-widest font-semibold border border-white/20 text-white hover:bg-white hover:text-black rounded transition-colors"
                  >
                    Manage Membership & Tiers
                  </button>
                </div>
              </div>

              {/* Live Dispatch / Admin Response Pill */}
              <div className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">
                  <span className="flex items-center gap-2 text-white">
                    <Bell className="w-3.5 h-3.5 text-white" /> Admin Dispatches
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-amber-400 font-bold font-mono text-[10px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                {userNotifications && userNotifications.length > 0 ? (
                  <div className="p-4 bg-white/5 border border-white/10 rounded space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <strong className="text-white uppercase font-display">{userNotifications[0].title}</strong>
                      <span className="text-white/50 font-mono">{userNotifications[0].time}</span>
                    </div>
                    <p className="text-xs text-[#8C8C8C] leading-relaxed line-clamp-2">
                      {userNotifications[0].message}
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[#8C8C8C]">
                    All notifications caught up.
                  </div>
                )}

                <button
                  onClick={() => setActiveTab("notifications")}
                  className="block w-full py-2.5 text-center text-xs uppercase tracking-widest font-semibold border border-white/20 text-white hover:bg-white hover:text-black rounded transition-colors"
                >
                  View All Responses ({userNotifications?.length || 0})
                </button>
              </div>

            </div>

            {/* Daily Athletic Improvement Ratio Animated Graph */}
            <div className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C8C8C] mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Progression Telemetry</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">
                      {workoutLogs.length > 0 ? `${workoutLogs.length} Sessions Logged` : "0 Sessions Logged This Week"}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                    Daily Improvement Ratio
                  </h2>
                </div>

                {/* Metric Selector Pills */}
                <div className="flex items-center gap-1.5 bg-[#1F1F1F] p-1 rounded-sm border border-white/10 self-start sm:self-auto">
                  {[
                    { id: "stamina", label: "Stamina & VO2", icon: Activity },
                    { id: "power", label: "Power & Velocity", icon: Zap },
                    { id: "volume", label: "Volume Load", icon: Trophy }
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMetric(m.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all ${
                          selectedMetric === m.id
                            ? "bg-white text-black font-bold shadow"
                            : "text-[#8C8C8C] hover:text-white"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Animated Interactive Bar & Trend Graph */}
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 pb-2 px-2 bg-black/40 rounded border border-white/5 relative">
                  
                  {/* Subtle Grid Guidelines */}
                  <div className="absolute inset-x-0 top-1/4 border-b border-white/[0.04] pointer-events-none" />
                  <div className="absolute inset-x-0 top-2/4 border-b border-white/[0.04] pointer-events-none" />
                  <div className="absolute inset-x-0 top-3/4 border-b border-white/[0.04] pointer-events-none" />

                  {dailyPerformance.map((item, idx) => {
                    const value = item[selectedMetric];
                    const isMax = idx === dailyPerformance.length - 1;

                    return (
                      <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group relative">
                        
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-white text-black px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap shadow-xl">
                          <strong>{item.ratio}</strong> · {item.focus}
                        </div>

                        {/* Ratio Pill */}
                        <span className={`text-[10px] font-mono transition-colors ${isMax ? "text-emerald-400 font-bold" : "text-[#8C8C8C]"}`}>
                          {item.ratio}
                        </span>

                        {/* Animated Bar Column */}
                        <div className="w-full max-w-[38px] bg-white/5 rounded-t-sm overflow-hidden flex items-end relative h-36">
                          <div
                            style={{ height: `${value}%` }}
                            className={`w-full transition-all duration-700 ease-out rounded-t-sm ${
                              isMax
                                ? "bg-gradient-to-t from-emerald-500/80 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                : "bg-gradient-to-t from-white/20 via-white/40 to-white group-hover:brightness-125"
                            }`}
                          />
                        </div>

                        {/* Day Label */}
                        <span className="text-[11px] font-mono text-white/70 uppercase group-hover:text-white transition-colors">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Graph Summary Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[#8C8C8C] font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Continuous Progression Tracking
                    </span>
                    <span>• Baseline: +2.1% daily threshold standard</span>
                  </div>
                  <span className="text-white/80">Peak Velocity: Sunday (Active Recovery)</span>
                </div>
              </div>
            </div>

            {/* Quick Classes Schedule Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white uppercase">Your Upcoming Classes</h2>
                </div>
                <Link to="/programs" className="text-xs uppercase tracking-wider text-white hover:underline flex items-center gap-1">
                  View Full Timetable <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm divide-y divide-white/10">
                {bookings && bookings.length > 0 ? (
                  bookings.map((b) => (
                    <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-lg font-bold text-white uppercase">{b.classTitle}</h4>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                            (b.status || "").toLowerCase() === "pending"
                              ? "bg-amber-400/20 text-amber-300 border-amber-400/30 animate-pulse"
                              : (b.status || "").toLowerCase() === "rejected" || (b.status || "").toLowerCase() === "declined"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }`}>
                            {b.status || "Pending"}
                          </span>
                        </div>
                        <span className="text-xs text-[#8C8C8C]">Lead Coach: {b.trainer} · Arena: {b.room}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-white/90 bg-white/5 px-3 py-1.5 rounded border border-white/10">
                          {b.date}
                        </span>
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 uppercase tracking-wider"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[#8C8C8C] space-y-2">
                    <p>No active class reservations found.</p>
                    <Link to="/programs" className="inline-block px-4 py-2 bg-white text-black font-bold uppercase rounded text-xs">
                      Reserve Your Spot on Floor
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 2. My Bookings Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Class Schedule & Reservations</h2>
              </div>
              {isPending ? (
                <span className="px-4 py-2 bg-white/10 text-[#8C8C8C] text-xs uppercase tracking-wider font-mono rounded">
                  Booking Locked (Order Pending)
                </span>
              ) : (
                <Link
                  to="/programs"
                  className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-[#F5F5F3]"
                >
                  Book More Classes
                </Link>
              )}
            </div>

            {isPending && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded text-xs text-amber-300 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Your membership is currently pending admin approval. You can view existing bookings or chat with admin, but reserving new arena slots is restricted until activated.
                </span>
              </div>
            )}

            <div className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm divide-y divide-white/10">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <div key={b.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-display text-xl font-bold text-white uppercase">{b.classTitle}</h4>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          (b.status || "").toLowerCase() === "pending"
                            ? "bg-amber-400/20 text-amber-300 border-amber-400/30 animate-pulse"
                            : (b.status || "").toLowerCase() === "rejected" || (b.status || "").toLowerCase() === "declined"
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}>
                          {b.status || "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C8C8C]">Assigned Instructor: {b.trainer} · Room: {b.room}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-white bg-white/5 px-3 py-2 rounded border border-white/10">
                        {b.date}
                      </span>
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:bg-rose-500/10 rounded uppercase tracking-wider transition-colors"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-xs text-[#8C8C8C] space-y-3">
                  <p>You have no scheduled class reservations.</p>
                  <Link to="/programs" className="inline-block px-5 py-2 bg-white text-black font-bold uppercase rounded text-xs">
                    Browse Weekly Timetable
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Membership Tiers & Access Plans Tab (Created / Managed by Admin) */}
        {activeTab === "tiers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-white uppercase">
                    Available Membership Tiers
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400 text-black shadow-sm">
                    {memberships?.length || 0} Plans Configured
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8C8C8C] max-w-sm">
                Plans created and deployed by Brave HQ Admin. Select a tier to upgrade or change your athletic privileges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {memberships && memberships.length > 0 ? (
                memberships.map((plan) => {
                  const isCurrent =
                    currentUser?.membership?.toLowerCase() === plan.name?.toLowerCase();

                  return (
                    <div
                      key={plan.id}
                      className={`p-6 sm:p-8 bg-white/5 bg-opacity-10 backdrop-blur-md rounded-sm space-y-6 flex flex-col justify-between border transition-all ${
                        isCurrent
                          ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.2)] -translate-y-1"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8C8C]">
                            Facility Plan
                          </span>
                          {isCurrent ? (
                            <span className="text-[10px] uppercase font-mono tracking-widest bg-amber-400 text-black font-bold px-2 py-0.5 rounded">
                              Current Plan
                            </span>
                          ) : plan.popular ? (
                            <span className="text-[10px] uppercase font-mono tracking-widest bg-white/10 text-white font-semibold px-2 py-0.5 rounded border border-white/20">
                              Popular Choice
                            </span>
                          ) : null}
                        </div>

                        <div>
                          <h3 className="font-display text-2xl font-bold text-white uppercase">
                            {plan.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                              ${plan.price}
                            </span>
                            <span className="text-xs text-[#8C8C8C] uppercase tracking-wider font-mono">
                              / {plan.billing || plan.interval || "monthly"}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#8C8C8C] leading-relaxed">
                          {plan.description}
                        </p>

                        <div className="pt-4 border-t border-white/10 space-y-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-white block">
                            Tier Inclusions:
                          </span>
                          <ul className="space-y-2">
                            {plan.features?.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-white/80">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        {isCurrent ? (
                          <button
                            disabled
                            className="w-full py-3 bg-white/10 text-white/60 font-bold uppercase text-xs tracking-wider rounded cursor-not-allowed text-center"
                          >
                            Currently Enrolled
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              await purchasePlan(plan);
                              confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
                            }}
                            className="w-full py-3 bg-white hover:bg-[#F5F5F3] text-black font-bold uppercase text-xs tracking-widest rounded transition-all shadow hover:scale-[1.01]"
                          >
                            {plan.cta || `Switch to ${plan.name}`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-10 text-center text-xs text-[#8C8C8C] bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm">
                  No membership tiers currently defined by Brave HQ.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Notifications & Admin Responses Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Admin Responses & Alerts</h2>
              </div>
              <button
                onClick={markNotificationsAsRead}
                className="text-xs uppercase tracking-wider text-white/70 hover:text-white border border-white/20 px-3 py-1.5 rounded"
              >
                Mark All Read
              </button>
            </div>

            <div className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm divide-y divide-white/10">
              {userNotifications && userNotifications.map((n) => (
                <div key={n.id} className={`p-6 flex items-start gap-4 transition-colors ${!n.read ? "bg-white/[0.03]" : ""}`}>
                  <div className={`p-2.5 rounded-full mt-1 ${
                    n.type === "admin_response" 
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" 
                      : n.type === "streak"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {n.type === "admin_response" ? <MessageSquare className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-base font-bold text-white uppercase">{n.title}</h4>
                      <span className="text-xs font-mono text-[#8C8C8C]">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#8C8C8C] leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Training Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Daily Workout Progression</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {workoutLogs.map((log) => (
                <div key={log.id} className="p-6 bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/10 rounded-sm space-y-3 shadow-lg">
                  <div className="flex justify-between items-baseline text-xs text-[#8C8C8C] font-mono">
                    <span>{log.date}</span>
                    <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">{log.weight}</span>
                  </div>
                  <h4 className="font-display text-xl font-bold text-white uppercase">{log.exercise}</h4>
                  <p className="text-xs text-[#8C8C8C] italic">"{log.notes}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log Workout Modal */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="bg-[#161616] border border-white/20 p-6 max-w-md w-full rounded-sm space-y-5 shadow-2xl">
              <h3 className="font-display text-2xl font-bold text-white uppercase">Log Workout Entry</h3>
              
              <form onSubmit={handleAddWorkout} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="log-exercise" className="uppercase font-mono text-[#8C8C8C] block mb-1">Exercise / Routine</label>
                  <input
                    id="log-exercise"
                    name="logExercise"
                    type="text"
                    required
                    placeholder="e.g. Clean & Jerk, 6 Rounds Sparring"
                    value={newLog.exercise}
                    onChange={(e) => setNewLog({ ...newLog, exercise: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="log-weight" className="uppercase font-mono text-[#8C8C8C] block mb-1">Load / Intensity</label>
                  <input
                    id="log-weight"
                    name="logWeight"
                    type="text"
                    placeholder="e.g. 275 lbs / RPE 9"
                    value={newLog.weight}
                    onChange={(e) => setNewLog({ ...newLog, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="log-notes" className="uppercase font-mono text-[#8C8C8C] block mb-1">Observation / Notes</label>
                  <textarea
                    id="log-notes"
                    name="logNotes"
                    rows="3"
                    placeholder="e.g. Hip extension felt rapid, breathing steady"
                    value={newLog.notes}
                    onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white text-black font-bold uppercase rounded hover:bg-[#F5F5F3]"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 👤 Athlete Profile Dossier Modal */}
        {showProfileModal && (
          <div
            onClick={() => {
              setShowProfileModal(false);
              setIsEditingProfile(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          >
            <div
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
              className="bg-white/5 bg-opacity-10 backdrop-blur-md border border-white/20 max-w-2xl w-full rounded-sm p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain"
            >
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setIsEditingProfile(false);
                }}
                className="absolute top-6 right-6 p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close profile modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-6">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/40 bg-black shadow-xl">
                    <img
                      src={profileForm.avatar || currentUser?.avatar}
                      alt={profileForm.name}
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                  </div>
                  {/* Green status indicator outside overflow-hidden */}
                  <span 
                    className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[#141414] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.9)] z-10" 
                    title="Active Standing" 
                  />
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C8C8C] bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                      Member Dossier
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      {currentUser?.status}
                    </span>
                  </div>

                  <h2 className="font-display text-3xl font-extrabold text-white uppercase tracking-tight">
                    {profileForm.name}
                  </h2>
                  <p className="text-xs text-[#8C8C8C] flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-white/70" />
                    <span>{currentUser?.email}</span>
                    <span>•</span>
                    <span className="font-mono">ID: {currentUser?.id}</span>
                  </p>
                </div>
              </div>

              {/* Toggle Between View Mode and Full Edit Mode */}
              {isEditingProfile ? (
                /* EDIT PROFILE FORM */
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  
                  {/* Custom Photo Upload & Avatar Picker */}
                  <div className="space-y-3 bg-[#1A1A1A] p-4 rounded border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="font-mono uppercase text-[#8C8C8C] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-white/80" /> Custom Profile Picture
                      </label>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-[#F5F5F3] transition-colors shadow">
                        <Upload className="w-3 h-3" />
                        <span>Upload From Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="athlete-avatar-url"
                        name="athleteAvatarUrl"
                        type="text"
                        placeholder="Or paste direct image URL (https://...)"
                        value={profileForm.avatar.startsWith("data:") ? "Custom Image Uploaded" : profileForm.avatar}
                        onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-[#242424] border border-white/15 rounded text-white text-xs focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-[#8C8C8C] block">Or Select Preset Roster Badge:</span>
                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {availableAvatars.map((av, i) => (
                          <div
                            key={i}
                            onClick={() => setProfileForm({ ...profileForm, avatar: av })}
                            className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                              profileForm.avatar === av
                                ? "border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                                : "border-white/20 opacity-50 hover:opacity-100"
                            }`}
                          >
                            <img src={av} alt="avatar option" className="w-full h-full object-cover grayscale" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Athlete Name */}
                  <div className="space-y-1">
                    <label htmlFor="athlete-name" className="font-mono uppercase text-[#8C8C8C]">Full Athlete Name *</label>
                    <input
                      id="athlete-name"
                      name="athleteName"
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Weight Division & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="athlete-weight" className="font-mono uppercase text-[#8C8C8C]">Weight Division</label>
                      <input
                        id="athlete-weight"
                        name="athleteWeight"
                        type="text"
                        value={profileForm.weightClass}
                        onChange={(e) => setProfileForm({ ...profileForm, weightClass: e.target.value })}
                        placeholder="e.g. Middleweight (75 kg)"
                        className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="athlete-discipline" className="font-mono uppercase text-[#8C8C8C]">Discipline Focus</label>
                      <input
                        id="athlete-discipline"
                        name="athleteDiscipline"
                        type="text"
                        value={profileForm.discipline}
                        onChange={(e) => setProfileForm({ ...profileForm, discipline: e.target.value })}
                        placeholder="e.g. Championship Boxing"
                        className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Athlete Bio & Ethos */}
                  <div className="space-y-1">
                    <label htmlFor="athlete-bio" className="font-mono uppercase text-[#8C8C8C]">Athlete Bio & Training Mission</label>
                    <textarea
                      id="athlete-bio"
                      name="athleteBio"
                      rows="3"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white resize-none"
                    ></textarea>
                  </div>

                  {/* Form Controls */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 border border-white/20 text-white/70 hover:text-white rounded uppercase text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#F5F5F3]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW PROFILE MODE */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#1A1A1A] p-4 rounded border border-white/10 space-y-1">
                      <span className="font-mono uppercase text-[#8C8C8C] flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-white" /> Membership Standing
                      </span>
                      <div className="text-white font-bold text-sm">{currentUser?.membership}</div>
                      <p className="text-[#8C8C8C] text-[11px]">Valid through {currentUser?.renewalDate}</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-4 rounded border border-white/10 space-y-1">
                      <span className="font-mono uppercase text-[#8C8C8C] flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Discipline Metrics
                      </span>
                      <div className="text-white font-bold text-sm flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>{currentUser?.streak || 18} Consecutive Days</span>
                      </div>
                      <p className="text-[#8C8C8C] text-[11px]">{currentUser?.sessionsThisMonth || 14} logged gym sessions this month</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-4 rounded border border-white/10 space-y-1">
                      <span className="font-mono uppercase text-[#8C8C8C] block">Weight Division / Biometrics</span>
                      <div className="text-white font-semibold text-sm">{profileForm.weightClass}</div>
                      <p className="text-[#8C8C8C] text-[11px]">Optimal CNS strain score: 92%</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-4 rounded border border-white/10 space-y-1">
                      <span className="font-mono uppercase text-[#8C8C8C] block">Specialized Discipline Focus</span>
                      <div className="text-white font-semibold text-sm">{profileForm.discipline}</div>
                      <p className="text-[#8C8C8C] text-[11px]">Assigned Coach: Marcus Vance</p>
                    </div>
                  </div>

                  {/* Bio & Ethos */}
                  <div className="bg-[#1A1A1A] p-4 rounded border border-white/10 space-y-1 text-xs">
                    <span className="font-mono uppercase text-[#8C8C8C] block">Athlete Ethos & Mission</span>
                    <p className="text-white/90 italic leading-relaxed">
                      "{profileForm.bio}"
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-[#8C8C8C]">Identity verified via Brave HQ Biometrics</span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 border border-white/20 hover:border-white text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                      <button
                        onClick={() => setShowProfileModal(false)}
                        className="px-5 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#F5F5F3]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

      </div>
      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col mb-4 overflow-hidden origin-bottom-right animate-in slide-in-from-bottom-5 fade-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 to-black/40 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden">
                    <img src="/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg" alt="HQ" className="w-full h-full object-cover grayscale opacity-80" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-display font-bold uppercase tracking-wide text-sm">Brave Gym HQ</h3>
                  <p className="text-[10px] text-amber-400 font-mono uppercase">Director Marcus Vance</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/40 scrollbar-thin scrollbar-thumb-white/10">
              <div className="text-center mb-6">
                <span className="text-[10px] font-mono text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  End-to-End Encrypted Session
                </span>
              </div>

              {/* Initial message */}
              <div className="flex flex-col items-start group">
                <div className="bg-[#1C1C1C]/80 backdrop-blur-md text-white/90 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] leading-relaxed shadow-lg">
                  Welcome to Brave Gym. Your membership order for <strong className="text-amber-400">{currentUser?.membership}</strong> is on my desk. How can I help you today?
                </div>
                <span className="text-[10px] text-white/30 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  System · HQ
                </span>
              </div>

              {/* Thread messages */}
              {(() => {
                const messages = userConsultation?.chatMessages || userConsultation?.chatHistory || [];
                return messages.map((msg, mIdx) => {
                  const isMe = msg.sender === "user";
                  return (
                    <div key={mIdx} className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-lg ${
                        isMe
                          ? "bg-gradient-to-br from-amber-500 to-amber-600 text-black font-medium rounded-tr-sm"
                          : "bg-[#1C1C1C]/80 backdrop-blur-md text-white/90 border border-white/10 rounded-tl-sm"
                      }`}>
                        {msg.text}
                      </div>
                      <span className={`text-[10px] text-white/30 mt-1 mx-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "text-right" : "text-left"}`}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                  );
                });
              })()}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/60 backdrop-blur-xl border-t border-white/10">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!chatMessageInput.trim()) return;
                  const text = chatMessageInput.trim();
                  setChatMessageInput("");
                  try {
                    const consultationId = userConsultation?.id || "order-user-" + currentUser?.id;
                    await sendNegotiationMessage(consultationId, text, "user");
                  } catch (err) {
                    console.error("Failed to send message:", err);
                  }
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form.requestSubmit();
                    }
                  }}
                  placeholder="Message HQ..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all resize-none min-h-[44px] max-h-[120px]"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!chatMessageInput.trim()}
                  className="w-11 h-11 shrink-0 bg-amber-500 hover:bg-amber-400 disabled:bg-white/5 disabled:text-white/20 text-black flex items-center justify-center rounded-xl transition-all shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group relative"
          >
            <MessageSquare className="w-6 h-6" />
            {isPending && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-[#0D0D0D] rounded-full animate-bounce" />
            )}
          </button>
        )}
      </div>

    </div>
  );
}
