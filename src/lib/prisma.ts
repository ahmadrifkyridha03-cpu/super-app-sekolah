import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Function to initialize SQLite WAL Mode performance parameters (SQLite only)
export async function initializeSqlitePragmas() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.startsWith("file:") && !dbUrl.includes(".db")) {
    return; // Safely skip when running on PostgreSQL / Supabase
  }

  try {
    await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
    await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 5000;");
    await prisma.$queryRawUnsafe("PRAGMA synchronous = NORMAL;");
  } catch (err) {
    console.error("Failed to set SQLite PRAGMAs:", err);
  }
}
