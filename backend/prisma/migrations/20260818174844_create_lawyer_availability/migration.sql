-- CreateTable
CREATE TABLE "LawyerAvailability" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawyerAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LawyerAvailability_lawyerId_idx" ON "LawyerAvailability"("lawyerId");

-- CreateIndex
CREATE INDEX "LawyerAvailability_dayOfWeek_idx" ON "LawyerAvailability"("dayOfWeek");

-- AddForeignKey
ALTER TABLE "LawyerAvailability" ADD CONSTRAINT "LawyerAvailability_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
