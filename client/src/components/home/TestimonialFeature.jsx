import React from "react";
import { Quote, Star } from "lucide-react";
import { INITIAL_TESTIMONIALS } from "../../lib/mockData";
import Reveal from "../common/Reveal";

export default function TestimonialFeature() {
  const item = INITIAL_TESTIMONIALS[0];

  if (!item) return null;

  return (
    <section className="relative bg-[#0D0D0D] py-32 px-6 border-b border-white/10 overflow-hidden">
      
      {/* Huge background quote glyph */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-white/[0.03] text-[35vw] font-display font-black leading-none">
        “
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center space-y-10">
        
        <Reveal>
          <div className="flex items-center justify-center gap-1.5 text-white">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-white text-white" />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <blockquote className="font-display font-medium text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.2]">
            "{item.quote}"
          </blockquote>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="pt-4 flex flex-col items-center gap-2">
            <span className="font-display font-bold text-lg text-white uppercase tracking-wider">
              {item.author}
            </span>
            <span className="text-xs text-[#8C8C8C] uppercase tracking-widest">
              {item.role}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded border border-white/20 text-white/70 mt-1">
              {item.badge}
            </span>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
