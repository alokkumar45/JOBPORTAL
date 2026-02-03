import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.params;
  const { name, email, phone, address, coverLetter } = req.body || {};

  
  if (!req.user) {
    return next(new ErrorHandler("Login required to apply for job", 401));
  }

  
  if (!name || !email || !phone || !address || !coverLetter) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  // Check for file using express-fileupload
  const resumeFile = req.files?.resume;
  
  if (!resumeFile) {
    console.error("❌ Resume file not found in request");
    console.error("req.files:", req.files);
    return next(new ErrorHandler("Resume is required", 400));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found", 404));
  }

 
  const jobObj = jobDetails.toObject();
  const employerId = jobObj.postedBy || jobObj.PostedBy;

  if (!employerId) {
    return next(new ErrorHandler("This job has no employer assigned. Please contact support.", 400));
  }

  const alreadyApplied = await Application.findOne({
    "jobSeekerInfo.id": req.user._id,
    "jobInfo.jobId": jobId,
  });

  if (alreadyApplied) {
    return next(
      new ErrorHandler("You have already applied for this job", 400)
    );
  }

  let resumeData;
  let tempPath = null;
  
  try {
    // ✅ BEST FIX: Use express-fileupload's mv() to save temp file, then upload to Cloudinary
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file temporarily
    tempPath = path.join(uploadsDir, `temp_${Date.now()}_${resumeFile.name}`);
    await resumeFile.mv(tempPath);

    console.log("📁 Temp file saved:", tempPath);

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(tempPath, {
      folder: "Job_Seeker_Resumes",
      resource_type: "raw",
      public_id: `resume_${Date.now()}_${req.user._id}`,
    });

    resumeData = {
      public_id: uploadRes.public_id,
      url: uploadRes.secure_url,
    };

    console.log("✅ Resume uploaded successfully:", uploadRes.secure_url);

    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
      console.log("🗑️ Temp file deleted");
    }

  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    
    // Clean up temp file on error
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
        console.log("🗑️ Temp file deleted after error");
      } catch (cleanupError) {
        console.error("Failed to delete temp file:", cleanupError);
      }
    }
    
    return next(
      new ErrorHandler(`Failed to upload resume: ${error.message}`, 500)
    );
  }
  
  const jobSeekerInfo = {
    id: req.user._id,
    name,
    email,
    phone,
    address,
    coverLetter,
    resume: resumeData,
    role: "jobSeeker",
  };


  const employerInfo = {
    id: employerId,
    role: "Employer",
  };

  // Prepare job info
  const jobInfo = {
    jobId,
    jobTitle: jobDetails.title,
  };

  // Create application
  const application = await Application.create({
    jobSeekerInfo,
    employerInfo,
    jobInfo,
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    application,
  });
});

/**
 * =====================================
 * EMPLOYER - GET ALL APPLICATIONS
 * =====================================
 */
export const employerAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;

    const applications = await Application.find({
      "employerInfo.id": _id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  }
);

/**
 * =====================================
 * JOB SEEKER - GET ALL APPLICATIONS
 * =====================================
 */
export const jobSeekerAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;

    const applications = await Application.find({
      "jobSeekerInfo.id": _id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  }
);

/**
 * =====================================
 * DELETE APPLICATION
 * =====================================
 */
export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const application = await Application.findById(id);

  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }

  // Verify user has permission to delete (either the applicant or employer)
  const isJobSeeker =
    req.user._id.toString() === application.jobSeekerInfo.id.toString();
  const isEmployer =
    req.user._id.toString() === application.employerInfo.id.toString();

  if (!isJobSeeker && !isEmployer) {
    return next(
      new ErrorHandler("You are not authorized to delete this application", 403)
    );
  }


  if (application.jobSeekerInfo.resume?.public_id) {
    try {
      await cloudinary.uploader.destroy(
        application.jobSeekerInfo.resume.public_id,
        { resource_type: "raw" } 
      );
      console.log("✅ Resume deleted from Cloudinary");
    } catch (error) {
      console.error("Failed to delete resume from Cloudinary:", error);
      
    }
  }

  await application.deleteOne();

  res.status(200).json({
    success: true,
    message: "Application deleted successfully",
  });
});