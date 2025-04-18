import React from "react";
import "./Footer.css";
import { FaLinkedin, FaGithub } from "react-icons/fa"; // Importing icons

const Footer = () => {
  return (
    <footer id="footer">
      <div className="footer-container">
        
        <h2 className="footer-name">Sanya Batra & Yashik Khanna</h2>
        <p className="footer-tagline">MERN STACK DEVELOPERS</p>
        
        <div className="social-icons">
          <a href="https://www.linkedin.com/in/sanya-batra-51b974283/?originalSubdomain=in" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="icon linkedin" />
          </a>
          <a href="https://www.linkedin.com/in/yashik-khanna-453448216/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="icon linkedin" />
          </a>
          <a href="https://github.com/yashikkhanna" target="_blank" rel="noopener noreferrer">
            <FaGithub className="icon github" />
          </a>
           <a href="https://github.com/sanyabatraaa" target="_blank" rel="noopener noreferrer">
            <FaGithub className="icon github" />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SANYA BATRA & YASHIK KHANNA. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
