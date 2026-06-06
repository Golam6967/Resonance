const express = require("express");
const multer = require("multer");
const {
  uploadPaper,
  uploadDiagram,
  deletePaper,
  getPaperById,
  getPapers,
  generateHighlightedPdf,
} = require("../controllers/upload.controllers");

const router = express.Router();

// Multer Storage Configuration (RAM-buffer optimization)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Map routes directly to their controllers
router.post("/paper", upload.single("paper"), uploadPaper);
router.post("/diagram", upload.single("diagram"), uploadDiagram);

router.get("/papers", getPapers); // Maps to: GET /api/v1/papers
router.get("/paper/:id", getPaperById);
router.post("/papers/:id/highlight", generateHighlightedPdf);
router.delete("/paper/:id", deletePaper);
module.exports = router;
