import React, { useState } from "react";
import { Lawyer, ConsultationMode } from "../types";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  Award,
  Video,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface LawyerProfileModalProps {
  lawyer: Lawyer | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
  openAuthModal: () => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const LawyerProfileModal: React.FC<LawyerProfileModalProps> = ({
  lawyer,
  isOpen,
  onClose,
  onBookingSuccess,
  openAuthModal,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Booking Form State
  const [activeTab, setActiveTab] = useState<"about" | "book" | "reviews">("book");
  const [selectedMode, setSelectedMode] = useState<ConsultationMode>("VIDEO");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>("11:00");
  const [duration] = useState<number>(30);
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen || !lawyer) return null;

  // Find lawyer availability for selected date's day of week
  const dateObj = new Date(selectedDate);
  const dayOfWeek = isNaN(dateObj.getTime()) ? 1 : dateObj.getDay();
  const dayAvailability = lawyer.availability?.filter(
    (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive
  );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (user?.role === "LAWYER" && user.lawyer?.id === lawyer.id) {
      setError("You cannot book an appointment with yourself.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

      await api.createAppointment({
        lawyerId: lawyer.id,
        scheduledAt: scheduledDateTime.toISOString(),
        duration,
        mode: selectedMode,
        notes: notes.trim() || undefined,
      });

      setSuccess("Consultation booked successfully! The lawyer has been notified to confirm.");
      setTimeout(() => {
        onBookingSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Failed to schedule appointment. Please select another slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header Background */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
              {lawyer.fullName
                .replace("Adv.", "")
                .trim()
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">{lawyer.fullName}</h2>
                {lawyer.verificationStatus === "APPROVED" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Bar Verified
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-400" />
                {lawyer.location} • <span>{lawyer.barCouncil}</span>
              </p>

              <div className="flex items-center gap-4 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gold-400" />
                  <span>{lawyer.yearsOfExperience} Years Experience</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                  <span className="font-bold text-white">
                    {lawyer.averageRating > 0 ? lawyer.averageRating.toFixed(1) : "New"}
                  </span>
                  <span>({lawyer.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("book")}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "book"
                  ? "border-gold-400 text-gold-300"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Book Consultation
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "about"
                  ? "border-gold-400 text-gold-300"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              Credentials & Schedule
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "border-gold-400 text-gold-300"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Star className="w-4 h-4" />
              Client Reviews ({lawyer.totalReviews})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: BOOKING FORM */}
          {activeTab === "book" && (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Consultation Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Consultation Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMode("VIDEO")}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMode === "VIDEO"
                        ? "border-navy-900 bg-navy-50/70 text-navy-950 font-semibold shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Video className={`w-5 h-5 ${selectedMode === "VIDEO" ? "text-navy-900" : "text-slate-400"}`} />
                    <span className="text-xs">Video Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode("AUDIO")}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMode === "AUDIO"
                        ? "border-navy-900 bg-navy-50/70 text-navy-950 font-semibold shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Phone className={`w-5 h-5 ${selectedMode === "AUDIO" ? "text-navy-900" : "text-slate-400"}`} />
                    <span className="text-xs">Audio Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode("CHAT")}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMode === "CHAT"
                        ? "border-navy-900 bg-navy-50/70 text-navy-950 font-semibold shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MessageSquare className={`w-5 h-5 ${selectedMode === "CHAT" ? "text-navy-900" : "text-slate-400"}`} />
                    <span className="text-xs">Live Chat</span>
                  </button>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Select Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
                  />
                  <div className="mt-1.5 text-[11px] text-slate-500">
                    Day: <span className="font-semibold text-slate-700">{DAYS_OF_WEEK[dayOfWeek]}</span>
                    {dayAvailability && dayAvailability.length > 0 ? (
                      <span className="text-emerald-600 ml-1.5 font-medium">
                        (Lawyer available: {dayAvailability.map((s) => `${s.startTime}-${s.endTime}`).join(", ")})
                      </span>
                    ) : (
                      <span className="text-amber-600 ml-1.5 font-medium">
                        (No recurring slot set for this day)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    3. Select Time Slot
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800 bg-white"
                  >
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration: 30 minutes consultation session
                  </p>
                </div>
              </div>

              {/* Case Summary / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Consultation Purpose / Legal Issue Summary
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your legal matter, any court notices received, questions, or key facts..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
                ></textarea>
              </div>

              {/* Price summary & CTA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500">Total Consultation Fee</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-navy-950">₹{lawyer.consultationFee}</span>
                    <span className="text-xs text-slate-500">(Inclusive of all charges)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Booking Slot..."
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 text-gold-400" />
                      Confirm & Schedule Appointment
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ABOUT & CREDENTIALS */}
          {activeTab === "about" && (
            <div className="space-y-6 text-slate-700 text-xs sm:text-sm">
              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">Advocate Bio</h4>
                <p className="leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {lawyer.bio || "No detailed biography provided."}
                </p>
              </div>

              {/* Bar Credentials */}
              <div>
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                  Bar Council Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Bar Registration Number</span>
                    <span className="font-semibold text-navy-950 text-sm">{lawyer.barRegistrationNumber}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Enrolled State Bar Council</span>
                    <span className="font-semibold text-navy-950 text-sm">{lawyer.barCouncil}</span>
                  </div>
                </div>
              </div>

              {/* Legal Domains */}
              <div>
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                  Practice Areas & Specializations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {lawyer.legalDomains?.map((domain) => (
                    <div key={domain.id} className="p-3 rounded-xl border border-navy-100 bg-navy-50/50">
                      <p className="font-semibold text-navy-900 text-xs">{domain.name}</p>
                      {domain.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{domain.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Availability Schedule */}
              <div>
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                  Weekly Consultation Timetable
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {DAYS_OF_WEEK.map((dayName, idx) => {
                    const slots = lawyer.availability?.filter((s) => s.dayOfWeek === idx && s.isActive);
                    return (
                      <div
                        key={dayName}
                        className={`p-2.5 rounded-xl border text-center ${
                          slots && slots.length > 0
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <p className="text-xs font-bold uppercase">{dayName}</p>
                        {slots && slots.length > 0 ? (
                          <div className="mt-1 space-y-0.5">
                            {slots.map((s) => (
                              <p key={s.id} className="text-[10px] font-medium text-emerald-800">
                                {s.startTime}-{s.endTime}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] mt-1 text-slate-400">Off</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {lawyer.reviews && lawyer.reviews.length > 0 ? (
                lawyer.reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-navy-800 text-white text-xs font-bold flex items-center justify-center">
                          {review.client?.fullName?.charAt(0) || "C"}
                        </div>
                        <span className="font-semibold text-xs sm:text-sm text-slate-800">
                          {review.client?.fullName || "Verified Client"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed pl-9">
                        "{review.comment}"
                      </p>
                    )}
                    <div className="text-[10px] text-slate-400 pl-9">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">No reviews yet for this advocate.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
