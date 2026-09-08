import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Clock, Users } from "lucide-react";
import { useGym } from "../../context/GymContext";
import Reveal from "../common/Reveal";

export default function ProgramsPinned() {
  const { programs } = useGym();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeProg = programs[activeIdx] || programs[0];

  const programImages = [
    "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
    "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
    "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg",
    "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg"
  ];

  return (
    <section className="relative bg-[#0D0D0D] py-32 px-6 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header with Lazy Reveal */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-[#8C8C8C] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Choreographed Disciplines
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight uppercase leading-none">
                BUILT FOR POWER.<br />
                <span className="text-[#8C8C8C]">TEMPERED BY REPETITION.</span>
              </h2>
            </div>
            <p className="text-sm text-[#8C8C8C] max-w-sm leading-relaxed">
              Our training system is rooted in athletic science: high-density kinetic striking, barbell strength mechanics, and targeted restorative therapy.
            </p>
          </div>
        </Reveal>

        {/* 60/40 Asymmetrical Sticky Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left 7 Columns: Sticky Image Presentation */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <Reveal delay={0.1}>
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden rounded-sm border border-white/10 group shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <img
                  key={activeIdx}
                  src={programImages[activeIdx % programImages.length]}
                  alt={activeProg.title}
                  className="w-full h-full object-cover grayscale contrast-125 transition-all duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                
                {/* Bottom Badge details */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase">
                      {activeProg.title}
                    </h3>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-xs tracking-wider uppercase text-white/80 bg-black/60 backdrop-blur-md px-3 py-2 rounded border border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {activeProg.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-white" />
                      {activeProg.intensity}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right 5 Columns: Scrollable List with Staggered Lazy Entrance */}
          <div className="lg:col-span-5 space-y-4">
            {programs.map((prog, idx) => {
              const isCurrent = idx === activeIdx;
              return (
                <Reveal key={prog.id} delay={0.1 + idx * 0.08}>
                  <div
                    onClick={() => setActiveIdx(idx)}
                    className={`p-6 sm:p-8 rounded-sm cursor-pointer transition-all duration-300 border ${
                      isCurrent
                        ? "bg-[#1A1A1A] border-white/40 shadow-lg translate-x-2"
                        : "bg-[#141414] border-white/5 hover:border-white/20 hover:bg-[#181818]"
                    }`}
                  >
                    <h4 className="font-display text-2xl font-bold text-white uppercase tracking-tight mb-2">
                      {prog.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-[#8C8C8C] leading-relaxed mb-4">
                      {prog.subtitle}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs tracking-wider uppercase text-[#8C8C8C]">
                      <span className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-white/60" />
                        Lead: <strong className="text-white">{prog.trainer}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-white font-medium group-hover:underline">
                        Inspect Discipline <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}

            <Reveal delay={0.45}>
              <div className="pt-4">
                <Link
                  to="/programs"
                  className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-[#F5F5F3] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  View Full Weekly Timetable
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>

        </div>

      </div>
    </section>
  );
}
