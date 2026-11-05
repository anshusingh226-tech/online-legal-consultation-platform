export type UserRole = "CLIENT" | "LAWYER" | "ADMIN";

export type VerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type AppointmentStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export type ConsultationMode = "AUDIO" | "VIDEO" | "CHAT";

export type ConsultationStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type DocumentType = "CONSULTATION" | "LAWYER_VERIFICATION";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lawyer?: {
    id: string;
    verificationStatus: VerificationStatus;
    barRegistrationNumber: string;
  } | null;
}

export interface LegalDomain {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  verifiedLawyersCount?: number;
  createdAt?: string;
}

export interface LawyerAvailability {
  id: string;
  lawyerId: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  isActive: boolean;
}

export interface DocumentItem {
  id: string;
  uploadedById: string;
  appointmentId?: string | null;
  fileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  type: DocumentType;
  createdAt: string;
  uploadedBy?: {
    id: string;
    fullName: string;
    role: UserRole;
  };
}

export interface ReviewItem {
  id: string;
  clientId: string;
  lawyerId: string;
  appointmentId: string;
  rating: number;
  comment?: string | null;
  isPublished: boolean;
  createdAt: string;
  client?: {
    fullName: string;
  };
}

export interface Lawyer {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phone?: string | null;
  location: string;
  yearsOfExperience: number;
  consultationFee: number;
  bio?: string | null;
  barRegistrationNumber: string;
  barCouncil: string;
  verificationStatus: VerificationStatus;
  legalDomains: LegalDomain[];
  averageRating: number;
  totalReviews: number;
  reviews?: ReviewItem[];
  availability?: LawyerAvailability[];
  verificationDocuments?: DocumentItem[];
}

export interface Consultation {
  id: string;
  appointmentId: string;
  startedAt?: string | null;
  endedAt?: string | null;
  duration?: number | null;
  summary?: string | null;
  status: ConsultationStatus;
}

export interface Appointment {
  id: string;
  clientId: string;
  lawyerId: string;
  scheduledAt: string;
  duration: number;
  status: AppointmentStatus;
  mode: ConsultationMode;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  lawyer?: {
    id: string;
    userId: string;
    location?: string;
    consultationFee?: number;
    user: {
      fullName: string;
      email: string;
      phone?: string | null;
    };
    legalDomains?: { legalDomain: LegalDomain }[];
  };
  consultation?: Consultation | null;
  review?: ReviewItem | null;
  documents?: DocumentItem[];
}

export interface AdminAnalytics {
  kpis: {
    totalRegisteredUsers: number;
    totalClients: number;
    totalLawyers: number;
    verifiedLawyers: number;
    pendingLawyers: number;
    totalAppointments: number;
    completedAppointments: number;
    bookingRate: number;
    averageConsultationDuration: number;
    userSatisfactionRating: number;
    totalReviewsCount: number;
    totalPlatformVolume: number;
  };
  usersBreakdown: {
    clients: number;
    lawyers: number;
    admins: number;
  };
  lawyerStatusBreakdown: {
    approved: number;
    pending: number;
    underReview: number;
    rejectedOrSuspended: number;
  };
  appointmentBreakdown: {
    total: number;
    completed: number;
    accepted: number;
    pending: number;
    cancelled: number;
  };
  domainsDistribution: {
    name: string;
    lawyersCount: number;
  }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}
