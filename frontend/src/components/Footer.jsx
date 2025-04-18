import React from "react";
import "./Footer.css";
import { FaLinkedin, FaGithub, FaFilePdf } from "react-icons/fa";

const Footer = () => {
    return (
        <footer id="footer">
            <div className="footer-container">
                {/* Left Section */}
                <div className="footer-left">
                    <h2 className="footer-name">Sanya Batra & Yashik Khanna</h2>
                    <p className="footer-summary">Proficient MERN Stack Developers</p>
                </div>

                {/* Center Section */}
                <div className="footer-center">
                    <p className="footer-tagline">Building the Future with MERN Stack</p>
                </div>

                {/* Right Section */}
                <div className="footer-right">
                    <h3>Contact Us</h3>
                    <p><strong>Email:</strong> batrasanya44@gmail.com | yashikkhanna123@gmail.com</p>

                    {/* Resume Links */}
                    <div className="social-icons">
                        <a href="https://drive.google.com/file/d/1t7MdxsjmfpOSkjcBw-7iMCJUKSEpH0tK/view?usp=drivesdk" target="_blank" rel="noopener noreferrer">
                            <FaFilePdf className="icon resume" title="Sanya's Resume" />
                        </a>
                        <a href="https://drive.google.com/file/d/18C5kydbArip8VF4B70RdzukEfONMOQVt/view?usp=drivesdk" target="_blank" rel="noopener noreferrer">
                            <FaFilePdf className="icon resume" title="Yashik's Resume" />
                        </a>
                    </div>

                    {/* Social Icons */}
                    <div className="social-icons">
                        <a href="https://www.linkedin.com/in/sanya-batra-51b974283/" target="_blank" rel="noopener noreferrer">
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
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Sanya Batra & Yashik Khanna. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
