const getApiBase = () => {
  const url =
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? "https://legal-consultation-api.onrender.com"
      : "");
  if (!url) return "/api/v1";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `${url.replace(/\/+$/, "")}/api/v1`;
  }
  return `https://${url.replace(/\/+$/, "")}/api/v1`;
};

const API_BASE = getApiBase();

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async register(body: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  async login(body: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Lawyers Public
  async getLawyers(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/lawyers?${query}`);
    return handleResponse<any>(res);
  },

  async getLawyerById(id: string) {
    const res = await fetch(`${API_BASE}/lawyers/${id}`);
    return handleResponse<any>(res);
  },

  async applyAsLawyer(body: any) {
    const res = await fetch(`${API_BASE}/lawyers/apply`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  async getMyLawyerProfile() {
    const res = await fetch(`${API_BASE}/lawyers/me/profile`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async updateLawyerProfile(body: any) {
    const res = await fetch(`${API_BASE}/lawyers/me/profile`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  async getLawyerEarnings() {
    const res = await fetch(`${API_BASE}/lawyers/me/earnings`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Lawyer Availability
  async getMyAvailability() {
    const res = await fetch(`${API_BASE}/lawyers/availability`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async createAvailability(body: { dayOfWeek: number; startTime: string; endTime: string }) {
    const res = await fetch(`${API_BASE}/lawyers/availability`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  async deleteAvailability(id: string) {
    const res = await fetch(`${API_BASE}/lawyers/availability/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Appointments
  async createAppointment(body: {
    lawyerId: string;
    scheduledAt: string;
    duration: number;
    mode: string;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  async getMyAppointments() {
    const res = await fetch(`${API_BASE}/appointments`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async getAppointmentById(id: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async updateAppointmentStatus(id: string, status: string, notes?: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse<any>(res);
  },

  // Consultations
  async getConsultation(appointmentId: string) {
    const res = await fetch(`${API_BASE}/consultations/${appointmentId}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async startConsultation(appointmentId: string) {
    const res = await fetch(`${API_BASE}/consultations/${appointmentId}/start`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async endConsultation(appointmentId: string, summary?: string) {
    const res = await fetch(`${API_BASE}/consultations/${appointmentId}/end`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ summary }),
    });
    return handleResponse<any>(res);
  },

  async saveConsultationSummary(appointmentId: string, summary: string) {
    const res = await fetch(`${API_BASE}/consultations/${appointmentId}/summary`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ summary }),
    });
    return handleResponse<any>(res);
  },

  async sendChatMessage(appointmentId: string, text: string) {
    const res = await fetch(`${API_BASE}/consultations/${appointmentId}/chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse<any>(res);
  },

  async getChatMessages(appointmentId: string) {
    const res = await fetch(`${API_BASE}/consultations/${appointmentId}/chat`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Reviews
  async createReview(body: { appointmentId: string; rating: number; comment?: string }) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  async getLawyerReviews(lawyerId: string) {
    const res = await fetch(`${API_BASE}/reviews/lawyer/${lawyerId}`);
    return handleResponse<any>(res);
  },

  // Documents
  async uploadDocument(formData: FormData) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse<any>(res);
  },

  async getMyDocuments() {
    const res = await fetch(`${API_BASE}/documents/my`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async getAppointmentDocuments(appointmentId: string) {
    const res = await fetch(`${API_BASE}/documents/appointment/${appointmentId}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async getLawyerVerificationDocuments(lawyerId: string) {
    const res = await fetch(`${API_BASE}/documents/lawyer/${lawyerId}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  getDocumentDownloadUrl(id: string) {
    return `${API_BASE}/documents/download/${id}`;
  },

  // Legal Domains
  async getLegalDomains(includeInactive = false) {
    const res = await fetch(`${API_BASE}/legal-domains?includeInactive=${includeInactive}`);
    return handleResponse<any>(res);
  },

  async createLegalDomain(body: { name: string; description?: string }) {
    const res = await fetch(`${API_BASE}/legal-domains`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  async updateLegalDomain(id: string, body: any) {
    const res = await fetch(`${API_BASE}/legal-domains/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<any>(res);
  },

  // Admin
  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async getAdminLawyers(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/lawyers?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async updateLawyerVerification(id: string, status: string) {
    const res = await fetch(`${API_BASE}/admin/lawyers/${id}/verification`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<any>(res);
  },

  async getAdminUsers(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async toggleUserActiveStatus(id: string, isActive: boolean) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return handleResponse<any>(res);
  },

  async getAdminConsultations(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/consultations?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },
};
