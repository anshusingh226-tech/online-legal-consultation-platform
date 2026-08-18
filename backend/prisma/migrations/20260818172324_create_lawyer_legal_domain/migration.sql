-- CreateTable
CREATE TABLE "LawyerLegalDomain" (
    "lawyerId" TEXT NOT NULL,
    "legalDomainId" TEXT NOT NULL,

    CONSTRAINT "LawyerLegalDomain_pkey" PRIMARY KEY ("lawyerId","legalDomainId")
);

-- AddForeignKey
ALTER TABLE "LawyerLegalDomain" ADD CONSTRAINT "LawyerLegalDomain_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerLegalDomain" ADD CONSTRAINT "LawyerLegalDomain_legalDomainId_fkey" FOREIGN KEY ("legalDomainId") REFERENCES "LegalDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
