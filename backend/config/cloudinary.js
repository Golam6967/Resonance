const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} fileBuffer - Raw file data from multer
 * @param {String} folder - Cloudinary target folder name
 * @param {String} resourceType - 'raw' for documents, 'image' for viewable PDFs/diagrams
 */
const uploadToCloudinary = (fileBuffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    // 1. Build the baseline configuration options block
    const options = {
      folder: folder,
      resource_type: resourceType,
    };

    // 2. 🔴 THE KEY FIX: If we force 'image' type for a PDF to prevent auto-downloading,
    // we must explicitly mandate the PDF format, otherwise Cloudinary defaults to image extensions.
    if (resourceType === "image") {
      options.format = "pdf";
      options.flags = "attachment:false"; // Double insurance to block automatic downloads
    }

    // 3. Initialize the streaming hook pipeline
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error("💥 Cloudinary Stream Error:", error);
          return reject(error);
        }
        resolve(result);
      },
    );

    // Write the file buffer to the upload stream
    uploadStream.end(fileBuffer);
  });
};

module.exports = { cloudinary, uploadToCloudinary };
