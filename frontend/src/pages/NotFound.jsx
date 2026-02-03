import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="notfound">
      <div className="content">
        <h1>Successfully posted</h1>
        <p>The job has been successfully posted.</p>
        <Link to={"/"} className="btn">
          Back to home page
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
