import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

const legalDomains = [
  {
    name: "Criminal Law",
    description: "Legal matters involving criminal offenses and defense.",
  },
  {
    name: "Civil Law",
    description: "Disputes involving individuals, organizations, property, and contracts.",
  },
  {
    name: "Family Law",
    description: "Marriage, divorce, custody, maintenance, and related family matters.",
  },
  {
    name: "Corporate Law",
    description: "Legal matters involving companies, businesses, and corporate transactions.",
  },
  {
    name: "Constitutional Law",
    description: "Matters concerning constitutional rights and government powers.",
  },
  {
    name: "Property Law",
    description: "Disputes and transactions involving land, property, and ownership.",
  },
  {
    name: "Intellectual Property Law",
    description: "Patents, trademarks, copyrights, and other intellectual property matters.",
  },
  {
    name: "Cyber Law",
    description: "Legal matters involving computers, internet, digital transactions, and cybercrime.",
  },
  {
    name: "Tax Law",
    description: "Legal matters involving taxation, tax disputes, and compliance.",
  },
  {
    name: "Labour Law",
    description: "Employment, workplace, wages, and labor-related legal matters.",
  },
];

async function main() {
  for (const domain of legalDomains) {
    await prisma.legalDomain.upsert({
      where: {
        name: domain.name,
      },
      update: {
        description: domain.description,
        isActive: true,
      },
      create: domain,
    });
  }

  console.log(`Seeded ${legalDomains.length} legal domains.`);
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });