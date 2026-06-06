const express = require("express");
const uploadRoutes = require("./routes/upload.routes");
const globalChatRoutes = require("./routes/globalChat.routes");
const cors = require("cors");
BigInt.prototype.toJSON = function () {
  return this.toString();
};
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Allow both local Next.js frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Crucial if you pass session cookies or auth headers later
  }),
);

// Global Middleware
app.use(express.json());

// Main Router API mounting
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", globalChatRoutes);

// Optional: Global Catch-all 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Endpoint not found." });
});

module.exports = app;
