import { useContext, useState } from "react"
import { Context } from "../main"
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import './Login.css';



const Login = () => {
  const {isAuthenticated,setIsAuthenticated}= useContext(Context)

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("")

  const navigateTo= useNavigate();

  const handleLogin = async (e) =>{
    e.preventDefault();
    try{
      const response = await axios.post(
        "http://localhost:5000/api/v1/employee/login",{
          email, password, role:"Employee"
        },{
          withCredentials: true,
          headers:{ "Content-Type": "application/json"}
        }
      )
      toast.success("LoggedIn successfully");
      setIsAuthenticated(true);
      navigateTo("/")
    }catch(e){
      toast.error(e.response.data.message)
    }
  }

  if(isAuthenticated){
    return <Navigate to={"/"}></Navigate>
  }
  return (
   <div className="conatiner form-component login-form">
    <h2>Login</h2>
    <form onSubmit={handleLogin}>
  <input 
    type="text" 
    value={email} 
    onChange={(e) => setEmail(e.target.value)} 
    placeholder="Email"
  />
  <input 
    type="password" 
    value={password} 
    onChange={(e) => setPassword(e.target.value)} 
    placeholder="Password"
  />
   <p className="forgot-password">
          <Link to={"/password/forgot"}>Forgot your password?</Link>
        </p>
  <div className="register-section">
    <p>Not Registered?</p>
    <Link to="/register">Register Now</Link>
  </div>
  <div>
    <button type="submit">Login</button>
  </div>
</form>
   </div>
  )
}

export default Login