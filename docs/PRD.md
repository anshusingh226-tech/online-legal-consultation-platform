# Product Requirements Document (PRD)
## Online Legal Consultation & Lawyer Aggregation Platform

**Document Version:** 1.0.0  
**Project Reference:** Unified Mentor - Online Legal Consultation & Lawyer Aggregation Platform  
**Target Audience:** Individuals, Small & Medium Businesses, Verified Legal Professionals, Platform Administrators  

---

## 1. Executive Summary & Context

The **Online Legal Consultation & Lawyer Aggregation Platform** is a unified digital solution designed to bridge the gap between clients needing legal assistance and verified legal advocates across multiple domains of law (Civil, Criminal, Family, Corporate, Property, Cyber, Tax, Labour, Constitutional, and Intellectual Property). 

Similar to telemedicine and on-demand doctor consultation applications, this platform streamlines lawyer discovery, scheduling, consultation delivery (Audio, Video, and Real-time Chat), consultation summarization, document exchange, and client ratings. It replaces traditional manual, opaque, and geographically constrained legal services with a transparent, trusted, and efficient marketplace.

---

## 2. Problem Statement

Accessing qualified legal counsel in India and worldwide faces severe bottlenecks:
1. **Difficulty Finding Trustworthy & Specialized Lawyers:** General directories lack verified bar credentials, peer-reviewed specialties, and transparent practitioner track records.
2. **Lack of Pricing Transparency:** Unpredictable hourly billing and hidden consultation charges deter individuals and small businesses from seeking early legal advice.
3. **Time-Consuming Physical Visits:** Commuting to district and high courts or physical chambers causes significant delays and productivity losses.
4. **Limited Access in Remote / Tier-2 / Tier-3 Areas:** Clients outside major metropolitan centers struggle to access top-tier advocates.
5. **Manual Scheduling & Follow-ups:** Coordination via unorganized phone calls and physical paperwork results in missed appointments, schedule conflicts, and lost case documents.

---

## 3. Platform Objectives

### Primary Objectives
* **Digitize Legal Consultation & Lawyer Discovery:** Offer a responsive web application to search, filter, and compare lawyers based on specialization, experience, location, and fees.
* **Verified Credentials:** Maintain platform integrity through Bar Council registration number verification and credential document audits.
* **Streamline Appointment Booking:** Provide automated calendar conflict detection ensuring lawyers are only booked during active, validated availability slots.
* **Deliver Seamless Online Consultations:** Enable secure Audio, Video, and Chat consultations with immediate post-session case notes and summaries.
* **Enhance Transparency & Trust:** Collect authentic client reviews and published ratings tied to completed consultations.

### Secondary Objectives
* Support diverse legal categories on a scalable micro-architecture.
* Provide lawyers with an end-to-end practice management dashboard (schedule management, request approval/rejection, consultation delivery, and earnings analytics).
* Supply administrators with business intelligence and platform KPIs to monitor platform growth, consultation velocity, and user satisfaction.

---

## 4. Scope of Work

### In-Scope
* **Web-Based Responsive Platform:** Accessible on desktop, tablet, and mobile browsers.
* **User Authentication & Role-Based Access Control:** Distinct workflows for `CLIENT`, `LAWYER`, and `ADMIN`.
* **Lawyer Discovery & Search Engine:** Multi-parameter search by legal domain, experience level, city/location, and fee range.
* **Public Lawyer Profiles:** Bar council details, years of experience, fee structure, bio, reviews, and availability timetable.
* **Consultation Booking Engine:** Multi-mode consultations (`VIDEO`, `AUDIO`, `CHAT`), automated time-slot verification, and conflict prevention.
* **Lawyer Practice Portal:** Accept/reject consultation requests, configure recurring weekly availability, conduct consultations, and view earnings.
* **Consultation Room:** Live virtual consultation interface with video/audio controls, real-time messaging, document exchange, and case summary drafting.
* **Secure Document Sharing:** Upload and attach relevant legal notices, briefs, and proof documents.
* **Admin Governance & Analytics:** Verification approval queue, user/lawyer status management, legal domain CRUD, and KPI metrics dashboard.

### Out of Scope
* Direct court e-filing and e-litigation integration.
* Automated legal document generation and AI contract drafting.
* Native mobile applications (iOS/Android native binaries).
* Escrow or direct banking disbursement gateway.

---

## 5. Functional Requirements

### 5.1 Client (User) Module
| ID | Feature | Description | Acceptance Criteria |
|---|---|---|---|
| **REQ-C01** | Account Registration | User creates account with Full Name, Email, Phone, and Password. | Secure hash storage with bcrypt; duplicate emails prevented. |
| **REQ-C02** | User Login & Session | Authenticates via email/password; receives JWT bearer token. | Returns user role (`CLIENT`) and persists session. |
| **REQ-C03** | Lawyer Discovery | Search & filter by Legal Domain, Location, Experience, and Fee range. | Dynamic client-side and backend filtering returning only approved lawyers. |
| **REQ-C04** | Lawyer Profile View | View credentials, Bar Council ID, bio, domains, reviews, and weekly availability. | Displays verified badge, average rating score, and total review count. |
| **REQ-C05** | Book Consultation | Select date/time slot, consultation mode (`VIDEO`, `AUDIO`, `CHAT`), and add notes. | Verifies slot against lawyer availability and existing bookings; status defaults to `PENDING`. |
| **REQ-C06** | My Appointments | View appointment history tabbed by Upcoming, Completed, and Cancelled. | Displays lawyer info, scheduled time, mode, status, and join/review buttons. |
| **REQ-C07** | Join Consultation | Enter the virtual consultation room during scheduled time. | Accessible via Audio/Video/Chat with participant status and case notes. |
| **REQ-C08** | Document Upload | Attach supporting case documents (PDF, DOCX, Images) to an appointment. | Max size 10MB; restricted to appointment participants and admins. |
| **REQ-C09** | Reviews & Ratings | Submit 1–5 star rating and comment after appointment is `COMPLETED`. | Limited to 1 review per completed appointment; updates lawyer average rating. |

### 5.2 Lawyer Module
| ID | Feature | Description | Acceptance Criteria |
|---|---|---|---|
| **REQ-L01** | Lawyer Onboarding | Submit Bar Council ID, Council Name, Experience, Fee, Bio, and Legal Domains. | Status set to `PENDING`; user role updated to `LAWYER`. |
| **REQ-L02** | Certificate Upload | Upload Bar Council ID and degree certificates for admin verification. | Categorized under `LAWYER_VERIFICATION` documents. |
| **REQ-L03** | Availability Management | Configure recurring weekly available slots (Day of week, start time, end time). | Prevents overlapping intervals; validates start time < end time. |
| **REQ-L04** | Consultation Requests | Review incoming client requests with client case notes. | Action buttons to **Accept** or **Reject** with instant status update. |
| **REQ-L05** | Conduct Consultation | Start and manage consultation session; enter legal advice and case summary. | On completion, updates consultation duration, saves summary, and marks appointment `COMPLETED`. |
| **REQ-L06** | Earnings Dashboard | Track gross earnings, completed consultations count, pending earnings, and monthly trends. | Computed automatically based on completed consultation fees. |
| **REQ-L07** | Profile Management | Update bio, location, consultation fee, and legal domains. | Changes reflected in real-time on public directory. |

### 5.3 Administrator Module
| ID | Feature | Description | Acceptance Criteria |
|---|---|---|---|
| **REQ-A01** | Verification Queue | Inspect pending lawyer applications and view uploaded certificates. | One-click status update to `APPROVED`, `REJECTED`, `UNDER_REVIEW`, or `SUSPENDED`. |
| **REQ-A02** | User & Lawyer Management | Search and audit all platform users and lawyers; toggle active/banned status. | Deactivated accounts immediately blocked from logging in. |
| **REQ-A03** | Consultation Oversight | Monitor all appointments platform-wide; filter by status and consultation mode. | View dispute details and timestamps. |
| **REQ-A04** | Legal Domains CRUD | Add new legal domains, edit descriptions, or deactivate unused domains. | Active domains populated dynamically in search filters. |
| **REQ-A05** | Analytics & KPIs | Executive KPI cards and charts tracking platform metrics. | Real-time calculation of users, verified lawyers, booking rate, avg duration, ratings, and revenue. |

---

## 6. Non-Functional Requirements

### 6.1 Performance
* **API Response Time:** 95% of read queries complete under 200ms; write transactions under 400ms.
* **Low-Latency Virtual Consultation:** Lightweight room coordination with live status polling or WebRTC signaling.
* **Efficient Database Indexing:** B-Tree indexes on `userId`, `lawyerId`, `clientId`, `scheduledAt`, and `status`.

### 6.2 Security & Compliance
* **Authentication:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256, 7-day expiry.
* **Password Hashing:** BCrypt with salt rounds = 10.
* **Role-Based Authorization (RBAC):** Middleware protecting `/api/v1/admin/*`, `/api/v1/lawyers/me/*`, etc.
* **File Upload Security:** MIME-type validation (PDF, Images, Word documents), 10MB size ceiling, secure random storage keys preventing directory traversal.
* **Data Sanitization & Injection Defense:** Parameterized SQL queries via Prisma ORM; Helmet.js security headers; CORS whitelist.

### 6.3 Usability & Design
* **Trust-Focused Aesthetics:** Professional deep navy, slate, gold, and emerald palette.
* **Responsive Layout:** 100% mobile, tablet, and widescreen desktop compatible.
* **Accessibility:** Semantic HTML5 elements, descriptive error messages, and loading skeletons.

---

## 7. Key Performance Indicators (KPIs)

| KPI | Description | Formula / Measurement |
|---|---|---|
| **Total Registered Users** | Total count of client, lawyer, and admin accounts | `COUNT(User.id)` |
| **Verified Lawyers** | Count of lawyers approved for public discovery | `COUNT(Lawyer.id WHERE verificationStatus = 'APPROVED')` |
| **Consultation Booking Rate** | Ratio of consultation bookings per registered client | `Total Appointments / Total Registered Clients` |
| **Average Consultation Duration** | Mean minutes spent in completed legal consultations | `AVG(Consultation.duration WHERE status = 'COMPLETED')` |
| **User Satisfaction Rating** | Platform-wide average review score | `AVG(Review.rating WHERE isPublished = true)` |
| **Gross Platform Volume** | Cumulative fee value of completed consultations | `SUM(Lawyer.consultationFee for COMPLETED appointments)` |

---

## 8. Assumptions & Constraints

### Assumptions
* Lawyers hold valid licenses with recognized State Bar Councils.
* Users agree that platform consultations do not constitute formal court appearance retainers unless separate agreements are executed.
* Platform acts as an aggregator and technology intermediary.

### Constraints
* Consultation fee transactions represented as simulated platform payment ledger.
* Fixed project scope omitting e-courts API integrations.
