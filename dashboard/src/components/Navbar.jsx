import { useContext, useState } from "react";
import { Context } from "../main";
import { toast } from "react-toastify";
import axios from "axios";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    await axios
      .get("http://localhost:5000/api/v1/employee/admin/logout", {
        withCredentials: true,
      })
      .then(() => {
        toast.success("Logged out Successfully!");
        setIsAuthenticated(false);
        navigateTo("/"); // Redirect to home/login on logout
      })
      .catch((e) => {
        toast.error(e.response.data.message);
      });
  };

  const goToLogin = () => {
    navigateTo("/");
  };

  return (
    <nav className="container">
      <div className={show ? "navLinks showmenu" : "navLinks"}>
        <div className="links">
          <Link to="/" onClick={() => setShow(!show)}>Home</Link>
          {isAuthenticated && (
            <Link to="/attendance" onClick={() => setShow(!show)}>Attendance</Link>
          )}
        </div>
        {isAuthenticated ? (
          <button className="logoutBtn btn" onClick={handleLogout}>
            LOGOUT
          </button>
        ) : (
          <button className="loginBtn btn" onClick={goToLogin}>
            LOGIN
          </button>
        )}
      </div>
      <div className="hamburger" onClick={() => setShow(!show)}>
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default Navbar;