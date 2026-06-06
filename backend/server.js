require("dotenv").config();
const app = require("./app");
const prisma = require("./config/prisma"); // Import our Singleton Client

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 App service safely operating on network port ${PORT}`);
});

/**
 * Explicit Clean-up Interceptors
 * Guarantees that active connection pools are destroyed before shutting down.
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ Received ${signal}. Shutting down connection layers...`);
  try {
    await prisma.$disconnect();
    console.log("🔌 Prisma engine connection pools closed successfully.");
    server.close(() => {
      console.log("👋 Express network service terminated. Bye!");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error during database connection termination:", error);
    process.exit(1);
  }
};

// Listen for termination signals from terminal operations
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (err) => {
  console.error(`💥 Unhandled Server Exception: ${err.message}`);
  server.close(() => process.exit(1));
});
