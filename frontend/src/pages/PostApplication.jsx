import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  clearAllApplicationErrors,
  postApplication,
  resetApplicationSlice,
} from "../store/slices/applicationSlice";
import { toast } from "react-toastify";
import { fetchSingleJob } from "../store/slices/jobSlice";
import { IoMdCash } from "react-icons/io";
import { FaToolbox } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

const PostApplication = () => {
  const { singleJob } = useSelector((state) => state.jobs);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { loading, error, message } = useSelector(
    (state) => state.applications
  );

  const { jobId } = useParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  const handlePostApplication = (e) => {
    e.preventDefault();
    
    // ✅ Validation
    if (!coverLetter || coverLetter.trim().length < 50) {
      toast.error("Cover letter must be at least 50 characters");
      return;
    }

    // ✅ Check if resume is provided
    if (!resume) {
      toast.error("Please upload a resume");
      return;
    }

    // ✅ Create FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resume);

    // ✅ Debug logs
    console.log("=== Submitting Application ===");
    console.log("Job ID:", jobId);
    console.log("Resume file:", resume);
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }
    
    // ✅ Dispatch
    dispatch(postApplication(jobId, formData));
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCoverLetter(user.coverLetter || "");
    }
    if (error) {
      toast.error(error);
      dispatch(clearAllApplicationErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(resetApplicationSlice());
      setTimeout(() => {
        navigateTo("/job/me");
      }, 2000);
    }
    dispatch(fetchSingleJob(jobId));
  }, [dispatch, error, message, jobId, user, navigateTo]);

  let qualifications = [];
  let responsibilities = [];
  let offering = [];
  if (singleJob.qualifications) {
    qualifications = singleJob.qualifications.split(". ");
  }
  if (singleJob.responsibilities) {
    responsibilities = singleJob.responsibilities.split(". ");
  }
  if (singleJob.offers) {
    offering = singleJob.offers.split(". ");
  }

  const resumeHandler = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, DOC, and DOCX files are allowed");
        e.target.value = null;
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        e.target.value = null;
        return;
      }
      
      setResume(file);
      console.log("Resume selected:", file.name, file.size, "bytes");
    }
  };

  return (
    <>
      <article className="application_page">
        <form onSubmit={handlePostApplication}>
          <h3>Application Form</h3>
          <div>
            <label>Job Title</label>
            <input type="text" placeholder={singleJob.title} disabled />
          </div>
          <div>
            <label>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Phone Number</label>
            <input
              type="number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          {user && user.role === "Job Seeker" && (
            <>
              <div>
                <label>Coverletter *</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={10}
                  required
                  placeholder="Write at least 50 characters..."
                />
                <span style={{ fontSize: "12px", color: coverLetter.length >= 50 ? "#28a745" : "#666" }}>
                  {coverLetter.length} characters {coverLetter.length >= 50 ? "✓" : `(need ${50 - coverLetter.length} more)`}
                </span>
              </div>
              <div>
                <label>Resume *</label>
                <input 
                  type="file" 
                  onChange={resumeHandler}
                  accept=".pdf,.doc,.docx"
                  required
                />
                {resume && (
                  <p style={{ marginTop: "5px", fontSize: "14px", color: "#28a745" }}>
                    ✓ Resume selected: {resume.name} ({(resume.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </>
          )}

          {isAuthenticated && user.role === "Job Seeker" && (
            <div style={{ alignItems: "flex-end" }}>
              <button
                className="btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Apply"}
              </button>
            </div>
          )}
        </form>

        <div className="job-details">
          <header>
            <h3>{singleJob.title}</h3>
            {singleJob.personalWebsite && (
              <Link target="_blank" to={singleJob.personalWebsite.url}>
                {singleJob.personalWebsite.title}
              </Link>
            )}
            <p>{singleJob.location}</p>
            <p>Rs. {singleJob.salary} a month</p>
          </header>
          <hr />
          <section>
            <div className="wrapper">
              <h3>Job details</h3>
              <div>
                <IoMdCash />
                <div>
                  <span>Pay</span>
                  <span>{singleJob.salary} a month</span>
                </div>
              </div>
              <div>
                <FaToolbox />
                <div>
                  <span>Job type</span>
                  <span>{singleJob.jobType}</span>
                </div>
              </div>
            </div>
            <hr />
            <div className="wrapper">
              <h3>Location</h3>
              <div className="location-wrapper">
                <FaLocationDot />
                <span>{singleJob.location}</span>
              </div>
            </div>
            <hr />
            <div className="wrapper">
              <h3>Full Job Description</h3>
              <p>{singleJob.introduction}</p>
              {singleJob.qualifications && (
                <div>
                  <h4>Qualifications</h4>
                  <ul>
                    {qualifications.map((element, index) => {
                      return (
                        <li key={index} style={{ listStyle: "inside" }}>
                          {element}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {singleJob.responsibilities && (
                <div>
                  <h4>Responsibilities</h4>
                  <ul>
                    {responsibilities.map((element, index) => {
                      return (
                        <li key={index} style={{ listStyle: "inside" }}>
                          {element}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {singleJob.offers && (
                <div>
                  <h4>Offering</h4>
                  <ul>
                    {offering.map((element, index) => {
                      return (
                        <li key={index} style={{ listStyle: "inside" }}>
                          {element}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>
          <hr />
          <footer>
            <h3>Job Niche</h3>
            <p>{singleJob.jobNiche}</p>
          </footer>
        </div>
      </article>
    </>
  );
};

export default PostApplication;