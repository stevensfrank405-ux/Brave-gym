import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shield, 
  User, 
  Menu, 
  X, 
  Flame, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ChevronDown, 
  Calendar, 
  Settings,
  ArrowUpRight,
  LayoutDashboard,
  Bell,
  DollarSign,
  MessageSquare,
  Layers
} from "lucide-react";
import { useGym } from "../../context/GymContext";
import { getUserAvatarUrl, handleAvatarError } from "../../utils/mediaUtils";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useGym();

  const navLinks = [
    { label: "Programs", path: "/programs" },
    { label: "Trainers", path: "/trainers" },
    { label: "Memberships", path: "/pricing" },
    { label: "Gallery", path: "/gallery" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (p) => location.pathname === p;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile drawer menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0D0D0D]/85 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded overflow-hidden flex items-center justify-center p-0.5 border border-white/20 bg-black group-hover:border-white/50 transition-all duration-300 group-hover:scale-105 shadow-md">
            <img
              src="/logo.png"
              alt="Brave Gym Logo"
              className="w-full h-full object-contain filter brightness-110"
            />
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-white uppercase group-hover:text-white/80 transition-colors">
            BRAVE <span className="text-[#8C8C8C] font-normal">GYM</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm tracking-widest uppercase transition-colors relative py-1 ${
                isActive(link.path)
                  ? "text-white font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white"
                  : "text-[#8C8C8C] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Circular Profile Avatar with Dropdown */}
        <div className="hidden lg:flex items-center gap-5">
          
          {/* Circular Avatar / Account Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all group focus:outline-none"
              aria-label="User Account Menu"
            >
              {currentUser ? (
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/40 bg-black">
                    <img
                      src={getUserAvatarUrl(currentUser.avatar, currentUser.role)}
                      alt={currentUser.name || "Account"}
                      onError={(e) => handleAvatarError(e, currentUser.role)}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  {currentUser.role === "admin" && (
                    <span 
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 border-2 border-black rounded-full shadow-[0_0_8px_rgba(251,191,36,0.9)] z-20 pointer-events-none" 
                      title="Admin Account" 
                    />
                  )}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              )}

              <ChevronDown className={`w-3.5 h-3.5 text-[#8C8C8C] group-hover:text-white transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#141414] border border-white/15 rounded-sm shadow-2xl p-2 z-50 animate-fade-in divide-y divide-white/10">
                
                {/* User Info Header if logged in */}
                {currentUser ? (
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8C8C]">Signed In As</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/15">
                        {currentUser.role}
                      </span>
                    </div>
                    <strong className="font-display font-bold text-white text-base block truncate uppercase">
                      {currentUser.name}
                    </strong>
                    <span className="text-xs text-[#8C8C8C] block truncate">{currentUser.email}</span>
                  </div>
                ) : (
                  <div className="p-3 text-left">
                    <span className="text-xs font-mono uppercase tracking-widest text-white/80 block">Welcome Athlete</span>
                    <span className="text-[11px] text-[#8C8C8C]">Sign in to access class bookings & training metrics</span>
                  </div>
                )}

                {/* Menu Action Links */}
                <div className="py-2 space-y-1">
                  {currentUser ? (
                    <>
                      {currentUser.role === "admin" ? (
                        /* Admin Role: Only Show Admin Profile and Sign Out */
                        <Link
                          to="/admin?view=profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-amber-300 hover:bg-white/10 rounded transition-colors font-semibold"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          Admin Profile
                        </Link>
                      ) : (
                        /* Regular Member Athlete: Profile Hub & Dashboard */
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/10 rounded transition-colors font-medium"
                          >
                            <User className="w-3.5 h-3.5 text-white/70" />
                            Athlete Profile
                          </Link>

                          <Link
                            to="/programs"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/10 rounded transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5 text-white/70" />
                            Book A Session
                          </Link>

                          <Link
                            to="/pricing"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/10 rounded transition-colors"
                          >
                            <Flame className="w-3.5 h-3.5 text-white/70" />
                            Membership Tier
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/10 rounded transition-colors font-medium"
                      >
                        <LogIn className="w-3.5 h-3.5 text-white" />
                        Sign In
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/10 rounded transition-colors font-medium"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-white" />
                        Create Account
                      </Link>
                    </>
                  )}
                </div>

                {/* Footer action */}
                {currentUser && (
                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Top Bar Action Button:
              - Guests (Not Logged In): "Trial Pass" (links to /pricing)
              - Regular Logged-in Athlete: "Dashboard 🔥 {streak}d" (links to /dashboard)
              - Admin: Clean, uncluttered view (or discrete Admin badge) since they manage the system
          */}
          {!currentUser ? (
            <Link
              to="/pricing"
              className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-bold bg-white text-black rounded-sm hover:bg-[#F5F5F3] transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
            >
              <Flame className="w-3.5 h-3.5 fill-black" />
              Trial Pass
            </Link>
          ) : currentUser.role !== "admin" ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold bg-white text-black rounded-sm hover:bg-[#F5F5F3] transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.25)] group"
            >
              <LayoutDashboard className="w-3.5 h-3.5 fill-black text-black" />
              <span>Dashboard</span>
              <span className="flex items-center gap-1 font-mono text-[10px] bg-black text-white px-1.5 py-0.5 rounded ml-0.5" title="Discipline Streak">
                <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {currentUser.streak || 18}d
              </span>
            </Link>
          ) : (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-wider font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-sm hover:bg-amber-400 hover:text-black transition-all"
            >
              <Shield className="w-3 h-3" />
              Admin Console
            </Link>
          )}
        </div>

        {/* Mobile Right Section: Profile Avatar & Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          {currentUser && (
            <Link
              to={currentUser.role === "admin" ? "/admin?view=profile" : "/dashboard"}
              className="relative shrink-0 block"
              aria-label="User Profile"
            >
              <div className={`w-8 h-8 rounded-full overflow-hidden border ${currentUser.role === "admin" ? "border-amber-400" : "border-white/40"} bg-black`}>
                <img
                  src={getUserAvatarUrl(currentUser.avatar, currentUser.role)}
                  alt={currentUser.name || "Account"}
                  onError={(e) => handleAvatarError(e, currentUser.role)}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </div>
              {currentUser.role === "admin" ? (
                <span 
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border border-black rounded-full shadow-[0_0_6px_rgba(251,191,36,0.9)] z-20 pointer-events-none" 
                  title="Admin Account" 
                />
              ) : (
                <span 
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full shadow-[0_0_6px_rgba(52,211,153,0.9)] z-20 pointer-events-none" 
                  title="Athlete Online" 
                />
              )}
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Drawer with Unified Navigation & Admin Suite */}
      {mobileOpen && (
        <div 
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="md:hidden fixed top-20 left-0 right-0 bottom-0 h-[calc(100dvh-5rem)] bg-[#0D0D0D] border-b border-white/15 px-5 py-6 space-y-6 overflow-y-auto overscroll-contain animate-fade-in shadow-2xl z-50 flex flex-col justify-between"
        >
          
          {/* User Account Card at Top of Drawer */}
          {currentUser ? (
            <div className="p-3.5 bg-[#141414] border border-white/10 rounded-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-black shrink-0 relative">
                  <img
                    src={getUserAvatarUrl(currentUser.avatar, currentUser.role)}
                    alt={currentUser.name || "User"}
                    onError={(e) => handleAvatarError(e, currentUser.role)}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div className="min-w-0">
                  <strong className="text-white text-sm block uppercase font-display truncate">{currentUser.name}</strong>
                  <span className="text-[11px] text-[#8C8C8C] truncate block">{currentUser.email}</span>
                </div>
              </div>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                currentUser.role === "admin" ? "bg-amber-400 text-black shadow" : "bg-white text-black"
              }`}>
                {currentUser.role}
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-[#141414] border border-white/10 rounded-sm">
              <span className="text-xs font-mono uppercase tracking-widest text-white/80 block">Welcome Athlete</span>
              <p className="text-[11px] text-[#8C8C8C] mt-0.5">Sign in to book sessions, log metrics, or manage gym operations.</p>
            </div>
          )}

          {/* 🛡️ IF ADMIN: Dedicated Admin Console Hub Links */}
          {currentUser && currentUser.role === "admin" && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[11px] uppercase font-mono tracking-widest text-amber-300 border-b border-white/10 pb-1.5 font-bold">
                <span>Admin Operations HQ</span>
                <span className="text-[10px] text-emerald-400 font-mono">Live</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/admin?view=profile"
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-2 text-xs font-semibold text-white active:scale-95 transition-transform"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Admin Profile</span>
                </Link>
                <Link
                  to="/admin?tab=overview"
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-2 text-xs font-semibold text-white active:scale-95 transition-transform"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="truncate">HQ Overview</span>
                </Link>
                <Link
                  to="/admin?tab=requests"
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-2 text-xs font-semibold text-white active:scale-95 transition-transform"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">Consultations</span>
                </Link>
                <Link
                  to="/admin?tab=schedule"
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-2 text-xs font-semibold text-white active:scale-95 transition-transform"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Timetable</span>
                </Link>
                <Link
                  to="/admin?tab=finances"
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-2 text-xs font-semibold text-white active:scale-95 transition-transform"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Finances</span>
                </Link>
                <Link
                  to="/admin?tab=tiers"
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-2 text-xs font-semibold text-white active:scale-95 transition-transform"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Membership Tiers</span>
                </Link>
              </div>
            </div>
          )}

          {/* 🌐 All Public Navigation Links (Programs, Trainers, Memberships, Gallery, About, Contact) */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] uppercase font-mono tracking-widest text-[#8C8C8C] block border-b border-white/10 pb-1.5">
              Arena Navigation
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-xs uppercase tracking-wider text-[#8C8C8C] hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Session Action Buttons */}
          <div className="pt-4 pb-12 border-t border-white/10 flex flex-col gap-2.5">
            {currentUser ? (
              <>
                {currentUser.role === "admin" ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-xs uppercase tracking-wider font-bold bg-amber-400 text-black text-center rounded shadow"
                  >
                    Open Admin Console
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-xs uppercase tracking-wider font-bold bg-white text-black text-center rounded flex items-center justify-center gap-2 shadow"
                  >
                    <User className="w-3.5 h-3.5" />
                    Go to Member Hub
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="py-2.5 text-xs uppercase tracking-wider text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 text-center rounded transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-xs uppercase tracking-wider font-bold bg-white text-black text-center rounded"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-xs uppercase tracking-wider border border-white/30 text-white text-center rounded"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
