import React, { useState, useEffect } from "react";
import { AdminAnalytics, Lawyer, User, Appointment, LegalDomain } from "../types";
import { api } from "../services/api";
import {
  ShieldCheck,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Search,
  Plus,
  Edit2,
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
  UserCheck,
  UserX,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"analytics" | "lawyers" | "users" | "consultations" | "domains">("analytics");

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [consultations, setConsultations] = useState<Appointment[]>([]);
  const [domains, setDomains] = useState<LegalDomain[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [lawyerStatusFilter, setLawyerStatusFilter] = useState<string>("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Domain modal state
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<LegalDomain | null>(null);
  const [domainName, setDomainName] = useState("");
  const [domainDesc, setDomainDesc] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, lawyersRes, usersRes, consultRes, domainsRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminLawyers(),
        api.getAdminUsers(),
        api.getAdminConsultations(),
        api.getLegalDomains(true),
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (lawyersRes.data) setLawyers(lawyersRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (consultRes.data) setConsultations(consultRes.data);
      if (domainsRes.data) setDomains(domainsRes.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLawyerStatus = async (lawyerId: string, status: string) => {
    try {
      await api.updateLawyerVerification(lawyerId, status);
      const [lawyersRes, analyticsRes] = await Promise.all([
        api.getAdminLawyers(),
        api.getAdminAnalytics(),
      ]);
      if (lawyersRes.data) setLawyers(lawyersRes.data);
      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      alert(`Lawyer status updated to ${status}`);
    } catch (err: any) {
      alert(err.message || "Failed to update verification status");
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.toggleUserActiveStatus(userId, !currentStatus);
      const usersRes = await api.getAdminUsers();
      if (usersRes.data) setUsers(usersRes.data);
    } catch (err: any) {
      alert(err.message || "Failed to toggle user status");
    }
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDomain) {
        await api.updateLegalDomain(editingDomain.id, {
          name: domainName,
          description: domainDesc,
        });
      } else {
        await api.createLegalDomain({
          name: domainName,
          description: domainDesc,
        });
      }
      setShowDomainModal(false);
      setEditingDomain(null);
      setDomainName("");
      setDomainDesc("");
      const domRes = await api.getLegalDomains(true);
      if (domRes.data) setDomains(domRes.data);
    } catch (err: any) {
      alert(err.message || "Failed to save legal domain");
    }
  };

  const filteredLawyers = lawyers.filter((l) => {
    if (lawyerStatusFilter !== "ALL" && l.verificationStatus !== lawyerStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.fullName.toLowerCase().includes(q) ||
        l.barRegistrationNumber.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              Platform Administration
            </h1>
            <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Super Admin Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor platform KPIs, verify legal credentials, manage platform users, and oversee consultations
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          Refresh Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "analytics"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-navy-800" />
          <span>KPI Analytics Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("lawyers")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "lawyers"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Lawyer Verification Desk ({lawyers.length})</span>
          {analytics?.lawyerStatusBreakdown.pending ? (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {analytics.lawyerStatusBreakdown.pending}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "users"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("consultations")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "consultations"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4 text-gold-600" />
          <span>Consultations Oversight ({consultations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("domains")}
          className={`py-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "domains"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Legal Categories ({domains.length})</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE KPI ANALYTICS */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-8">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Registered Users
              </span>
              <span className="text-3xl font-extrabold font-serif text-slate-900 mt-2 block">
                {analytics.kpis.totalRegisteredUsers}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                {analytics.usersBreakdown.clients} Clients • {analytics.usersBreakdown.lawyers} Advocates
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Verified Lawyers
              </span>
              <span className="text-3xl font-extrabold font-serif text-emerald-600 mt-2 block">
                {analytics.kpis.verifiedLawyers}
              </span>
              <span className="text-xs text-amber-600 mt-1 block">
                {analytics.kpis.pendingLawyers} pending verification review
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Consultation Booking Rate
              </span>
              <span className="text-3xl font-extrabold font-serif text-blue-600 mt-2 block">
                {analytics.kpis.bookingRate}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                {analytics.kpis.totalAppointments} total appointments scheduled
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                User Satisfaction Score
              </span>
              <span className="text-3xl font-extrabold font-serif text-amber-500 mt-2 block flex items-center gap-1">
                <Star className="w-6 h-6 fill-amber-400" />
                {analytics.kpis.userSatisfactionRating}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Avg duration: {analytics.kpis.averageConsultationDuration} mins
              </span>
            </div>
          </div>

          {/* Revenue & Consultation Volumes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white p-6 sm:p-8 rounded-3xl border border-navy-800 shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider block">
                  Cumulative Consultation Volume
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold font-serif text-white mt-2 block">
                  ₹{analytics.kpis.totalPlatformVolume}
                </span>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Total consultation fees generated across {analytics.kpis.completedAppointments} completed advocate consultations.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Completed</span>
                  <span className="font-bold text-white text-base">{analytics.appointmentBreakdown.completed}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pending / Accepted</span>
                  <span className="font-bold text-white text-base">
                    {analytics.appointmentBreakdown.pending + analytics.appointmentBreakdown.accepted}
                  </span>
                </div>
              </div>
            </div>

            {/* Distribution by Legal Domain */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Advocate Distribution Across Legal Domains
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {analytics.domainsDistribution.map((d) => (
                  <div key={d.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-800 block truncate">{d.name}</span>
                    <span className="text-lg font-bold text-navy-900 mt-1 block">{d.lawyersCount}</span>
                    <span className="text-[10px] text-slate-400">Verified Advocates</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAWYER VERIFICATION QUEUE */}
      {activeTab === "lawyers" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
              <select
                value={lawyerStatusFilter}
                onChange={(e) => setLawyerStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING (Review Needed)</option>
                <option value="APPROVED">APPROVED (Live)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="REJECTED">REJECTED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search advocate, bar reg, city..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
          </div>

          {filteredLawyers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No lawyer profiles found under this filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLawyers.map((lawyer) => (
                <div
                  key={lawyer.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base font-serif">{lawyer.fullName}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          lawyer.verificationStatus === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : lawyer.verificationStatus === "PENDING"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-red-50 text-red-800 border-red-200"
                        }`}
                      >
                        {lawyer.verificationStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bar Registration</span>
                        <span className="font-semibold text-navy-950">{lawyer.barRegistrationNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bar Council</span>
                        <span className="font-semibold text-slate-800 truncate block">{lawyer.barCouncil}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Experience & City</span>
                        <span className="font-semibold text-slate-800">{lawyer.yearsOfExperience} yrs • {lawyer.location}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                        <span className="font-bold text-navy-900">₹{lawyer.consultationFee}</span>
                      </div>
                    </div>

                    {/* Verification Documents attached */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">Submitted Credentials:</span>
                      {lawyer.verificationDocuments && lawyer.verificationDocuments.length > 0 ? (
                        lawyer.verificationDocuments.map((doc) => (
                          <a
                            key={doc.id}
                            href={api.getDocumentDownloadUrl(doc.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                          >
                            <FileText className="w-3 h-3 text-gold-600" />
                            <span>{doc.fileName}</span>
                          </a>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No certificate uploaded</span>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {lawyer.verificationStatus !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdateLawyerStatus(lawyer.id, "APPROVED")}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Verify</span>
                      </button>
                    )}

                    {lawyer.verificationStatus !== "UNDER_REVIEW" && (
                      <button
                        onClick={() => handleUpdateLawyerStatus(lawyer.id, "UNDER_REVIEW")}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Under Review
                      </button>
                    )}

                    {lawyer.verificationStatus !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateLawyerStatus(lawyer.id, "REJECTED")}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER DIRECTORY & ACCESS CONTROL */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Role Filter:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="CLIENT">Clients</option>
                <option value="LAWYER">Lawyers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-900 block">{u.fullName}</span>
                      <span className="text-slate-400 text-[11px]">{u.email}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : u.role === "LAWYER"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{u.phone || "—"}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          u.isActive ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {u.isActive ? "● Active" : "● Banned / Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            u.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONSULTATIONS PLATFORM OVERSIGHT */}
      {activeTab === "consultations" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">Consultation Sessions Audit Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">Platform-wide overview of all legal consultations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Advocate</th>
                  <th className="px-6 py-3.5">Scheduled Date</th>
                  <th className="px-6 py-3.5">Mode</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{c.client?.fullName}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">{c.lawyer?.user.fullName}</td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {new Date(c.scheduledAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-6 py-3.5 font-medium">{c.mode}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {c.review ? (
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {c.review.rating} / 5
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LEGAL CATEGORIES MANAGEMENT */}
      {activeTab === "domains" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">Legal Domains & Categories</h3>
              <p className="text-xs text-slate-500">Define the legal branches available for lawyer specialization and discovery</p>
            </div>
            <button
              onClick={() => {
                setEditingDomain(null);
                setDomainName("");
                setDomainDesc("");
                setShowDomainModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>Add New Legal Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <div key={domain.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">{domain.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${domain.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                      {domain.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {domain.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {domain.verifiedLawyersCount || 0} Advocates
                  </span>
                  <button
                    onClick={() => {
                      setEditingDomain(domain);
                      setDomainName(domain.name);
                      setDomainDesc(domain.description || "");
                      setShowDomainModal(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-navy-900"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal to add/edit domain */}
          {showDomainModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  {editingDomain ? "Edit Legal Domain" : "Create New Legal Domain"}
                </h3>
                <form onSubmit={handleSaveDomain} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Domain Name</label>
                    <input
                      type="text"
                      required
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      placeholder="e.g. Maritime Law"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={domainDesc}
                      onChange={(e) => setDomainDesc(e.target.value)}
                      placeholder="Scope of legal matters covered..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDomainModal(false)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 shadow-xs"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
