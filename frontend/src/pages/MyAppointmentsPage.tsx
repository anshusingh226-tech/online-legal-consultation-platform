import React, { useState, useEffect } from "react";
import { Appointment } from "../types";
import { api } from "../services/api";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Star,
  FileText,
  AlertCircle,
  XCircle,
  ExternalLink,
  Plus,
} from "lucide-react";

interface MyAppointmentsPageProps {
  onJoinRoom: (appointment: Appointment) => void;
  onOpenReview: (appointment: Appointment) => void;
  onOpenBookLawyer: () => void;
}

export const MyAppointmentsPage: React.FC<MyAppointmentsPageProps> = ({
  onJoinRoom,
  onOpenReview,
  onOpenBookLawyer,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.getMyAppointments();
      if (res.data) setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this consultation request?")) {
      setActionLoading(id);
      try {
        await api.updateAppointmentStatus(id, "CANCELLED");
        await fetchAppointments();
      } catch (err: any) {
        alert(err.message || "Failed to cancel appointment");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "UPCOMING") return appt.status === "ACCEPTED" || appt.status === "PENDING";
    if (statusFilter === "COMPLETED") return appt.status === "COMPLETED";
    if (statusFilter === "CANCELLED") return appt.status === "CANCELLED" || appt.status === "REJECTED";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            My Legal Consultations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track scheduled sessions, enter live consultation rooms, review legal opinions, and manage case documents
          </p>
        </div>

        <button
          onClick={onOpenBookLawyer}
          className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "ALL", label: "All Appointments", count: appointments.length },
          { key: "UPCOMING", label: "Upcoming / Active", count: appointments.filter((a) => a.status === "ACCEPTED" || a.status === "PENDING").length },
          { key: "COMPLETED", label: "Completed", count: appointments.filter((a) => a.status === "COMPLETED").length },
          { key: "CANCELLED", label: "Cancelled / Rejected", count: appointments.filter((a) => a.status === "CANCELLED" || a.status === "REJECTED").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === tab.key
                ? "bg-navy-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.key ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
              <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Consultations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            You do not have any legal consultations under this status filter.
          </p>
          <button
            onClick={onOpenBookLawyer}
            className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition-colors"
          >
            Explore Verified Lawyers
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const date = new Date(appt.scheduledAt);
            const isCompleted = appt.status === "COMPLETED";
            const isAccepted = appt.status === "ACCEPTED";
            const isPending = appt.status === "PENDING";
            const isCancelled = appt.status === "CANCELLED" || appt.status === "REJECTED";

            return (
              <div
                key={appt.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left Col: Lawyer & Schedule details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isAccepted
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : isPending
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {appt.status}
                    </span>

                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      {appt.mode === "VIDEO" && <Video className="w-3.5 h-3.5 text-navy-800" />}
                      {appt.mode === "AUDIO" && <Phone className="w-3.5 h-3.5 text-navy-800" />}
                      {appt.mode === "CHAT" && <MessageSquare className="w-3.5 h-3.5 text-navy-800" />}
                      <span>{appt.mode} Consultation</span>
                    </span>

                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{appt.duration} minutes</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                    Advocate {appt.lawyer?.user.fullName}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {date.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {appt.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-2xl">
                      <span className="font-semibold text-slate-700">Matter Notes:</span> {appt.notes}
                    </p>
                  )}

                  {/* Consultation Summary snippet if completed */}
                  {appt.consultation?.summary && (
                    <div className="text-xs text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 max-w-2xl">
                      <span className="font-semibold text-emerald-950 block mb-0.5">Legal Advice Summary:</span>
                      <p className="text-[11px] leading-relaxed text-emerald-800 line-clamp-2">
                        {appt.consultation.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Col: Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
                  {/* Enter Consultation Room */}
                  {(isAccepted || isCompleted) && (
                    <button
                      onClick={() => onJoinRoom(appt)}
                      className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                        isAccepted
                          ? "bg-navy-900 hover:bg-navy-800 text-white animate-pulse"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <Video className="w-4 h-4 text-gold-400" />
                      <span>{isAccepted ? "Join Consultation Room" : "View Room / Notes"}</span>
                    </button>
                  )}

                  {/* Leave Review (if completed and not reviewed yet) */}
                  {isCompleted && !appt.review && (
                    <button
                      onClick={() => onOpenReview(appt)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate Advocate</span>
                    </button>
                  )}

                  {isCompleted && appt.review && (
                    <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>Reviewed ({appt.review.rating}/5)</span>
                    </div>
                  )}

                  {/* Cancel (if pending or accepted) */}
                  {(isPending || isAccepted) && (
                    <button
                      onClick={() => handleCancelAppointment(appt.id)}
                      disabled={actionLoading === appt.id}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
