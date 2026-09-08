import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock, Mail, Shield, AlertCircle } from "lucide-react";
import { useGym } from "../../context/GymContext";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useGym();
  const navigate = useNavigate();

  const targetRedirect = searchParams.get("redirect");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required credentials.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await login(email, password);
      if (user.role === "admin") {
        navigate("/admin");
      } else if (targetRedirect && targetRedirect.startsWith("/")) {
        navigate(targetRedirect);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-32 bg-[#0D0D0D] min-h-screen px-6 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-sm border border-white/15 overflow-hidden bg-[#141414] shadow-2xl">
        
        {/* Left Side: Brand Imagery */}
        <div className="lg:col-span-5 relative hidden lg:block bg-black">
          <img
            src="/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg"
            alt="Brave Gym Ring"
            className="w-full h-full object-cover grayscale contrast-125 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
          <div className="absolute bottom-8 left-8 right-8 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8C8C]">
              Member Portal
            </span>
            <h3 className="font-display text-2xl font-bold text-white uppercase leading-tight">
              Raw Effort.<br />Refined Discipline.
            </h3>
            <p className="text-xs text-[#8C8C8C] leading-relaxed">
              Log in to manage training reservations, track athletic milestones, and access facility benefits.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.png" alt="Brave Gym Logo" className="w-8 h-8 object-contain" />
              <span className="font-display font-bold text-lg text-white uppercase tracking-wider">
                BRAVE <span className="text-[#8C8C8C] font-normal">GYM</span>
              </span>
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C] block">
              Security Verification
            </span>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              Sign In To Arena
            </h1>
            <p className="text-xs text-[#8C8C8C]">
              Enter your credentials to enter your member hub or administrative console.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="uppercase font-mono text-[#8C8C8C] block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-3" />
                <input
                  id="login-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  required
                  placeholder="athlete@bravegym.com or admin@bravegym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1C] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="uppercase font-mono text-[#8C8C8C] block">Password</label>
                <a href="#reset" className="text-[11px] text-[#8C8C8C] hover:text-white transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-3" />
                <input
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1C] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#F5F5F3] transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Authenticate & Enter
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-[#8C8C8C]">
            New to Brave Gym?{" "}
            <Link to="/register" className="text-white uppercase tracking-wider font-semibold hover:underline">
              Create Athlete Profile
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
