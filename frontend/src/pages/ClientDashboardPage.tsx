import React, { useState, useEffect } from "react";
import { Appointment, DocumentItem, Lawyer } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  FileText,
  Upload,
  Download,
  Star,
  CheckCircle2,
  AlertCircle,
  Plus,
  Shield,
  UserCheck,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  XCircle,
} from "lucide-react";

interface ClientDashboardPageProps {
  onJoinRoom: (appointment: Appointment) => void;
  onOpenReview: (appointment: Appointment) => void;
  onOpenBookLawyer: () => void;
  onSelectLawyer?: (lawyer: Lawyer) => void;
}

export const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({
  onJoinRoom,
  onOpenReview,
  onOpenBookLawyer,
  onSelectLawyer,
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "documents" | "summaries">("overview");
  const [appointmentFilter, setAppointmentFilter] = useState<string>("ALL");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [apptsRes, docsRes] = await Promise.all([
        api.getMyAppointments(),
        api.getMyDocuments().catch(() => ({ data: [] })),
      ]);
      if (apptsRes.data) setAppointments(apptsRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    } catch (err) {
      console.error("Failed to load client dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "CONSULTATION");

      await api.uploadDocument(formData);
      await loadDashboardData();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this consultation request?")) {
      try {
        await api.updateAppointmentStatus(id, "CANCELLED");
        await loadDashboardData();
      } catch (err: any) {
        alert(err.message || "Failed to cancel appointment");
      }
    }
  };

  // Stats
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "ACCEPTED" || a.status === "PENDING"
  );
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED");
  const nextAppointment = upcomingAppointments.sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  )[0];

  // Distinct consulted lawyers
  const consultedLawyersMap = new Map<string, any>();
  appointments.forEach((a) => {
    if (a.lawyer && !consultedLawyersMap.has(a.lawyer.id)) {
      consultedLawyersMap.set(a.lawyer.id, a.lawyer);
    }
  });
  const consultedLawyers = Array.from(consultedLawyersMap.values());

  const filteredAppointments = appointments.filter((appt) => {
    if (appointmentFilter === "ALL") return true;
    if (appointmentFilter === "UPCOMING") return appt.status === "ACCEPTED" || appt.status === "PENDING";
    if (appointmentFilter === "COMPLETED") return appt.status === "COMPLETED";
    if (appointmentFilter === "CANCELLED") return appt.status === "CANCELLED" || appt.status === "REJECTED";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      {/* Client Welcome Hero Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-navy-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold border border-gold-500/30">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Personalized Client Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              Welcome back, {user?.fullName || "Client"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage your legal consultations, access post-session advocate summaries, review uploaded case notices, and connect with top verified advocates across 10 legal domains.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenBookLawyer}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-navy-950 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-navy-950" />
              <span>Book New Consultation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-navy-800" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-slate-900 block">
              {upcomingAppointments.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Upcoming Sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-slate-900 block">
              {completedAppointments.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Completed Consultations</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <FolderOpen className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-slate-900 block">
              {documents.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Case Documents</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-slate-900 block">
              {consultedLawyers.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Advocates Consulted</span>
          </div>
        </div>
      </div>

      {/* Spotlight: Next Scheduled Consultation */}
      {nextAppointment && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-navy-950 rounded-2xl p-6 text-white shadow-lg border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-gold-400 shrink-0 border border-white/10 text-xl font-serif font-bold">
              {nextAppointment.lawyer?.user?.fullName?.charAt(0) || "Adv"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-400 text-navy-950">
                  Next Scheduled Session
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-200">
                  {nextAppointment.mode} CONSULTATION
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {nextAppointment.lawyer?.user?.fullName || "Verified Advocate"}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" />
                  {new Date(nextAppointment.scheduledAt).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-400" />
                  {new Date(nextAppointment.scheduledAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({nextAppointment.duration} Mins)
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Status: {nextAppointment.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {nextAppointment.status === "ACCEPTED" ? (
              <button
                onClick={() => onJoinRoom(nextAppointment)}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4 text-white" />
                <span>Enter Live Consultation Room</span>
              </button>
            ) : (
              <span className="text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 px-4 py-2.5 rounded-xl font-medium">
                ⏳ Awaiting Advocate Confirmation
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto scrollbar-none px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-navy-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Consultations ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "documents"
                ? "bg-navy-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Case Documents ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("summaries")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "summaries"
                ? "bg-navy-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Legal Summaries & Advice</span>
          </button>
        </div>

        {/* Tab 1: Consultations */}
        {activeTab === "overview" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { key: "ALL", label: "All Sessions" },
                  { key: "UPCOMING", label: "Active / Upcoming" },
                  { key: "COMPLETED", label: "Completed" },
                  { key: "CANCELLED", label: "Cancelled" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setAppointmentFilter(f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      appointmentFilter === f.key
                        ? "bg-navy-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={onOpenBookLawyer}
                className="text-xs font-semibold text-navy-800 hover:text-gold-600 flex items-center gap-1"
              >
                <span>Find an Advocate</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading consultations...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Consultations Found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You do not have any consultations under this filter. Browse our pre-vetted advocates to schedule an online appointment.
                </p>
                <button
                  onClick={onOpenBookLawyer}
                  className="px-4 py-2 rounded-xl bg-navy-900 text-white font-semibold text-xs hover:bg-navy-800 transition-colors"
                >
                  Book Consultation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center font-serif font-bold text-base shrink-0">
                          {appt.lawyer?.user?.fullName?.charAt(0) || "A"}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {appt.lawyer?.user?.fullName || "Verified Advocate"}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {(appt.lawyer as any)?.barCouncil || "State Bar Council"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          appt.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : appt.status === "ACCEPTED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : appt.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(appt.scheduledAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(appt.scheduledAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ({appt.duration}m)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        {appt.mode === "VIDEO" && <Video className="w-3.5 h-3.5 text-indigo-600" />}
                        {appt.mode === "AUDIO" && <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                        {appt.mode === "CHAT" && <MessageSquare className="w-3.5 h-3.5 text-amber-600" />}
                        <span className="font-semibold text-slate-700">Mode: {appt.mode}</span>
                      </div>
                    </div>

                    {appt.notes && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50">
                        "{appt.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                      {appt.status === "ACCEPTED" && (
                        <button
                          onClick={() => onJoinRoom(appt)}
                          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5 text-gold-400" />
                          <span>Join Consultation Room</span>
                        </button>
                      )}

                      {appt.status === "COMPLETED" && (
                        <button
                          onClick={() => onOpenReview(appt)}
                          className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 text-navy-950 fill-navy-950" />
                          <span>Leave Review & Rating</span>
                        </button>
                      )}

                      {appt.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Request</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Case Documents */}
        {activeTab === "documents" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attached Legal Documents</h3>
                <p className="text-xs text-slate-500">
                  Upload legal notices, agreements, contracts, and evidentiary briefs securely.
                </p>
              </div>

              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-2">
                <Upload className="w-4 h-4 text-gold-400" />
                <span>{isUploading ? "Uploading..." : "Upload Case Document"}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
              </label>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {documents.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Documents Uploaded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload PDF, Word, or Image files up to 10MB to share with advocates during consultations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-navy-300 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-navy-800" />
                      </div>
                      <div className="space-y-0.5 max-w-[180px]">
                        <h5 className="text-xs font-bold text-slate-900 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          {(doc.fileSize / 1024).toFixed(1)} KB •{" "}
                          {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    <a
                      href={api.getDocumentDownloadUrl(doc.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Legal Summaries & Opinions */}
        {activeTab === "summaries" && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Post-Consultation Legal Opinions</h3>
              <p className="text-xs text-slate-500">
                Official case summaries and guidance notes provided by advocates after completed consultations.
              </p>
            </div>

            {completedAppointments.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Legal Opinions Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Once your advocate completes an online consultation, their legal assessment and advice notes will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">
                          {appt.lawyer?.user?.fullName || "Verified Advocate"}
                        </span>
                        <span className="text-[11px] text-slate-400">• {(appt.lawyer as any)?.barCouncil || "State Bar Council"}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(appt.scheduledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-serif">
                      {appt.consultation?.summary ? (
                        appt.consultation.summary
                      ) : (
                        <span className="text-slate-400 italic">
                          Session concluded. Formal case opinion notes recorded by advocate.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
