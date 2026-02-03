import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteApplication,
  fetchJobSeekerApplications,
  clearAllApplicationErrors,
  resetApplicationSlice,
} from "../store/slices/applicationSlice";

import Spinner from "../components/Spinner";

const MyApplications = () => {
  const { loading, error, applications, message } = useSelector(
    (state) => state.applications
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchJobSeekerApplications());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAllApplicationErrors()); 
    }

    if (message) {
      toast.success(message);
      dispatch(resetApplicationSlice()); 
      dispatch(fetchJobSeekerApplications());
    }
  }, [dispatch, error, message]);

  const handleDeleteApplication = (id) => {
    dispatch(deleteApplication(id));
  };

  if (loading) return <Spinner />;

  if (!applications || applications.length === 0) {
    return <h1>You have not applied for any job.</h1>;
  }

  return (
    <div className="account_components">
      <h3>My Applications</h3>

      <div className="applications_container">
        {applications.map((element) => (
          <div className="card" key={element._id}>
            <p>
              <b>Job:</b> {element.jobInfo.jobTitle}
            </p>

            <p>
              <b>Email:</b> {element.jobSeekerInfo.email}
            </p>

            <textarea
              value={element.jobSeekerInfo.coverLetter}
              rows={5}
              disabled
            />

            <div className="btn-wrapper">
              <button
                className="outline_btn"
                onClick={() => handleDeleteApplication(element._id)}
              >
                Delete
              </button>

              {element.jobSeekerInfo?.resume?.url && (
                <a
                  href={element.jobSeekerInfo.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                >
                  View Resume
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;