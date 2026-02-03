import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Important for PDFs/documents
        folder: "Job_Seeker_Resumes", // Your folder name
        public_id: `resume_${Date.now()}_${originalname.split('.')[0]}`,
        format: originalname.split('.').pop(), // Get file extension
        access_mode: "public", // Make it publicly accessible
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          console.log("Cloudinary upload success:", result.secure_url);
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const uploadSingleResume = (req, res, next) => {
  const singleUpload = upload.single("resume");

  singleUpload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    } else if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    console.log("=== Multer Middleware ===");
    console.log("File received:", req.file ? req.file.originalname : "No file uploaded");
    console.log("Body received:", req.body);

    // If file exists, upload to Cloudinary
    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );

        // Attach Cloudinary URL to request object
        req.cloudinaryUrl = cloudinaryResult.secure_url;
        req.cloudinaryPublicId = cloudinaryResult.public_id;

        console.log("=== Cloudinary Upload Success ===");
        console.log("URL:", cloudinaryResult.secure_url);
        console.log("Public ID:", cloudinaryResult.public_id);

        next();
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload file to cloud storage",
          error: cloudinaryError.message,
        });
      }
    } else {
      next();
    }
  });
};

export default uploadSingleResume;