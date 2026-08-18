-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "Lawyer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barRegistrationNumber" TEXT NOT NULL,
    "barCouncil" TEXT NOT NULL,
    "yearsOfExperience" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "consultationFee" DECIMAL(10,2) NOT NULL,
    "bio" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lawyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_userId_key" ON "Lawyer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_barRegistrationNumber_key" ON "Lawyer"("barRegistrationNumber");

-- AddForeignKey
ALTER TABLE "Lawyer" ADD CONSTRAINT "Lawyer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
