import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const legalDomainsData = [
  {
    name: "Criminal Law",
    description: "Legal matters involving criminal offenses, trials, bails, and defense representation.",
  },
  {
    name: "Civil Law",
    description: "Disputes involving individuals, organizations, property damage, contracts, and torts.",
  },
  {
    name: "Family Law",
    description: "Marriage, divorce, domestic disputes, child custody, alimony, and adoption.",
  },
  {
    name: "Corporate Law",
    description: "Company incorporation, mergers & acquisitions, corporate governance, and commercial agreements.",
  },
  {
    name: "Constitutional Law",
    description: "Fundamental rights, writ petitions, constitutional disputes, and public interest litigation.",
  },
  {
    name: "Property Law",
    description: "Real estate transactions, title verification, land disputes, lease agreements, and partition suits.",
  },
  {
    name: "Intellectual Property Law",
    description: "Patents, trademarks, copyrights, trade secrets, design registrations, and IP litigation.",
  },
  {
    name: "Cyber Law",
    description: "Digital transactions, cyber fraud, data privacy compliance, IT Act disputes, and cyber defamation.",
  },
  {
    name: "Tax Law",
    description: "Direct and indirect taxes, GST disputes, income tax appeals, and international tax structuring.",
  },
  {
    name: "Labour Law",
    description: "Employment contracts, workplace disputes, wrongful termination, industrial tribunals, and PF/ESI compliance.",
  },
];

async function main() {
  console.log("Starting comprehensive seed...");

  // 1. Seed Legal Domains
  const domainMap = new Map<string, string>();
  for (const domain of legalDomainsData) {
    const d = await prisma.legalDomain.upsert({
      where: { name: domain.name },
      update: { description: domain.description, isActive: true },
      create: domain,
    });
    domainMap.set(d.name, d.id);
  }
  console.log(`✓ Seeded ${legalDomainsData.length} legal domains`);

  const passwordHash = await bcrypt.hash("Password@123", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);

  // 2. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@legalplatform.com" },
    update: { role: "ADMIN", isActive: true },
    create: {
      fullName: "Super Admin",
      email: "admin@legalplatform.com",
      phone: "+91 98765 00000",
      password: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✓ Seeded Admin user: ${admin.email} (Password: Admin@123)`);

  // 3. Seed Clients
  const client1 = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: { role: "CLIENT", isActive: true },
    create: {
      fullName: "Rahul Verma",
      email: "client@example.com",
      phone: "+91 98765 11111",
      password: passwordHash,
      role: "CLIENT",
      isActive: true,
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: "ananya@example.com" },
    update: { role: "CLIENT", isActive: true },
    create: {
      fullName: "Ananya Gupta",
      email: "ananya@example.com",
      phone: "+91 98765 22222",
      password: passwordHash,
      role: "CLIENT",
      isActive: true,
    },
  });
  console.log("✓ Seeded Clients (Rahul Verma, Ananya Gupta)");

  // 4. Seed Lawyers
  const lawyersSeedData = [
    {
      fullName: "Adv. Rajesh Sharma",
      email: "rajesh.sharma@lawyer.com",
      phone: "+91 98111 23456",
      barRegistrationNumber: "D/1428/2012",
      barCouncil: "Bar Council of Delhi",
      yearsOfExperience: 12,
      location: "New Delhi",
      consultationFee: 1500,
      bio: "Senior Advocate with 12+ years of extensive courtroom experience specializing in Criminal Defense, Constitutional Law, and Supreme Court writ petitions.",
      verificationStatus: "APPROVED" as const,
      domains: ["Criminal Law", "Constitutional Law"],
    },
    {
      fullName: "Adv. Priya Nair",
      email: "priya.nair@lawyer.com",
      phone: "+91 98222 34567",
      barRegistrationNumber: "MAH/2084/2016",
      barCouncil: "Bar Council of Maharashtra & Goa",
      yearsOfExperience: 8,
      location: "Mumbai",
      consultationFee: 1200,
      bio: "Dedicated Family and Civil Law practitioner specializing in divorce mediation, domestic disputes, child custody, and civil dispute resolution with empathy and diligence.",
      verificationStatus: "APPROVED" as const,
      domains: ["Family Law", "Civil Law"],
    },
    {
      fullName: "Adv. Amitav Sengupta",
      email: "amitav.sengupta@lawyer.com",
      phone: "+91 98333 45678",
      barRegistrationNumber: "KAR/3105/2009",
      barCouncil: "Karnataka State Bar Council",
      yearsOfExperience: 15,
      location: "Bengaluru",
      consultationFee: 2500,
      bio: "Specialist in Corporate Governance, startup advisory, M&A due diligence, and Intellectual Property protection. Former in-house counsel for tier-1 tech enterprises.",
      verificationStatus: "APPROVED" as const,
      domains: ["Corporate Law", "Intellectual Property Law"],
    },
    {
      fullName: "Adv. Sneha Kulkarni",
      email: "sneha.kulkarni@lawyer.com",
      phone: "+91 98444 56789",
      barRegistrationNumber: "MAH/4512/2018",
      barCouncil: "Bar Council of Maharashtra & Goa",
      yearsOfExperience: 6,
      location: "Pune",
      consultationFee: 1000,
      bio: "Cyber Law & Property Law legal expert focusing on IT Act offenses, digital privacy, online fraud recovery, and property title deed verifications.",
      verificationStatus: "APPROVED" as const,
      domains: ["Cyber Law", "Property Law"],
    },
    {
      fullName: "Adv. Vikram Malhotra",
      email: "vikram.malhotra@lawyer.com",
      phone: "+91 98555 67890",
      barRegistrationNumber: "TS/1129/2014",
      barCouncil: "Bar Council of Telangana",
      yearsOfExperience: 10,
      location: "Hyderabad",
      consultationFee: 1800,
      bio: "Experienced legal strategist for Corporate Taxation, GST litigation, and employment labor disputes representing corporate clients and employees before tribunals.",
      verificationStatus: "APPROVED" as const,
      domains: ["Tax Law", "Labour Law"],
    },
    {
      fullName: "Adv. Rohan Verma",
      email: "rohan.verma@lawyer.com",
      phone: "+91 98666 78901",
      barRegistrationNumber: "WB/5541/2020",
      barCouncil: "Bar Council of West Bengal",
      yearsOfExperience: 4,
      location: "Kolkata",
      consultationFee: 800,
      bio: "Young enthusiastic advocate practicing Civil and Commercial litigation in Calcutta High Court. Documents submitted for platform review.",
      verificationStatus: "PENDING" as const,
      domains: ["Civil Law"],
    },
  ];

  const seededLawyers: any[] = [];

  for (const lawyerItem of lawyersSeedData) {
    const user = await prisma.user.upsert({
      where: { email: lawyerItem.email },
      update: { role: "LAWYER", isActive: true },
      create: {
        fullName: lawyerItem.fullName,
        email: lawyerItem.email,
        phone: lawyerItem.phone,
        password: passwordHash,
        role: "LAWYER",
        isActive: true,
      },
    });

    const lawyer = await prisma.lawyer.upsert({
      where: { userId: user.id },
      update: {
        barRegistrationNumber: lawyerItem.barRegistrationNumber,
        barCouncil: lawyerItem.barCouncil,
        yearsOfExperience: lawyerItem.yearsOfExperience,
        location: lawyerItem.location,
        consultationFee: lawyerItem.consultationFee,
        bio: lawyerItem.bio,
        verificationStatus: lawyerItem.verificationStatus,
      },
      create: {
        userId: user.id,
        barRegistrationNumber: lawyerItem.barRegistrationNumber,
        barCouncil: lawyerItem.barCouncil,
        yearsOfExperience: lawyerItem.yearsOfExperience,
        location: lawyerItem.location,
        consultationFee: lawyerItem.consultationFee,
        bio: lawyerItem.bio,
        verificationStatus: lawyerItem.verificationStatus,
      },
    });

    // Link legal domains
    for (const domainName of lawyerItem.domains) {
      const domainId = domainMap.get(domainName);
      if (domainId) {
        await prisma.lawyerLegalDomain.upsert({
          where: {
            lawyerId_legalDomainId: {
              lawyerId: lawyer.id,
              legalDomainId: domainId,
            },
          },
          update: {},
          create: {
            lawyerId: lawyer.id,
            legalDomainId: domainId,
          },
        });
      }
    }

    // Set availability slots for approved lawyers (Monday to Saturday: 10:00-13:00 and 14:00-18:00)
    if (lawyerItem.verificationStatus === "APPROVED") {
      await prisma.lawyerAvailability.deleteMany({
        where: { lawyerId: lawyer.id },
      });
      for (let day = 1; day <= 6; day++) {
        // Morning slot
        await prisma.lawyerAvailability.create({
          data: {
            lawyerId: lawyer.id,
            dayOfWeek: day,
            startTime: "10:00",
            endTime: "13:00",
            isActive: true,
          },
        });
        // Evening slot
        await prisma.lawyerAvailability.create({
          data: {
            lawyerId: lawyer.id,
            dayOfWeek: day,
            startTime: "14:00",
            endTime: "18:00",
            isActive: true,
          },
        });
      }
    }

    // Create a mock verification document for each lawyer (idempotent upsert)
    await prisma.document.upsert({
      where: { storageKey: `sample-cert-${user.id}.pdf` },
      update: {},
      create: {
        uploadedById: user.id,
        fileName: `${lawyerItem.barRegistrationNumber.replace(/\//g, "-")}_BarCertificate.pdf`,
        storageKey: `sample-cert-${user.id}.pdf`,
        mimeType: "application/pdf",
        fileSize: 420000,
        type: "LAWYER_VERIFICATION",
      },
    });

    seededLawyers.push({ user, lawyer });
  }
  console.log(`✓ Seeded ${lawyersSeedData.length} lawyers with availability & certificates`);

  // 5. Seed Appointments & Consultations (only if not already created)
  const lawyerRajesh = seededLawyers[0].lawyer;
  const lawyerPriya = seededLawyers[1].lawyer;
  const lawyerAmitav = seededLawyers[2].lawyer;

  const existingAppt = await prisma.appointment.findFirst({
    where: { clientId: client1.id, lawyerId: lawyerRajesh.id },
  });

  if (!existingAppt) {
    // Appointment 1: Completed consultation with Adv. Rajesh Sharma + 5-star review
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 3);
    pastDate1.setHours(11, 0, 0, 0);

    const appt1 = await prisma.appointment.create({
      data: {
        clientId: client1.id,
        lawyerId: lawyerRajesh.id,
        scheduledAt: pastDate1,
        duration: 30,
        mode: "VIDEO",
        notes: "Need consultation on a high-stakes commercial breach of contract and criminal defamation threat.",
        status: "COMPLETED",
      },
    });

    await prisma.consultation.create({
      data: {
        appointmentId: appt1.id,
        startedAt: pastDate1,
        endedAt: new Date(pastDate1.getTime() + 32 * 60 * 1000),
        duration: 32,
        summary: "Reviewed notice received by client. Advised to issue formal legal rebuttal within 14 days and file anticipatory bail petition if FIR is registered.",
        status: "COMPLETED",
      },
    });

    await prisma.review.create({
      data: {
        clientId: client1.id,
        lawyerId: lawyerRajesh.id,
        appointmentId: appt1.id,
        rating: 5,
        comment: "Advocate Rajesh provided crystal clear clarity on legal risk and framed a sharp defense strategy. Very reassuring experience!",
        isPublished: true,
      },
    });

    // Appointment 2: Completed consultation with Adv. Priya Nair + 5-star review
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 5);
    pastDate2.setHours(15, 0, 0, 0);

    const appt2 = await prisma.appointment.create({
      data: {
        clientId: client2.id,
        lawyerId: lawyerPriya.id,
        scheduledAt: pastDate2,
        duration: 45,
        mode: "VIDEO",
        notes: "Seeking advice regarding child custody agreement during mutual consent separation.",
        status: "COMPLETED",
      },
    });

    await prisma.consultation.create({
      data: {
        appointmentId: appt2.id,
        startedAt: pastDate2,
        endedAt: new Date(pastDate2.getTime() + 45 * 60 * 1000),
        duration: 45,
        summary: "Detailed discussion on visitation schedule, joint custody terms, and child maintenance escrow account structuring.",
        status: "COMPLETED",
      },
    });

    await prisma.review.create({
      data: {
        clientId: client2.id,
        lawyerId: lawyerPriya.id,
        appointmentId: appt2.id,
        rating: 5,
        comment: "Advocate Priya is exceptionally empathetic and knowledgeable. She made a difficult conversation smooth and constructive.",
        isPublished: true,
      },
    });

    // Appointment 3: Upcoming Accepted consultation with Adv. Amitav Sengupta
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 2);
    futureDate1.setHours(11, 0, 0, 0);

    const appt3 = await prisma.appointment.create({
      data: {
        clientId: client1.id,
        lawyerId: lawyerAmitav.id,
        scheduledAt: futureDate1,
        duration: 30,
        mode: "AUDIO",
        notes: "Startup founder agreement review and trademark registration strategy for SaaS platform.",
        status: "ACCEPTED",
      },
    });

    await prisma.consultation.create({
      data: {
        appointmentId: appt3.id,
        status: "SCHEDULED",
      },
    });

    // Appointment 4: Pending consultation request for Adv. Rajesh Sharma
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 4);
    futureDate2.setHours(14, 30, 0, 0);

    await prisma.appointment.create({
      data: {
        clientId: client2.id,
        lawyerId: lawyerRajesh.id,
        scheduledAt: futureDate2,
        duration: 30,
        mode: "CHAT",
        notes: "Inquiry regarding cyber impersonation and FIR filing under Section 66D IT Act.",
        status: "PENDING",
      },
    });
  }

  console.log("✓ Seeded sample appointments, consultations, and reviews");
  console.log("\n=======================================================");
  console.log("SEEDING COMPLETED SUCCESSFULLY!");
  console.log("Platform Accounts:");
  console.log("  • Admin:   admin@legalplatform.com     / Admin@123");
  console.log("  • Lawyer:  rajesh.sharma@lawyer.com    / Password@123");
  console.log("  • Lawyer:  priya.nair@lawyer.com       / Password@123");
  console.log("  • Client:  client@example.com          / Password@123");
  console.log("  • Client:  ananya@example.com          / Password@123");
  console.log("=======================================================");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
