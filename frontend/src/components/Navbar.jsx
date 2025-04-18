import { useContext, useState } from "react";
import { Context } from "../main";
import { toast } from "react-toastify";
import axios from "axios";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const [show, setShow] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useContext(Context);
    const navigateTo = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.get("http://localhost:5000/api/v1/employee/logout", {
                withCredentials: true,
            });
            toast.success("Logged out Successfully!");
            setIsAuthenticated(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    };

    return (
        <nav className="navbar">
            <div className="navLinks">
                <div className="links">
                    <Link to="/" onClick={() => setShow(false)}>Home</Link>
                    {isAuthenticated && (
                        <Link to="/user/attendance" onClick={() => setShow(false)}>Dashboard</Link>
                    )}
                </div>
                {isAuthenticated ? (
                    <button className="btn logoutBtn" onClick={handleLogout}>LOGOUT</button>
                ) : (
                    <button className="btn loginBtn" onClick={() => navigateTo("/login")}>LOGIN</button>
                )}
            </div>
            <div className="hamburger" onClick={() => setShow(!show)}>
                <GiHamburgerMenu />
            </div>
        </nav>
    );
};

export default Navbar;
