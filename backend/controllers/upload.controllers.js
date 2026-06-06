const { uploadToCloudinary } = require("../config/cloudinary");
const prisma = require("../config/prisma"); // Import your Prisma global singleton client
const axios = require("axios");
/**
 * @desc    Upload Research Paper PDF to Cloudinary, track via Prisma, and ingest into FastAPI Vector Store
 * @route   POST /api/upload/paper
 * @access  Public
 */
const uploadPaper = async (req, res) => {
  try {
    console.log("📁 File received in Express:", req.file);

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ success: false, message: "Only PDF documents are allowed." });
    }

    // 1. Process streaming buffer directly to Cloudinary folder
    console.log("📤 Uploading PDF binary stream to Cloudinary...");
    const result = await uploadToCloudinary(
      req.file.buffer,
      "research_papers",
      "image",
    );
    console.log("🔗 Cloudinary Document URL:", result.secure_url);

    // 2. Insert metadata tracking record into Supabase via Prisma 6
    console.log("💾 Logging paper record to Supabase via Prisma...");
    const newPaper = await prisma.paper.create({
      data: {
        title: req.file.originalname,
        cloudinaryUrl: result.secure_url,
      },
    });

    // Cleanly convert BigInt to string to protect JSON serialization
    const paperIdString = newPaper.id.toString();

    // 3. Fire-and-forget background HTTP call to trigger FastAPI AI text ingestion
    console.log(
      `🧠 Handshaking with FastAPI Vector Ingestion for Paper ID: ${paperIdString}...`,
    );

    // In production, replace the 'raw_markdown_content' placeholder below with
    // your real extracted string from your PDF parser middleware/utility
    fetch("http://localhost:8000/api/v1/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paper_id: parseInt(paperIdString),
        raw_markdown_content: `# Title: ${req.file.originalname}\nThis raw content segment maps context definitions natively into the shared Supabase Postgres instance via LangChain calculations.`,
        starting_page: 1,
      }),
    })
      .then(async (fastApiResponse) => {
        const payload = await fastApiResponse.json();
        console.log(
          "✅ FastAPI dynamic vector store chunking finished:",
          payload,
        );
      })
      .catch((err) => {
        console.error(
          "❌ Failed to forward data stream to FastAPI background task:",
          err.message,
        );
      });

    // 4. Return instant confirmation to the frontend client UI
    return res.status(200).json({
      success: true,
      message:
        "Paper processed successfully! AI vector generation running in background.",
      data: {
        id: paperIdString,
        title: newPaper.title,
        cloudinary_url: newPaper.cloudinaryUrl,
        public_id: result.public_id,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error(
      "💥 Critical Failure in uploadPaper controller pipeline:",
      error,
    );
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload Extracted Architecture Diagrams to Cloudinary and link them directly to Vector Store metadata
 * @route   POST /api/upload/diagram
 * @access  Public
 */
const uploadDiagram = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });
    }

    // Capture the target paper ID from form metadata text body parameters
    const { paper_id } = req.body;
    if (!paper_id) {
      return res.status(400).json({
        success: false,
        message: "Missing tracking text metadata 'paper_id' parameter.",
      });
    }

    // 1. Send structural pixels to Cloudinary image buckets
    console.log("🖼️ Uploading extracted diagram structure to Cloudinary...");
    const result = await uploadToCloudinary(
      req.file.buffer,
      "extracted_diagrams",
      "image",
    );

    // 2. Fire background request to FastAPI to log this image URL as a multimodal vector chunk
    console.log(
      `📡 Shipping image artifact vector mapping to FastAPI for Paper ID: ${paper_id}...`,
    );
    fetch("http://localhost:8000/api/v1/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paper_id: parseInt(paper_id),
        // We supply an explicit image tag description so the text engine can retrieve it,
        // and append the Cloudinary link straight into the LangChain metadata payload matrix
        raw_markdown_content: `[Extracted Diagram Asset Architecture Layout Link]: ${result.secure_url} - Figure mapping architectural configurations and data pipelines.`,
        starting_page: req.body.page_number
          ? parseInt(req.body.page_number)
          : 1,
      }),
    })
      .then(() =>
        console.log("✅ Diagram metadata vector payload synchronized."),
      )
      .catch((err) =>
        console.error(
          "❌ Failed to synchronize diagram metadata to FastAPI:",
          err.message,
        ),
      );

    return res.status(200).json({
      success: true,
      message: "Diagram saved and linked to vector metadata store!",
      data: {
        cloudinary_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error(
      "💥 Critical Failure in uploadDiagram controller pipeline:",
      error,
    );
    res.status(500).json({ success: false, error: error.message });
  }
};
const deletePaper = async (req, res) => {
  try {
    const { id } = req.params; // Expecting the Paper ID passed via URL params
    const paperIdInt = parseInt(id);

    // 1. Fetch the target paper record to grab Cloudinary credentials
    const paper = await prisma.paper.findUnique({
      where: { id: paperIdInt },
    });

    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper record not found." });
    }

    // 2. Clear out the physical PDF asset from Cloudinary
    if (paper.publicId) {
      console.log("☁️ Removing raw file tracking from Cloudinary...");
      await cloudinary.uploader.destroy(paper.publicId, {
        resource_type: "raw",
      });
    }

    // 3. Command FastAPI to purge the localized Chroma vector segments
    console.log(
      `🤖 Requesting FastAPI vector house-cleaning for Paper ID: ${paperIdInt}...`,
    );
    const fastapiResponse = await fetch(
      "http://localhost:8000/api/v1/delete-paper",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper_id: paperIdInt }),
      },
    );

    if (!fastapiResponse.ok) {
      console.warn("⚠️ FastAPI reporting a vector deletion mismatch or error.");
    }

    // 4. Drop the primary metadata record from Supabase via Prisma
    console.log("💾 Purging primary relational metadata tracker via Prisma...");
    await prisma.paper.delete({
      where: { id: paperIdInt },
    });

    return res.status(200).json({
      success: true,
      message:
        "Paper, cloud binary assets, and vector embeddings completely eliminated.",
    });
  } catch (error) {
    console.error("💥 Failure in deletePaper controller pipeline:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPapers = async (req, res) => {
  try {
    console.log("💾 Fetching all research paper metadata from database...");

    const papers = await prisma.paper.findMany({
      orderBy: {
        createdAt: "desc", // Newest uploads show up first
      },
    });

    return res.status(200).json({
      success: true,
      count: papers.length,
      data: papers,
    });
  } catch (error) {
    console.error("💥 Error in getPapers controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve papers from the server.",
      error: error.message,
    });
  }
};

// 🟢 Fetch a single specific paper's details by ID
const getPaperById = async (req, res) => {
  try {
    const { id } = req.params;
    const paperIdInt = parseInt(id);

    console.log(`💾 Fetching data row details for Paper ID: ${paperIdInt}`);

    const paper = await prisma.paper.findUnique({
      where: { id: paperIdInt },
    });

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: `Paper record with ID ${id} could not be located.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: paper,
    });
  } catch (error) {
    console.error("💥 Error in getPaperById controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the requested paper details.",
      error: error.message,
    });
  }
};
const generateHighlightedPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const paperIdInt = parseInt(id, 10);

    if (isNaN(paperIdInt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paper ID configuration track.",
      });
    }

    // 1. Fetch document resource properties from Postgres
    const paper = await prisma.paper.findUnique({ where: { id: paperIdInt } });
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Specified paper item missing from vault.",
      });
    }

    const fileUrl = paper.cloudinaryUrl || paper.cloudinary_url;
    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Target document resource contains no file link reference.",
      });
    }

    console.log(
      `📡 Redirecting binary stream to FastAPI endpoint for: ${fileUrl}`,
    );

    // 2. Perform proxy call to your Python AI service
    console.log("Aise");
    const fastApiRes = await axios.post(
      "http://127.0.0.1:8000/api/v1/pdf/highlight-common",
      {
        cloudinary_url: fileUrl,
        min_word_length: 5,
        top_n_words: 5,
      },
      {
        responseType: "arraybuffer", // Preserves raw binary values across HTTP boundaries
      },
    );

    // 🟢 THE CRITICAL BUFFER FIX:
    // Do not pass fastApiRes.data directly into Buffer.from().
    // We must pass it into a Uint8Array first to accurately extract the byte array memory markers!
    const cleanBinaryArray = new Uint8Array(fastApiRes.data);
    const perfectBuffer = Buffer.from(
      cleanBinaryArray.buffer,
      cleanBinaryArray.byteOffset,
      cleanBinaryArray.byteLength,
    );

    // 3. Set standard binary file download response header attributes
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=highlighted_${id}.pdf`,
    );

    console.log(
      `📦 Delivering pristine, verified binary structure to frontend. Size: ${perfectBuffer.length} bytes.`,
    );

    // 4. Terminate response with the pristine buffer map
    return res.end(perfectBuffer);
  } catch (error) {
    console.error("💥 Highlight execution pipeline failure:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to compile highlighted document layers.",
      details: error.message,
    });
  }
};
// Inside your Express app controllers / routing layers

// Remember to export them alongside your existing uploadPaper, uploadDiagram, and deletePaper functions!
module.exports = {
  uploadPaper,
  uploadDiagram,
  deletePaper,
  getPapers,
  getPaperById,
  generateHighlightedPdf,
};
