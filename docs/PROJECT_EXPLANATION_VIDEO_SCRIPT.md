# 🎬 Project Explanation Video Script
## Online Legal Consultation & Lawyer Aggregation Platform
**Estimated Duration:** 5–7 minutes

---

## SECTION 1 — Introduction (0:00 – 0:30)

**[SHOW: Title slide — "Online Legal Consultation & Lawyer Aggregation Platform" with a clean legal-themed background, your name, and "Unified Mentor Internship Capstone Project"]**

> "Hi everyone! My name is Anshu, and today I'm going to walk you through my capstone project — the **Online Legal Consultation & Lawyer Aggregation Platform** — built as part of my internship with Unified Mentor.
>
> In India, millions of people struggle to find the right lawyer for their legal needs. The process is fragmented — there's no single platform where you can discover lawyers by specialization, compare them, and consult them online.
>
> This platform solves exactly that problem. It connects clients with verified lawyers across **ten legal domains** — from Civil and Criminal law to Cyber law and Intellectual Property — and enables end-to-end online consultations with booking, video calls, document sharing, and reviews. Think of it as a one-stop legal marketplace."

---

## SECTION 2 — Tech Stack Overview (0:30 – 1:00)

**[SHOW: A tech stack diagram or slide showing logos — React, Tailwind CSS, Node.js, Express.js, PostgreSQL, Prisma]**

> "Let me quickly walk you through the technology stack powering this platform.
>
> On the **frontend**, I'm using **React.js** for a component-driven, responsive UI, styled with **Tailwind CSS** for rapid, utility-first design.
>
> The **backend** runs on **Node.js** with **Express.js**, providing a robust RESTful API layer.
>
> For the **database**, I chose **PostgreSQL** — a production-grade relational database — accessed through **Prisma ORM**, which gives us type-safe queries and seamless schema migrations.
>
> For **security**, the app uses **JWT-based authentication**, **bcrypt** for password hashing, **Helmet.js** for HTTP header hardening, and **CORS** configuration. File uploads — like lawyer bar registration certificates and consultation documents — are handled via **Multer**.
>
> And critically, the entire application enforces **role-based access control** across three distinct user roles: **Client**, **Lawyer**, and **Admin**."

---

## SECTION 3 — Live Demo Walkthrough (1:00 – 5:30)

### 3A — Homepage & Lawyer Discovery (1:00 – 1:45)

**[SHOW: Browser — navigate to the application homepage]**

> "Alright, let's dive into the live demo. Here's the homepage of our platform."

**[SHOW: Hero section, tagline, and call-to-action buttons]**

> "The landing page immediately communicates the platform's value proposition — connecting people with the right legal professionals. You can see the call-to-action buttons for clients to get started and for lawyers to join the platform."

**[SHOW: Scroll down to the domain categories section showing the 10 legal domains]**

> "Scrolling down, we have our **ten legal domain categories** — Civil, Criminal, Family, Corporate, Property, Cyber, Tax, Labour, Constitutional, and Intellectual Property. Clicking any of these filters the lawyer listings to that specialization."

**[SHOW: Navigate to the lawyer search/discovery page. Demonstrate filters — domain dropdown, experience slider, location input, fee range]**

> "Here's the lawyer discovery page. This is the heart of the client experience. You can search and filter lawyers by **legal domain**, **years of experience**, **location**, and **consultation fees**. The results update in real time. Each lawyer card shows their name, specialization, rating, experience, and fee — giving clients all the information they need at a glance."

---

### 3B — Client Flow (1:45 – 3:15)

**[SHOW: Click "Register" — fill out client registration form]**

> "Let's walk through the complete client journey. First, a new user registers as a **Client**. The registration form captures name, email, password, and phone number. We validate inputs on both the client and server side."

**[SHOW: After registration, log in with the client demo account]**

> "Once registered, the client logs in and lands on their personalized **Client Dashboard**."

**[SHOW: Client dashboard — upcoming appointments, recent activity]**

> "The dashboard shows upcoming consultation appointments, recent activity, and quick navigation to key features."

**[SHOW: Browse lawyers list, click on a specific lawyer's profile]**

> "Now, let's browse lawyers. I'll click on this lawyer's profile to see their detailed page."

**[SHOW: Lawyer profile page — photo, bio, bar registration number, domains, experience, fees, rating with reviews, availability calendar]**

> "The lawyer profile is comprehensive. You can see their **bar registration details**, **areas of expertise**, **years of experience**, **consultation fee**, **average rating** with individual reviews from past clients, and most importantly — their **availability calendar** showing open slots.
>
> This transparency builds trust. The client knows exactly who they're consulting with."

**[SHOW: Click "Book Consultation" — select a date/time slot, choose consultation type (audio/video/chat), add a brief description of the legal issue, confirm booking]**

> "To book a consultation, the client selects an available time slot, chooses the consultation mode — **audio, video, or chat** — adds a brief description of their legal issue, and confirms the booking. The system automatically checks for **scheduling conflicts** so double-bookings never happen."

**[SHOW: Navigate to "My Appointments" — show the newly booked appointment with status "Pending"]**

> "The appointment now appears under 'My Appointments' with a **Pending** status, waiting for the lawyer to accept."

**[SHOW: Once accepted (or simulate), click "Join Consultation" to enter the virtual consultation room]**

> "Once the lawyer accepts, the client can join the **Virtual Consultation Room** at the scheduled time. This room supports real-time communication and, critically, **secure document sharing** — so clients can upload and share legal documents directly with their lawyer during the session."

**[SHOW: After consultation, navigate to the review/rating section — submit a star rating and written review]**

> "After the consultation, the client is prompted to leave a **review and rating**. This feedback loop is essential — it helps future clients make informed decisions and incentivizes lawyers to provide quality service."

---

### 3C — Lawyer Flow (3:15 – 4:30)

**[SHOW: Log out of client account. Log in with the lawyer demo account]**

> "Now let's switch perspectives and log in as a **Lawyer**."

**[SHOW: Lawyer dashboard — overview cards showing total consultations, pending requests, earnings summary, upcoming appointments]**

> "The lawyer dashboard is their command center. At a glance, they can see their **total consultations**, **pending requests**, **earnings summary**, and **upcoming appointments**."

**[SHOW: Navigate to "Manage Availability" — show the availability calendar/schedule interface. Add or remove available time slots]**

> "Under **Manage Availability**, lawyers can set their weekly schedule — marking specific time slots as available for consultations. This is what clients see when they try to book. The system is flexible — lawyers can add, modify, or block slots as needed."

**[SHOW: Navigate to "Consultation Requests" — show incoming requests with client details and legal issue descriptions. Click "Accept" on one, "Reject" on another]**

> "When a client books a consultation, it appears here as a **request**. The lawyer can review the client's issue description and choose to **accept** or **reject** the request. Accepting it confirms the appointment on both sides."

**[SHOW: Open an active/scheduled consultation — enter the virtual consultation room from the lawyer's side. Show document sharing capability]**

> "When it's time, the lawyer joins the same **Virtual Consultation Room**. They can communicate with the client, review shared documents, and upload their own documents — like draft agreements or legal opinions."

**[SHOW: Navigate to "Earnings Dashboard" — show earnings breakdown: total earnings, per-consultation earnings, monthly/weekly trends]**

> "The **Earnings Dashboard** gives lawyers full financial visibility. They can track **total earnings**, see **per-consultation breakdowns**, and monitor earning trends over time. This is especially valuable for independent practitioners managing their practice."

---

### 3D — Admin Flow (4:30 – 5:30)

**[SHOW: Log out of lawyer account. Log in with the admin demo account]**

> "Finally, let's look at the **Admin** role — the backbone of platform governance."

**[SHOW: Admin dashboard — KPI analytics with cards/charts showing total users, total lawyers, total consultations, total revenue, active users, platform growth trends]**

> "The Admin dashboard is a full-fledged **KPI analytics panel**. At the top, we have key performance indicators — **total registered users**, **total lawyers**, **total consultations completed**, **platform revenue**, and **growth trends** visualized through charts. This gives the admin a bird's-eye view of platform health."

**[SHOW: Navigate to "Lawyer Verification Queue" — show list of lawyers pending verification with their submitted documents (bar registration certificates). Click to review one, then approve]**

> "One of the most critical admin functions is the **Lawyer Verification Queue**. When a lawyer registers, they submit their **bar registration certificate** and credentials. The admin reviews these documents and either **approves** or **rejects** the lawyer. Only verified lawyers appear in client search results — this maintains platform trust and credibility."

**[SHOW: Navigate to "Manage Users" — show user list with roles, status, ability to activate/deactivate accounts]**

> "Under **User Management**, the admin can view all registered users, filter by role, and **activate or deactivate** accounts as needed."

**[SHOW: Navigate to "Manage Legal Domains/Categories" — show the list of legal categories, add a new one or edit an existing one]**

> "The admin also manages **Legal Domain Categories**. They can add new domains, edit existing ones, or reorganize them. This is important as the platform scales — if a new area of law becomes prominent, the admin can add it without any code changes."

---

## SECTION 4 — Architecture & Code Highlights (5:30 – 6:30)

**[SHOW: Switch to VS Code or your code editor — show the project folder structure in the sidebar]**

> "Let me briefly show you the project architecture."

**[SHOW: Expand the folder structure — highlight `client/` and `server/` directories]**

> "The project follows a clean **monorepo structure** with separate `client` and `server` directories. The frontend React app lives in `client`, and the Express API server lives in `server`."

**[SHOW: Open `server/routes/` directory — show route files like `authRoutes.js`, `lawyerRoutes.js`, `consultationRoutes.js`, `adminRoutes.js`]**

> "On the backend, API routes are modularized by feature — we have dedicated route files for **authentication**, **lawyer management**, **consultation booking**, **reviews**, and **admin operations**. Each route is protected by our authentication and role-based authorization middleware."

**[SHOW: Open the Prisma schema file (`schema.prisma`) — scroll through models like User, Lawyer, Consultation, Review, Availability]**

> "Here's our **Prisma schema** — the single source of truth for our database structure. You can see the core models: **User** with role-based fields, **Lawyer** with specialization and verification status, **Consultation** with booking details and status tracking, **Review** with ratings, and **Availability** for scheduling. The relationships between these models are clearly defined with Prisma's relation syntax."

**[SHOW: Open the auth middleware file — highlight JWT verification and role-checking logic]**

> "And here's our **authentication middleware**. Every protected route passes through this — it verifies the **JWT token**, extracts the user's role, and enforces **role-based access control**. A client can't access lawyer endpoints, a lawyer can't access admin endpoints. This is security at the architectural level."

---

## SECTION 5 — Conclusion (6:30 – 7:00)

**[SHOW: Return to the application homepage or a closing slide with project title, GitHub link, and your name]**

> "To summarize — this **Online Legal Consultation & Lawyer Aggregation Platform** is a full-stack application that addresses a real-world gap in legal service accessibility. It provides a seamless experience for clients to discover and consult lawyers, empowers lawyers to manage their practice digitally, and gives administrators complete platform oversight.
>
> In terms of **future scope**, this platform could be extended with **integrated payment gateways**, **AI-powered lawyer recommendations**, **multi-language support**, and **mobile app versions** to reach an even wider audience.
>
> The project is open-source and available on GitHub — the link is in the description.
>
> I'd like to sincerely thank **Unified Mentor** for providing this opportunity and for the well-structured project requirements that guided this development.
>
> Thank you for watching!"

**[SHOW: End screen — "Thank You" with GitHub link: https://github.com/anshusingh226-tech/online-legal-consultation-platform]**

---

> [!TIP]
> **Recording Tips:**
> - Use a screen recorder like OBS Studio or Loom
> - Keep your browser zoom at 90–100% for readability
> - Pre-login to all three demo accounts in separate browser profiles or incognito tabs for quick switching
> - Rehearse the demo flow once before recording to ensure smooth transitions
> - Speak at a measured pace — aim for clarity over speed
