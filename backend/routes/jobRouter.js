import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  postJob,
  getAllJobs,
  getMyJobs,
  deleteJob,
  getASingleJob,
} from "../controllers/jobController.js";

const router = express.Router();

// Public routes
router.get("/getall", getAllJobs);
router.get("/get/:id", getASingleJob);

// Protected routes - Employer only
router.post("/post", isAuthenticated, isAuthorized("Employer"), postJob);
router.get("/getmyjobs", isAuthenticated, isAuthorized("Employer"), getMyJobs);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Employer"), deleteJob);

export default router;