# Database Schema Reference
## Online Legal Consultation & Lawyer Aggregation Platform

**DBMS:** PostgreSQL  
**ORM:** Prisma 7 with Native Postgres Adapter (`@prisma/adapter-pg`)  
**Database Name:** `legal_consultation`  

---

## 1. Enums

### `UserRole`
Defines authorization privileges across the platform.
* `CLIENT` — Citizens, individuals, or businesses seeking legal counsel.
* `LAWYER` — Enrolled legal advocates offering consultations.
* `ADMIN` — Platform administrators overseeing verifications, users, and analytics.

### `VerificationStatus`
Tracks lawyer Bar Council credential accreditation lifecycle.
* `PENDING` — Initial application submitted; awaiting document review.
* `UNDER_REVIEW` — Credentials currently undergoing verification against Bar Council registries.
* `APPROVED` — Fully accredited; lawyer appears in public search directories and can accept bookings.
* `REJECTED` — Application rejected due to invalid or unverified credentials.
* `SUSPENDED` — Temporarily or permanently deactivated for platform policy violations.

### `AppointmentStatus`
Manages the end-to-end booking state machine.
* `PENDING` — Client booked a slot; awaiting advocate acceptance.
* `ACCEPTED` — Advocate confirmed the consultation time slot.
* `REJECTED` — Advocate was unable to take the case or time slot.
* `CANCELLED` — Cancelled by either party prior to session start.
* `COMPLETED` — Consultation delivered and concluded with case notes.
* `NO_SHOW` — Client or advocate failed to attend the scheduled session.

### `ConsultationMode`
Communication channels supported in virtual consultation rooms.
* `AUDIO` — Voice consultation.
* `VIDEO` — HD Video consultation with webcam and microphone.
* `CHAT` — Text-based messaging and file exchange.

### `ConsultationStatus`
Tracks the active room state of a consultation session.
* `SCHEDULED` — Appointment accepted and room prepared.
* `IN_PROGRESS` — Participants are currently in session.
* `COMPLETED` — Session concluded, summary saved, and duration computed.
* `CANCELLED` — Session terminated without delivery.

### `DocumentType`
Categorizes uploaded files in the storage system.
* `CONSULTATION` — Case briefs, court notices, contracts, and evidence attached to a booking.
* `LAWYER_VERIFICATION` — State Bar Council certificates, degrees, and identity proofs.

---

## 2. Table Definitions & Constraints

### 2.1 `User`
```sql
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### 2.2 `Lawyer`
```sql
CREATE TABLE "Lawyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE RESTRICT,
    "barRegistrationNumber" TEXT NOT NULL UNIQUE,
    "barCouncil" TEXT NOT NULL,
    "yearsOfExperience" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "consultationFee" DECIMAL(10,2) NOT NULL,
    "bio" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### 2.3 `LegalDomain`
```sql
CREATE TABLE "LegalDomain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### 2.4 `LawyerLegalDomain` (Junction Table)
```sql
CREATE TABLE "LawyerLegalDomain" (
    "lawyerId" TEXT NOT NULL REFERENCES "Lawyer"("id") ON DELETE CASCADE,
    "legalDomainId" TEXT NOT NULL REFERENCES "LegalDomain"("id") ON DELETE CASCADE,
    PRIMARY KEY ("lawyerId", "legalDomainId")
);
```

### 2.5 `LawyerAvailability`
```sql
CREATE TABLE "LawyerAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawyerId" TEXT NOT NULL REFERENCES "Lawyer"("id") ON DELETE CASCADE,
    "dayOfWeek" INTEGER NOT NULL, -- 0 (Sun) to 6 (Sat)
    "startTime" TEXT NOT NULL,    -- HH:MM (24-hour)
    "endTime" TEXT NOT NULL,      -- HH:MM (24-hour)
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "LawyerAvailability_lawyerId_idx" ON "LawyerAvailability"("lawyerId");
CREATE INDEX "LawyerAvailability_dayOfWeek_idx" ON "LawyerAvailability"("dayOfWeek");
```

### 2.6 `Appointment`
```sql
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "lawyerId" TEXT NOT NULL REFERENCES "Lawyer"("id") ON DELETE RESTRICT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "mode" "ConsultationMode" NOT NULL DEFAULT 'VIDEO',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "Appointment_clientId_idx" ON "Appointment"("clientId");
CREATE INDEX "Appointment_lawyerId_idx" ON "Appointment"("lawyerId");
CREATE INDEX "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");
```

### 2.7 `Consultation`
```sql
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL UNIQUE REFERENCES "Appointment"("id") ON DELETE RESTRICT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "summary" TEXT,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### 2.8 `Review`
```sql
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "lawyerId" TEXT NOT NULL REFERENCES "Lawyer"("id") ON DELETE RESTRICT,
    "appointmentId" TEXT NOT NULL UNIQUE REFERENCES "Appointment"("id") ON DELETE RESTRICT,
    "rating" INTEGER NOT NULL, -- 1 to 5
    "comment" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### 2.9 `Document`
```sql
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploadedById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "appointmentId" TEXT REFERENCES "Appointment"("id") ON DELETE SET NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL UNIQUE,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'CONSULTATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");
CREATE INDEX "Document_appointmentId_idx" ON "Document"("appointmentId");
```
