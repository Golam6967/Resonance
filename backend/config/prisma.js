const { PrismaClient } = require("@prisma/client");

// Bind a reference to the global object to survive across code reloads
const globalForPrisma = global;

/**
 * Ensures only a single instance of PrismaClient is managed globally.
 * If the environment is production, it spawns normally.
 * If developing locally, it pins to the global context to block connection leaks.
 */
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
