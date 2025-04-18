import express from "express";
import multer from "multer";
import {register, login, addNewAdmin,  getUserDetails, logoutAdmin, logoutEmployee, checkIn, checkOut,  adminAttendance, verifyOTP,forgotPassword, resetPassword,userAttendance} from "../controller/userController.js"
import { isAdminAuthenticated,isEmployeeAuthenticated } from "../middlewares/auth.js";
import upload from '../utils/multerConfig.js';


const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.post("/admin/addnew",isAdminAuthenticated,addNewAdmin);
router.get("/admin/me",isAdminAuthenticated,getUserDetails)
router.get("/me",isEmployeeAuthenticated,getUserDetails);
router.get("/admin/logout",isAdminAuthenticated,logoutAdmin)
router.get("/logout",isEmployeeAuthenticated,logoutEmployee)
router.post('/checkin',isEmployeeAuthenticated,checkIn)
router.post('/checkout',isEmployeeAuthenticated,checkOut)
router.get('/attendance',isAdminAuthenticated,adminAttendance)
router.post('/otp-verification',verifyOTP);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.get('/user/attendance', isEmployeeAuthenticated, userAttendance);


export default router;