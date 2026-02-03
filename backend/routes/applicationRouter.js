import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  postApplication,
  employerAllApplications,
  jobSeekerAllApplications,
  deleteApplication,
} from "../controllers/applicationController.js";
// ✅ REMOVE THIS LINE - Don't import Multer
// import uploadSingleResume from "../middlewares/multerUpload.js";

const router = express.Router();

/**
 * POST APPLICATION
 * Route: POST /api/v1/application/post/:jobId
 * Access: Authenticated Job Seekers
 * ✅ REMOVED uploadSingleResume middleware - using express-fileupload from app.js
 */
router.post(
  "/post/:jobId",
  isAuthenticated,
  postApplication
);

/**
 * EMPLOYER - GET ALL APPLICATIONS
 * Route: GET /api/v1/application/employer/getall
 * Access: Authenticated Employers only
 */
router.get(
  "/employer/getall",
  isAuthenticated,
  isAuthorized("Employer"),
  employerAllApplications
);

/**
 * JOB SEEKER - GET ALL APPLICATIONS
 * Route: GET /api/v1/application/jobseeker/getall
 * Access: Authenticated Job Seekers only
 */
router.get(
  "/jobseeker/getall",
  isAuthenticated,
  isAuthorized("Job Seeker"),
  jobSeekerAllApplications
);

/**
 * DELETE APPLICATION
 * Route: DELETE /api/v1/application/delete/:id
 * Access: Authenticated users (Job Seeker can delete their own application)
 */
router.delete(
  "/delete/:id",
  isAuthenticated,
  deleteApplication
);

export default router;