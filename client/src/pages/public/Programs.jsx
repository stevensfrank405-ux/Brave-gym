import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Flame, Users, Calendar, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert, Check } from "lucide-react";
import { useGym } from "../../context/GymContext";
import confetti from "canvas-confetti";

export default function Programs() {
  const { currentUser, programs, schedule, bookings, bookClass } = useGym();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedClassToBook, setSelectedClassToBook] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingError, setBookingError] = useState(null);

  const isPending = currentUser && currentUser.role !== "admin" && (currentUser.status === "Pending" || currentUser.status?.toLowerCase().includes("pending"));

  const categories = ["ALL", "BOXING", "STRENGTH", "METABOLIC", "RECOVERY"];

  const filteredPrograms = programs.filter((p) => {
    if (selectedCategory === "ALL") return true;
    if (selectedCategory === "BOXING") return p.id === "boxing";
    if (selectedCategory === "STRENGTH") return p.id === "strength";
    if (selectedCategory === "METABOLIC") return p.id === "conditioning";
    if (selectedCategory === "RECOVERY") return p.id === "recovery";
    return true;
  });

  const openBookingModal = (sc) => {
    if (sc.spotsLeft <= 0) return;
    setBookingError(null);

    if (isPending) {
      setBookingError("Your account/membership is currently Pending Admin Verification. Bookings will unlock once HQ approves your order.");
      return;
    }

    setSelectedClassToBook(sc);
    
    // Default to next week based on schedule day, or just current date
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
    setSelectedTime(sc.time.split(" ")[0]); // naive default from sc.time
    
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedClassToBook || !selectedDate || !selectedTime) return;

    try {
      const formattedDate = `${selectedDate} ${selectedTime}`;
      const booking = await bookClass({
        ...selectedClassToBook,
        date: formattedDate
      });
      
      setBookingModalOpen(false);
      setBookingSuccess(booking);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#ffffff", "#aaaaaa", "#444444"]
      });
      setTimeout(() => setBookingSuccess(null), 4000);
    } catch (err) {
      setBookingError(err.message);
    }
  };

  const imagesMap = {
    boxing: "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
    strength: "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
    conditioning: "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg",
    recovery: "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg"
  };

  return (
    <div className="pt-28 pb-32 bg-[#0D0D0D] min-h-screen px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Top Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-[#8C8C8C] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            Curriculum & Schedules
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-extrabold text-white tracking-tight uppercase leading-none">
            DISCIPLINES &<br />
            <span className="text-[#8C8C8C]">WEEKLY COMBINE.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#8C8C8C] leading-relaxed">
            Every session is capped to ensure strict coach-to-athlete ratios. Choose your discipline below to review technical curriculum and reserve a spot on the floor.
          </p>

          {/* Pending Approval Notice */}
          {isPending && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-400 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Account Status: <strong>Pending HQ Approval</strong>. Class bookings are locked until verified.</span>
              </div>
              <Link
                to="/dashboard?tab=chat"
                className="px-3.5 py-1.5 bg-amber-400 text-black font-bold font-mono text-[11px] uppercase tracking-wider rounded shrink-0 text-center hover:bg-amber-300"
              >
                Chat with Admin
              </Link>
            </div>
          )}

          {bookingError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-sm text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? "bg-white text-black"
                  : "bg-[#161616] text-[#8C8C8C] hover:text-white hover:bg-[#202020]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Booking Notification Banner & Markup */}
        {bookingSuccess && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs uppercase tracking-widest text-white shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-sm block normal-case text-white">
                  Spot Reserved: <strong>{bookingSuccess.classTitle}</strong>
                </span>
                <span className="font-mono text-[11px] text-emerald-400">
                  {bookingSuccess.date} · Coach {bookingSuccess.trainer} · Room: {bookingSuccess.room || "Main Arena Floor"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-400 text-black">
                CONFIRMED & SYNCED
              </span>
              <Link
                to="/dashboard?tab=schedule"
                className="px-3 py-1.5 bg-white text-black font-bold font-mono text-[10px] uppercase rounded hover:bg-[#F5F5F3] transition-colors"
              >
                View in Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="bg-[#141414] border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between group hover:border-white/30 transition-all"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black">
                <img
                  src={imagesMap[prog.id] || "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg"}
                  alt={prog.title}
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/20" />
                
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-wider text-white border border-white/10">
                  {prog.tag}
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded text-xs text-white">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {prog.duration}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {prog.intensity}</span>
                </div>
              </div>

              <div className="p-8 space-y-4">
                <h3 className="font-display text-3xl font-bold text-white uppercase tracking-tight">
                  {prog.title}
                </h3>
                <p className="text-xs text-[#8C8C8C] leading-relaxed">
                  {prog.details}
                </p>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#8C8C8C]">
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-white" />
                    Led by: <strong className="text-white">{prog.trainer}</strong>
                  </span>
                  <span>Max Capacity: {prog.capacity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Weekly Booking Schedule Table */}
        <div className="pt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">Instant Roster</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white uppercase">
                Upcoming Live Sessions
              </h2>
            </div>
            <p className="text-xs text-[#8C8C8C]">Click 'Reserve Spot' to instantly add to your member booking profile.</p>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-sm divide-y divide-white/10 overflow-x-auto">
            {schedule.map((sc) => {
              const isAlreadyBooked = (bookings || []).some((b) => {
                if (b.classTitle?.toLowerCase() !== sc.classTitle?.toLowerCase()) return false;
                
                // Fallback for older formats ("Monday, 09:00 AM")
                if (sc.day && b.date?.toLowerCase().includes(sc.day.toLowerCase())) return true;
                
                // Also check if time is explicitly in the date (since date picker formattedDate includes time)
                if (sc.time && b.date?.toLowerCase().includes(sc.time.toLowerCase())) return true;
                
                // For new formats ("2023-11-20 09:00")
                const parsedDate = new Date(b.date);
                if (!isNaN(parsedDate) && sc.day) {
                  const weekday = parsedDate.toLocaleDateString('en-US', { weekday: 'long' });
                  return weekday.toLowerCase() === sc.day.toLowerCase();
                }
                
                return false;
              });

              return (
                <div
                  key={sc.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isAlreadyBooked ? "bg-emerald-500/[0.04] border-l-2 border-l-emerald-400" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-28 shrink-0">
                      <span className="font-display font-bold text-sm text-white block uppercase">{sc.day}</span>
                      <span className="text-xs font-mono text-[#8C8C8C]">{sc.time}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-lg font-bold text-white uppercase">{sc.classTitle}</h4>
                        {isAlreadyBooked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Booked
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#8C8C8C]">Coach: {sc.trainer}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-xs font-mono block">
                        {sc.spotsLeft > 0 ? (
                          <span className="text-emerald-400 font-semibold">{sc.spotsLeft} spots available</span>
                        ) : (
                          <span className="text-rose-400 font-semibold">Sold Out</span>
                        )}
                      </span>
                      <span className="text-[11px] text-[#8C8C8C]">{sc.total} athlete max</span>
                    </div>

                    {isAlreadyBooked ? (
                      <span className="px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => openBookingModal(sc)}
                        disabled={sc.spotsLeft <= 0}
                        className={`px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold transition-all ${
                          sc.spotsLeft > 0
                            ? "bg-white text-black hover:bg-[#F5F5F3] hover:scale-105"
                            : "bg-white/10 text-white/30 cursor-not-allowed"
                        }`}
                      >
                        {sc.spotsLeft > 0 ? "Reserve Spot" : "Waitlist"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Booking Date/Time Selection Modal */}
      {bookingModalOpen && selectedClassToBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-white/10 rounded-sm w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h3 className="font-display text-2xl font-bold text-white uppercase mb-2">Request Session</h3>
              <p className="text-xs text-[#8C8C8C]">
                Select the exact date and time you wish to attend <strong className="text-white">{selectedClassToBook.classTitle}</strong> with coach <strong className="text-white">{selectedClassToBook.trainer}</strong>. Your request will be sent to HQ for approval.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
            <div className="p-6 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setBookingModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="px-5 py-2 text-xs font-bold text-black bg-white hover:bg-[#F5F5F3] rounded-sm uppercase tracking-wider transition-colors"
              >
                Request Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
