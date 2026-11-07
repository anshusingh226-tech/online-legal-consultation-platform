import React, { useState, useEffect } from "react";
import { Appointment, Lawyer, LawyerAvailability, DocumentItem } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Video,
  FileText,
  Plus,
  Trash2,
  Upload,
  ShieldCheck,
  AlertCircle,
  Star,
  User,
  Save,
} from "lucide-react";

interface LawyerDashboardPageProps {
  onJoinRoom: (appointment: Appointment) => void;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const LawyerDashboardPage: React.FC<LawyerDashboardPageProps> = ({ onJoinRoom }) => {
  const { user, token, loginAsDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<"requests" | "availability" | "earnings" | "profile">("requests");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [lawyerProfile, setLawyerProfile] = useState<Lawyer | null>(null);
  const [availability, setAvailability] = useState<LawyerAvailability[]>([]);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New slot form state
  const [newSlotDay, setNewSlotDay] = useState<number>(1);
  const [newSlotStart, setNewSlotStart] = useState("10:00");
  const [newSlotEnd, setNewSlotEnd] = useState("13:00");
  const [slotError, setSlotError] = useState<string | null>(null);

  // Profile Edit State
  const [editFee, setEditFee] = useState<number>(1500);
  const [editBio, setEditBio] = useState<string>("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [user?.role, token]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [apptRes, profileRes, availRes, earningsRes] = await Promise.allSettled([
        api.getMyAppointments(),
        api.getMyLawyerProfile(),
        api.getMyAvailability(),
        api.getLawyerEarnings(),
      ]);

      if (apptRes.status === "fulfilled" && apptRes.value?.data) setAppointments(apptRes.value.data);
      if (profileRes.status === "fulfilled" && profileRes.value?.data) {
        setLawyerProfile(profileRes.value.data);
        setEditFee(profileRes.value.data.consultationFee);
        setEditBio(profileRes.value.data.bio || "");
      }
      if (availRes.status === "fulfilled" && availRes.value?.data) setAvailability(availRes.value.data);
      if (earningsRes.status === "fulfilled" && earningsRes.value?.data) setEarningsData(earningsRes.value.data);
    } catch (err) {
      console.error("Failed to load lawyer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "ACCEPTED" | "REJECTED") => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      const apptRes = await api.getMyAppointments();
      if (apptRes.data) setAppointments(apptRes.data);
    } catch (err: any) {
      alert(err.message || "Failed to update appointment");
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError(null);
    if (newSlotStart >= newSlotEnd) {
      setSlotError("Start time must be strictly earlier than end time.");
      return;
    }

    try {
      await api.createAvailability({
        dayOfWeek: Number(newSlotDay),
        startTime: newSlotStart,
        endTime: newSlotEnd,
      });
      const availRes = await api.getMyAvailability();
      if (availRes.data) setAvailability(availRes.data);
    } catch (err: any) {
      setSlotError(err.message || "Failed to create availability slot");
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (window.confirm("Remove this recurring availability slot?")) {
      try {
        await api.deleteAvailability(slotId);
        setAvailability((prev) => prev.filter((s) => s.id !== slotId));
      } catch (err: any) {
        alert(err.message || "Failed to delete slot");
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateLawyerProfile({
        consultationFee: editFee,
        bio: editBio,
      });
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "LAWYER_VERIFICATION");

      await api.uploadDocument(formData);
      const profileRes = await api.getMyLawyerProfile();
      if (profileRes.data) setLawyerProfile(profileRes.data);
      alert("Certificate uploaded for admin verification!");
    } catch (err: any) {
      alert(err.message || "Failed to upload certificate");
    } finally {
      setUploadingDoc(false);
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === "PENDING");
  const acceptedAppointments = appointments.filter((a) => a.status === "ACCEPTED");
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-navy-800">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gold-500 text-navy-950 font-serif text-2xl font-bold flex items-center justify-center shrink-0 shadow-md">
            ⚖️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {user?.fullName}
              </h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  lawyerProfile?.verificationStatus === "APPROVED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {lawyerProfile?.verificationStatus === "APPROVED"
                  ? "✓ Verified Practitioner"
                  : `Status: ${lawyerProfile?.verificationStatus || "PENDING"}`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Bar Reg: <span className="text-white font-mono">{lawyerProfile?.barRegistrationNumber || "N/A"}</span> • {lawyerProfile?.barCouncil}
            </p>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 text-center">
            <span className="text-lg sm:text-xl font-bold text-white block">
              {pendingAppointments.length}
            </span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider">Pending Requests</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 text-center">
            <span className="text-lg sm:text-xl font-bold text-emerald-400 block">
              ₹{earningsData?.totalEarned || 0}
            </span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider">Total Earned</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 text-center col-span-2 sm:col-span-1">
            <span className="text-lg sm:text-xl font-bold text-amber-400 block flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" />
              {lawyerProfile?.averageRating || 5.0}
            </span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider">
              Rating ({lawyerProfile?.totalReviews || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("requests")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "requests"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4 text-navy-800" />
          <span>Consultation Requests & Sessions</span>
          {pendingAppointments.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingAppointments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("availability")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "availability"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Weekly Availability ({availability.length} slots)</span>
        </button>

        <button
          onClick={() => setActiveTab("earnings")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "earnings"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DollarSign className="w-4 h-4 text-gold-600" />
          <span>Earnings & Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "profile"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Profile & Bar Credentials</span>
        </button>
      </div>

      {/* TAB 1: REQUESTS & SESSIONS */}
      {activeTab === "requests" && (
        <div className="space-y-8">
          {/* Pending Consultation Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                <span>Incoming Consultation Requests</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {pendingAppointments.length} Action Needed
                </span>
              </h3>
            </div>

            {pendingAppointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No new consultation requests pending your approval.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAppointments.map((appt) => {
                  const date = new Date(appt.scheduledAt);
                  return (
                    <div
                      key={appt.id}
                      className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md uppercase">
                            Pending Request
                          </span>
                          <span className="text-xs text-slate-500">• {appt.mode} Consultation</span>
                          <span className="text-xs text-slate-500">• {appt.duration} mins</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                          Client: {appt.client?.fullName} ({appt.client?.email})
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {appt.notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                            <span className="font-semibold text-slate-700">Client Note:</span> {appt.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleStatusChange(appt.id, "ACCEPTED")}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept & Confirm</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(appt.id, "REJECTED")}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirmed Sessions Ready to Conduct */}
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 mb-4">
              Confirmed Scheduled Sessions ({acceptedAppointments.length})
            </h3>
            {acceptedAppointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No upcoming confirmed sessions right now.
              </div>
            ) : (
              <div className="space-y-3">
                {acceptedAppointments.map((appt) => {
                  const date = new Date(appt.scheduledAt);
                  return (
                    <div
                      key={appt.id}
                      className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-md uppercase">
                            Confirmed
                          </span>
                          <span className="text-xs text-slate-500">{appt.mode} • {appt.duration} mins</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                          {appt.client?.fullName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })} at{" "}
                          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      <button
                        onClick={() => onJoinRoom(appt)}
                        className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <Video className="w-4 h-4 text-gold-400" />
                        <span>Conduct Consultation</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed History */}
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 mb-4">
              Completed Consultations & Case History ({completedAppointments.length})
            </h3>
            <div className="space-y-3">
              {completedAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Completed
                    </span>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {appt.client?.fullName} ({appt.mode})
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      {new Date(appt.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {appt.consultation?.summary && (
                      <p className="text-slate-700 bg-slate-50 p-2 rounded-lg mt-1 italic">
                        "{appt.consultation.summary}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-navy-900 text-sm">
                      +₹{lawyerProfile?.consultationFee || 1500}
                    </span>
                    <button
                      onClick={() => onJoinRoom(appt)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      View Room & Summary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY AVAILABILITY MANAGER */}
      {activeTab === "availability" && (
        <div className="space-y-8">
          {/* Add Slot Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 mb-1">
              Configure Recurring Weekly Availability
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Set the days and time windows when clients can automatically book 30-minute consultations with you
            </p>

            {slotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{slotError}</span>
              </div>
            )}

            <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                <select
                  value={newSlotDay}
                  onChange={(e) => setNewSlotDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-navy-800"
                >
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <option key={day} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time (HH:MM)</label>
                <input
                  type="time"
                  required
                  value={newSlotStart}
                  onChange={(e) => setNewSlotStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Time (HH:MM)</label>
                <input
                  type="time"
                  required
                  value={newSlotEnd}
                  onChange={(e) => setNewSlotEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-gold-400" />
                <span>Add Time Slot</span>
              </button>
            </form>
          </div>

          {/* Active Availability Slots */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Active Recurring Schedule
            </h4>

            {availability.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No active availability slots configured. Clients will not be able to book you until slots are added.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        {DAYS_OF_WEEK[slot.dayOfWeek]}
                      </span>
                      <span className="text-xs text-emerald-700 font-medium">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EARNINGS DASHBOARD */}
      {activeTab === "earnings" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Gross Fee Earnings</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 mt-2 block">
                ₹{earningsData?.totalEarned || 0}
              </span>
              <span className="text-xs text-emerald-600 font-medium mt-1 block">
                From {earningsData?.completedCount || 0} completed consultations
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Pending / Upcoming Payouts</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 mt-2 block">
                ₹{earningsData?.pendingEarnings || 0}
              </span>
              <span className="text-xs text-blue-600 font-medium mt-1 block">
                From {earningsData?.acceptedCount || 0} confirmed sessions
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Your Base Consultation Fee</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 mt-2 block">
                ₹{earningsData?.consultationFee || lawyerProfile?.consultationFee || 1500}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">Per 30 min session</span>
            </div>
          </div>

          {/* Monthly Trend Cards */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Monthly Earnings Velocity
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {earningsData?.monthlyTrend?.map((item: any) => (
                <div key={item.month} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[11px] text-slate-500 block truncate">{item.month}</span>
                  <span className="text-base font-bold text-navy-950 mt-1 block">₹{item.amount}</span>
                  <span className="text-[10px] text-slate-400">{item.consultations} consults</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Consultation Payout Log */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Consultation Earnings Ledger
            </h4>
            {earningsData?.recentEarnings?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No completed consultation payouts logged yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {earningsData?.recentEarnings?.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">{item.clientName}</span>
                      <span className="text-slate-400 ml-2">({item.mode} • {item.duration} mins)</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">+₹{item.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE & CREDENTIALS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Practice Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
              Update Practice Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Fee (₹ per 30 mins)
                </label>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={editFee}
                  onChange={(e) => setEditFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Bio & Court Appearances
                </label>
                <textarea
                  rows={5}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-gold-400" />
                <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
              </button>
            </form>
          </div>

          {/* Verification Documents Upload */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
              Bar Council Verification Documents
            </h3>
            <p className="text-xs text-slate-500">
              Upload your State Bar Council Certificate or Bar Council Identity Card for platform verification audit.
            </p>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Select Bar Council Certificate (PDF, PNG, JPG)</p>
              <label className="inline-block px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs cursor-pointer transition-colors shadow-xs">
                <span>{uploadingDoc ? "Uploading..." : "Browse Certificate"}</span>
                <input
                  type="file"
                  onChange={handleUploadCertificate}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </label>
            </div>

            {/* List of uploaded documents */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-700 block">Uploaded Certificates:</span>
              {lawyerProfile?.verificationDocuments?.length === 0 ? (
                <p className="text-xs text-slate-400">No verification documents uploaded yet.</p>
              ) : (
                lawyerProfile?.verificationDocuments?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{doc.fileName}</span>
                    </div>
                    <a
                      href={api.getDocumentDownloadUrl(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-navy-800 hover:underline shrink-0"
                    >
                      View
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
