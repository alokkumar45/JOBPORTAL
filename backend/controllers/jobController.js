import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { Job } from "../models/jobSchema.js";

/**
 * =====================================
 * POST JOB (Create New Job)
 * =====================================
 */
export const postJob = catchAsyncErrors(async (req, res, next) => {
    const {
        title,
        jobType,
        location,
        companyName,
        introduction,
        responsibilities,
        qualifications,
        offers,
        salary,
        hiringMultipleCandidates,
        personalWebsite,
        jobNiche,
    } = req.body;

    // ✅ Check if user is authenticated
    if (!req.user) {
        return next(new ErrorHandler('Authentication required', 401));
    }

    // ✅ Check if user is an employer
    if (req.user.role !== 'Employer') {
        return next(new ErrorHandler('Only employers can post jobs', 403));
    }

    // ✅ Validate required fields
    if (!title || !jobType || !location || !companyName || !introduction || 
        !responsibilities || !qualifications || !salary || !jobNiche) {
        return next(new ErrorHandler('Please fill all required fields', 400));
    }

    // ✅ Create the job
    const job = await Job.create({
        title,
        jobType,
        location,
        companyName,
        introduction,
        responsibilities,
        qualifications,
        offers,
        salary,
        hiringMultipleCandidates,
        personalWebsite,
        jobNiche,
        postedBy: req.user._id,  // ✅ CRITICAL - Sets the employer ID
    });

    res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        job,
    });
});

/**
 * =====================================
 * GET ALL JOBS (With Filters)
 * =====================================
 */
export const getAllJobs = catchAsyncErrors(async (req, res, next) => { 
    const { city, niche, searchKeyword } = req.query;
    const query = {};

    // ✅ Filter by city/location
    if (city) {
        query.location = { $regex: city, $options: "i" }; // Case-insensitive search
    }

    // ✅ Filter by job niche
    if (niche) {
        query.jobNiche = niche;
    }

    // ✅ Search by keyword in title, company, or introduction
    if (searchKeyword) {
        query.$or = [
            { title: { $regex: searchKeyword, $options: "i" } },
            { companyName: { $regex: searchKeyword, $options: "i" } },
            { introduction: { $regex: searchKeyword, $options: "i" } }
        ];
    }

    // ✅ Find jobs and populate employer details
    const jobs = await Job.find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate('postedBy', 'name email companyName'); // Populate employer info

    res.status(200).json({
        success: true,
        jobs,
        count: jobs.length,
    });
});

/**
 * =====================================
 * GET MY JOBS (Jobs posted by logged-in employer)
 * =====================================
 */
export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
    // ✅ Check if user is authenticated
    if (!req.user) {
        return next(new ErrorHandler('Authentication required', 401));
    }

    // ✅ Check if user is an employer
    if (req.user.role !== 'Employer') {
        return next(new ErrorHandler('Only employers can view their jobs', 403));
    }

    // ✅ Find all jobs posted by this employer
    const myJobs = await Job.find({ postedBy: req.user._id })
        .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
        success: true,
        myJobs,
        count: myJobs.length,
    });
});

/**
 * =====================================
 * DELETE JOB
 * =====================================
 */
export const deleteJob = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // ✅ Check if user is authenticated
    if (!req.user) {
        return next(new ErrorHandler('Authentication required', 401));
    }

    // ✅ Find the job
    const job = await Job.findById(id);
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // ✅ Check if the logged-in user is the one who posted this job
    if (job.postedBy.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to delete this job", 403));
    }

    // ✅ Delete the job
    await job.deleteOne();

    res.status(200).json({
        success: true,
        message: "Job deleted successfully",
    });
});

/**
 * =====================================
 * GET A SINGLE JOB (Job Details)
 * =====================================
 */
export const getASingleJob = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    // ✅ Find job and populate employer details
    const job = await Job.findById(id)
        .populate('postedBy', 'name email phone companyName'); // Get employer info

    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    res.status(200).json({
        success: true,
        job,
    });
});

/**
 * =====================================
 * UPDATE JOB (Optional - if you want to add this feature)
 * =====================================
 */
export const updateJob = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    // ✅ Check if user is authenticated
    if (!req.user) {
        return next(new ErrorHandler('Authentication required', 401));
    }

    // ✅ Find the job
    let job = await Job.findById(id);
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // ✅ Check if the logged-in user is the one who posted this job
    if (job.postedBy.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to update this job", 403));
    }

    // ✅ Update the job
    job = await Job.findByIdAndUpdate(id, updateData, {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
    });

    res.status(200).json({
        success: true,
        message: "Job updated successfully",
        job,
    });
});