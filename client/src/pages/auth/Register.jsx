import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock, Mail, User, Shield, AlertCircle, Flame, Check, Info } from "lucide-react";
import { useGym } from "../../context/GymContext";
import confetti from "canvas-confetti";

export default function Register() {
  const [searchParams] = useSearchParams();
  const { register, memberships } = useGym();
  const navigate = useNavigate();

  const noticeType = searchParams.get("notice");
  const targetRedirect = searchParams.get("redirect");
  const classTitle = searchParams.get("classTitle");
  const trainerName = searchParams.get("trainerName");
  const requestedTier = searchParams.get("tier");

  const preselectedTier = requestedTier || (memberships && memberships.length > 0 ? memberships[0].name : "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTier, setSelectedTier] = useState(preselectedTier);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please complete all registration fields.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Full name must be at least 2 characters long.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address format (e.g. name@domain.com).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await register(name, email, password, "user", selectedTier);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });

      if (user.role === "admin") {
        navigate("/admin");
      } else if (targetRedirect && targetRedirect.startsWith("/")) {
        navigate(targetRedirect);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to create account. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-32 bg-[#0D0D0D] min-h-screen px-6 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-sm border border-white/15 overflow-hidden bg-[#141414] shadow-2xl">
        
        {/* Left Side Imagery */}
        <div className="lg:col-span-5 relative hidden lg:block bg-black">
          <img
            src="/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg"
            alt="Brave Gym Training"
            className="w-full h-full object-cover grayscale contrast-125 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
          <div className="absolute bottom-8 left-8 right-8 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8C8C]">
              Athlete Enlistment
            </span>
            <h3 className="font-display text-2xl font-bold text-white uppercase leading-tight">
              Begin The<br />Discipline.
            </h3>
            <p className="text-xs text-[#8C8C8C] leading-relaxed">
              Create your profile to reserve trial classes, connect with coaching staff, and unlock the facility timetable.
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.png" alt="Brave Gym Logo" className="w-8 h-8 object-contain" />
              <span className="font-display font-bold text-lg text-white uppercase tracking-wider">
                BRAVE <span className="text-[#8C8C8C] font-normal">GYM</span>
              </span>
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">
              Registration Standard
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              Create Athlete Profile
            </h1>
            <p className="text-xs text-[#8C8C8C]">
              Join the cohort. Receive your complimentary 3-day access pass upon registration.
            </p>
          </div>

          {/* Contextual Notice Banner for Visitors */}
          {noticeType === "pkg_required" && (
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded text-xs text-amber-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block text-amber-200">Registration Required for Membership Tiers</strong>
                <span>Please create your athlete profile first to select and activate the <strong>{requestedTier || "selected"}</strong> package.</span>
              </div>
            </div>
          )}

          {noticeType === "class_required" && (
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded text-xs text-amber-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block text-amber-200">Registration Required for Class Booking</strong>
                <span>You must register an athlete profile first to reserve your spot {classTitle ? <span>in <strong>{classTitle}</strong></span> : "in any class session"}.</span>
              </div>
            </div>
          )}

          {noticeType === "consultation_required" && (
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded text-xs text-amber-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block text-amber-200">Registration Required for Coach Consultations</strong>
                <span>Please create your profile first to request private 1-on-1 coaching {trainerName ? <span>with <strong>{trainerName}</strong></span> : "with our faculty"}.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="uppercase font-mono text-[#8C8C8C] block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-3" />
                <input
                  id="register-name"
                  name="name"
                  autoComplete="name"
                  type="text"
                  required
                  placeholder="e.g. Liam Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1C] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-email" className="uppercase font-mono text-[#8C8C8C] block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-3" />
                <input
                  id="register-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  required
                  placeholder="athlete@discipline.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1C] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-password" className="uppercase font-mono text-[#8C8C8C] block">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-3" />
                <input
                  id="register-password"
                  name="password"
                  autoComplete="new-password"
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1C] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Membership Tier Selector (Populated from Admin-Created Tiers) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="register-tier" className="uppercase font-mono text-[#8C8C8C] block text-[11px]">
                  Select Starting Membership Tier
                </label>
                <Link to="/pricing" className="text-[10px] text-amber-400 hover:underline uppercase font-mono">
                  Compare Tiers
                </Link>
              </div>
              <div className="relative">
                <Shield className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  id="register-tier"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1C] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-amber-400 transition-colors font-sans"
                >
                  {memberships && memberships.length > 0 ? (
                    memberships.map((tier) => (
                      <option key={tier.id} value={tier.name} className="bg-[#1C1C1C] text-white">
                        {tier.name} — ${tier.price} / {tier.billing || tier.interval || "monthly"}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled className="bg-[#1C1C1C] text-[#8C8C8C]">No memberships currently available</option>
                  )}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#F5F5F3] transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Enlist & Access Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-[#8C8C8C]">
            Already have an active profile?{" "}
            <Link to="/login" className="text-white uppercase tracking-wider font-semibold hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
