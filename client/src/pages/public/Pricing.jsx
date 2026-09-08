import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Flame, HelpCircle, ShieldCheck, ArrowRight, UserPlus } from "lucide-react";
import { useGym } from "../../context/GymContext";
import confetti from "canvas-confetti";

export default function Pricing() {
  const { memberships, purchasePlan, currentUser } = useGym();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchased, setPurchased] = useState(false);

  const handleCheckout = async (plan) => {
    if (!currentUser) {
      navigate(`/register?tier=${encodeURIComponent(plan.name)}&notice=pkg_required`);
      return;
    }

    setSelectedPlan(plan);
    setPurchased(true);
    await purchasePlan(plan);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffffff", "#cccccc", "#222222"]
    });
  };

  const faqs = [
    {
      q: "What makes Brave Gym different from commercial fitness chains?",
      a: "No crowded machines, no fluff. Every square foot is optimized for athletic capability: custom competition rings, rogue barbells, specialized conditioning ergometers, and coaches who program specifically for individual progression."
    },
    {
      q: "Can complete beginners attend Championship Boxing or Iron Strength?",
      a: "Yes. Being brave is about taking the first step. Our coaches provide scalable modifications for technique, volume, and intensity to build your foundation without compromising safety."
    },
    {
      q: "Are gloves and hand wraps provided?",
      a: "Trial and Black Tier memberships include premium sanitized loaner gloves and complimentary custom Brave hand wraps."
    },
    {
      q: "Can I freeze or pause my membership if I travel?",
      a: "Members can pause memberships for up to 30 consecutive days per calendar year with zero fees via the Member Hub."
    }
  ];

  return (
    <div className="pt-28 pb-32 bg-[#0D0D0D] min-h-screen px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#8C8C8C] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            Pricing Architecture
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-extrabold text-white tracking-tight uppercase leading-none">
            INVEST IN YOUR<br />
            <span className="text-[#8C8C8C]">PHYSICAL CAPITAL.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#8C8C8C] leading-relaxed">
            Transparent pricing without activation fees, automated cancellation locks, or fine print. Choose the membership level that matches your ambition.
          </p>

          {!currentUser && (
            <div className="pt-2 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white/5 border border-white/10 text-xs text-[#8C8C8C]">
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Visitors: Selecting any tier will prompt you to create your athlete profile first.</span>
              </div>
            </div>
          )}
        </div>

        {/* Purchase Confirmation Toast */}
        {purchased && (
          <div className="max-w-xl mx-auto p-6 bg-white/10 border border-white/30 rounded-sm text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-white mx-auto" />
            <h3 className="font-display text-2xl font-bold text-white uppercase">
              Welcome to {selectedPlan?.name}
            </h3>
            <p className="text-xs text-[#8C8C8C]">
              Your tier privileges are now activated on your account. Head to your Member Hub to view class credits and schedule sessions.
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        {memberships && memberships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {memberships.map((plan) => {
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`rounded-sm p-8 flex flex-col justify-between border relative transition-all ${
                    isPopular
                      ? "bg-[#161616] border-white shadow-[0_0_50px_rgba(255,255,255,0.15)] -translate-y-2"
                      : "bg-[#121212] border-white/10 hover:border-white/30"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-black font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 fill-black" />
                      Most Popular Choice
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">
                        Membership Tier
                      </span>
                      <h2 className="font-display text-3xl font-bold text-white uppercase mt-1">
                        {plan.name}
                      </h2>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-6xl font-extrabold text-white">
                        ${plan.price}
                      </span>
                      <span className="text-xs uppercase tracking-widest text-[#8C8C8C]">
                        / {plan.interval || plan.billing || "monthly"}
                      </span>
                    </div>

                    <p className="text-xs text-[#8C8C8C] leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="pt-6 border-t border-white/10 space-y-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-white block">
                        Program Inclusions:
                      </span>
                      <ul className="space-y-2.5">
                        {plan.features?.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                            <Check className="w-4 h-4 shrink-0 text-white mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-white/10">
                    <button
                      onClick={() => handleCheckout(plan)}
                      className={`w-full py-4 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isPopular
                          ? "bg-white text-black hover:bg-[#F5F5F3]"
                          : "border border-white/30 text-white hover:bg-white hover:text-black"
                      }`}
                    >
                      Select {plan.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#8C8C8C] bg-[#121212] border border-white/10 rounded-sm max-w-xl mx-auto space-y-3">
            <ShieldCheck className="w-8 h-8 text-white/40 mx-auto" />
            <h3 className="font-display text-lg font-bold text-white uppercase">Subscription Plans Updating</h3>
            <p>Admin is currently configuring active membership options. Please contact reception or request an intake consultation.</p>
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-8 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#8C8C8C]">Clarity & Policy</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white uppercase">
              Frequently Clarified Questions
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map((faq, i) => (
              <div key={i} className="py-6 space-y-2">
                <h4 className="font-display text-lg font-bold text-white uppercase flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-white/40" />
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-[#8C8C8C] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
