import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaSquareXTwitter,
  FaSquareInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa6";
import logo from "../assets/jobportal1.png"; 

const Footer = () => {
  const { isAuthenticated } = useSelector((state) => state.user);
  return (
    <>
      <footer>
        <div>
          <img className="footerlogo" src={logo} alt="logo" />
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li>sector 63 Noida, India</li>
            <li>JobPortal@gmail.com</li>
            <li>+91 6393592441</li>
          </ul>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li to={"/"}>
              <Link>Home</Link>
            </li>
            <li to={"/jobs"}>
              <Link>Jobs</Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to={"/dashboard"}>
                Dashboard</Link>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h4>Follow Us</h4>
          <ul>
            <li>
              <Link to={"https://x.com/kumar_alok26067"}>
                <span>
                  <FaSquareXTwitter />
                </span>
                <span>Twitter (X)</span>
              </Link>
            </li>
            <li>
              <Link to={"https://www.instagram.com/18__ak_/"}>
                <span>
                  <FaSquareInstagram />
                </span>
                <span>Instagram</span>
              </Link>
            </li>
            <li>
              <Link to={"https://github.com/alokkumar45"}>
                <span>
                  <FaYoutube />
                </span>
                <span>Github</span>
              </Link>
            </li>
            <li>
              <Link to={"https://www.linkedin.com/in/alok-kumar-63054b2b3/"}>
                <span>
                  <FaLinkedin />
                </span>
                <span>LinkedIn</span>
              </Link>
            </li>
          </ul>
        </div>
      </footer>
      <div className="copyright" style={{ color: "white" }}>
        &copy; CopyRight 2025. All Rights Reserved By Alok Kumar_18
      </div>
    </>
  );
};

export default Footer;
