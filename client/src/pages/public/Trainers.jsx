import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Award, Quote, CheckCircle2, X, Send, Bot, MessageSquare, ArrowRight, Phone, MapPin, User, FileText, UserPlus } from "lucide-react";
import { useGym } from "../../context/GymContext";
import confetti from "canvas-confetti";

export default function Trainers() {
  const { trainers, addConsultationRequest, currentUser } = useGym();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [showConsultantForm, setShowConsultantForm] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // Lock background body scroll when either modal is open
  useEffect(() => {
    if (showConsultantForm || activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showConsultantForm, activeModal]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowConsultantForm(false);
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || "",
    phone: "",
    address: "",
    serviceType: "1-on-1 Boxing & Striking Biomechanics",
    customRequirements: ""
  });

  // Interactive AI/Concierge Chatbot within the form
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Welcome to Brave Concierge. I am your athletic intake bot. Which specific training target, injury history, or schedule do you require?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const openConsultationForm = (trainer) => {
    if (!currentUser) {
      setActiveModal(null);
      navigate(`/register?redirect=/trainers&notice=consultation_required&trainerName=${encodeURIComponent(trainer.name)}`);
      return;
    }

    setSelectedTrainer(trainer);
    setActiveModal(null);
    setShowConsultantForm(true);
    setSubmittedSuccess(false);
    setChatMessages([
      {
        sender: "bot",
        text: `Salutations. You are requesting private training with ${trainer.name} (${trainer.role}). What are your primary physical goals or schedule constraints?`
      }
    ]);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const newMessages = [...chatMessages, { sender: "user", text: userText }];
    setChatMessages(newMessages);
    setChatInput("");

    // Automated intelligent bot reply
    setTimeout(() => {
      let botResponse = "Acknowledged. I have logged these specifications directly onto your dispatch dossier for the Head Coach and Admin.";
      if (userText.toLowerCase().includes("sparring") || userText.toLowerCase().includes("boxing")) {
        botResponse = "Noted. Coach Marcus Vance specializes in tactical ring presence and sparring conditioning. We will allocate hand wraps and dedicated corner time.";
      } else if (userText.toLowerCase().includes("weight") || userText.toLowerCase().includes("strength")) {
        botResponse = "Understood. Our Barbell Arena features Eleiko competition bumper sets and custom velocity-based training tracking.";
      } else if (userText.toLowerCase().includes("time") || userText.toLowerCase().includes("morning") || userText.toLowerCase().includes("evening")) {
        botResponse = "Got it. Your preferred time window has been synchronized with facility floor occupancy.";
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 600);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/register?redirect=/trainers&notice=consultation_required");
      return;
    }

    if (!formData.fullName || !formData.phone) {
      alert("Please provide your complete name and contact phone number.");
      return;
    }

    addConsultationRequest({
      trainerId: selectedTrainer?.id,
      trainerName: selectedTrainer?.name,
      userName: formData.fullName,
      phone: formData.phone,
      address: formData.address || "Local District Resident",
      serviceType: formData.serviceType,
      customRequirements: formData.customRequirements || "General athletic conditioning",
      chatMessages: chatMessages
    });

    setSubmittedSuccess(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="pt-28 pb-32 bg-[#0D0D0D] min-h-screen px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-[#8C8C8C] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            The Coaching Lineage
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-extrabold text-white tracking-tight uppercase leading-none">
            DISCIPLINE MEETS<br />
            <span className="text-[#8C8C8C]">PEDIGREE.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#8C8C8C] leading-relaxed">
            Our coaching faculty consists of professional prize-fighters, Division-1 strength directors, and kinetic biomechanists who live the training lifestyle.
          </p>

          {!currentUser && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-white/80">
                <UserPlus className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Private consultations & coach assignments require an active athlete registration.</span>
              </div>
              <Link
                to="/register?redirect=/trainers"
                className="px-3.5 py-1.5 bg-white text-black font-bold font-mono text-[11px] uppercase tracking-wider rounded shrink-0 text-center hover:bg-[#F5F5F3] transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trainers.map((coach) => (
            <div
              key={coach.id}
              className="bg-[#141414] border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between group hover:border-white/40 transition-all cursor-pointer shadow-lg"
              onClick={() => setActiveModal(coach)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-black">
                <img
                  src={coach.image}
                  alt={coach.name}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
                
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8C8C] block mb-1">
                    {coach.role}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight">
                    {coach.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4 flex flex-col justify-between flex-1">
                <p className="text-xs text-[#8C8C8C] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-white/50" />
                  {coach.creds}
                </p>

                <div className="flex flex-wrap gap-1">
                  {coach.specialties.map((sp, i) => (
                    <span key={i} className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                      {sp}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white uppercase tracking-wider font-semibold group-hover:underline">
                  <span>View Full Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal 1: Bio Dossier */}
        {activeModal && (
          <div
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#161616] border border-white/20 max-w-2xl w-full rounded-sm overflow-hidden p-8 relative space-y-6 shadow-2xl"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <img
                  src={activeModal.image}
                  alt={activeModal.name}
                  className="w-32 h-40 object-cover grayscale rounded border border-white/20 shrink-0"
                />
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">
                    Coach Profile
                  </span>
                  <h3 className="font-display text-3xl font-bold text-white uppercase">
                    {activeModal.name}
                  </h3>
                  <p className="text-xs text-white/90 font-medium">{activeModal.role}</p>
                  <p className="text-xs text-[#8C8C8C]">{activeModal.creds}</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded text-xs italic text-[#8C8C8C] flex gap-3">
                <Quote className="w-5 h-5 text-white/40 shrink-0" />
                <span>"{activeModal.quote}"</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-white font-semibold">Specialized Methodologies</span>
                <div className="flex flex-wrap gap-2">
                  {activeModal.specialties.map((s, i) => (
                    <span key={i} className="text-xs uppercase px-3 py-1 bg-white/10 text-white rounded border border-white/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#8C8C8C]">Direct coach assignment & consultation dispatch</span>
                <button
                  type="button"
                  onClick={() => openConsultationForm(activeModal)}
                  className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#F5F5F3] transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Request Consultation & Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Complete Consultation Request Form + Interactive AI Chatbot */}
        {showConsultantForm && (
          <div
            onClick={() => setShowConsultantForm(false)}
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-hidden animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/20 max-w-3xl w-full max-h-[92vh] overflow-y-auto rounded-sm p-5 sm:p-8 space-y-6 shadow-2xl relative overscroll-contain"
            >
              <button
                onClick={() => setShowConsultantForm(false)}
                className="sticky sm:absolute top-2 right-2 sm:top-6 sm:right-6 float-right sm:float-none p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-30"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Form Header */}
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C8C8C] mb-1">
                  <span>Intake Dispatch</span>
                  <span>•</span>
                  <span className="text-amber-300">Coach: {selectedTrainer?.name}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                  Consultation & Requirements Dossier
                </h2>
                <p className="text-xs text-[#8C8C8C]">
                  Complete this dossier. Your request will be directly transmitted to the Admin Console for review and athlete callback.
                </p>
              </div>

              {submittedSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white uppercase">
                    Dispatch Transmitted to Admin
                  </h3>
                  <p className="text-xs text-[#8C8C8C] max-w-md mx-auto leading-relaxed">
                    Your consultation request for <strong>{selectedTrainer?.name}</strong> has been received by Brave HQ Admin. Our Director will review your requirements and contact you at <strong>{formData.phone}</strong>.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setShowConsultantForm(false)}
                      className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#F5F5F3]"
                    >
                      Return to Faculty
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Form Details */}
                  <form onSubmit={handleFormSubmit} className="lg:col-span-7 space-y-4 text-xs">
                    
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label htmlFor="consultation-fullname" className="uppercase font-mono text-[#8C8C8C] flex items-center gap-1.5">
                        <User className="w-3 h-3 text-white/70" /> Complete Name *
                      </label>
                      <input
                        id="consultation-fullname"
                        name="fullName"
                        autoComplete="name"
                        type="text"
                        required
                        placeholder="e.g. Liam Vance"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label htmlFor="consultation-phone" className="uppercase font-mono text-[#8C8C8C] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-white/70" /> Contact Number *
                      </label>
                      <input
                        id="consultation-phone"
                        name="phone"
                        autoComplete="tel"
                        type="tel"
                        required
                        placeholder="e.g. +1 (555) 019-2834"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    {/* Address / Location */}
                    <div className="space-y-1">
                      <label htmlFor="consultation-address" className="uppercase font-mono text-[#8C8C8C] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-white/70" /> Address / District
                      </label>
                      <input
                        id="consultation-address"
                        name="address"
                        autoComplete="street-address"
                        type="text"
                        placeholder="e.g. 844 Athletic Blvd, District 4"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    {/* Service Selection */}
                    <div className="space-y-1">
                      <label htmlFor="consultation-discipline" className="uppercase font-mono text-[#8C8C8C]">Discipline Focus</label>
                      <select
                        id="consultation-discipline"
                        name="discipline"
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors"
                      >
                        <option>1-on-1 Boxing & Striking Biomechanics</option>
                        <option>Barbell Olympic Strength & Power Velocity</option>
                        <option>Metabolic Threshold & VO2 Conditioning</option>
                        <option>Fight Camp / Amateur Match Preparation</option>
                        <option>Joint Decompression & Injury Rehabilitation</option>
                      </select>
                    </div>

                    {/* Custom Requirements / Manual Notes */}
                    <div className="space-y-1">
                      <label htmlFor="consultation-notes" className="uppercase font-mono text-[#8C8C8C] flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-white/70" /> Specific Goals & Requirements
                      </label>
                      <textarea
                        id="consultation-notes"
                        name="notes"
                        rows="3"
                        placeholder="Detail any schedule constraints, injury history, or specific milestone goals..."
                        value={formData.customRequirements}
                        onChange={(e) => setFormData({ ...formData, customRequirements: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1F1F1F] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white transition-colors resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 mt-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#F5F5F3] transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Request to Admin
                    </button>
                  </form>

                  {/* Right Column: Interactive AI Concierge Chatbot */}
                  <div className="lg:col-span-5 bg-[#1A1A1A] border border-white/10 rounded p-4 flex flex-col justify-between h-[420px]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-display font-bold text-white text-xs uppercase tracking-wider">
                          Brave AI Intake
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    {/* Chat message bubbles */}
                    <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs pr-1">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`p-2.5 rounded-sm max-w-[85%] leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-white text-black font-medium"
                                : "bg-white/10 text-white/90 border border-white/10"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat input box */}
                    <form onSubmit={handleSendChat} className="pt-2 border-t border-white/10 flex gap-2">
                      <input
                        id="chat-user-input"
                        name="chatUserInput"
                        autoComplete="off"
                        type="text"
                        placeholder="Type answer or question..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#242424] border border-white/15 rounded text-white text-xs focus:outline-none focus:border-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded text-xs transition-colors"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
