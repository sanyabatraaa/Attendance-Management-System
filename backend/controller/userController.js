import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
// import multer from "multer";
import crypto from "crypto";
import moment from "moment";
import sendEmail from "../utils/sendEmail.js";



export const checkIn = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("Check-In Request Received:", req.body);
        const userId = req.user.id;
        const currentDate = new Date().toISOString().split('T')[0];
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            console.error("Location data missing");
            return next(new ErrorHandler("Location data required for check-in", 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found for check-in");
            return next(new ErrorHandler("User not found", 404));
        }
        let checkInImage = null;
        if (req.file) {
          console.log("Uploading image to Cloudinary...");
          checkInImage = await cloudinary.v2.uploader.upload(req.file.path);
          console.log("Cloudinary Response:", checkInImage);
      } else if (req.body.image) {
          console.log("Uploading Base64 image to Cloudinary...");
          checkInImage = await cloudinary.v2.uploader.upload(req.body.image, {
              folder: "attendance_images",
          });
          console.log("Cloudinary Base64 Response:", checkInImage);
      } else {
          console.error("No image received for check-out.");
      }
        const currentUTC = new Date();
        const istOffset = 5 * 60 + 30; // Total minutes for IST offset
        const istTime = new Date(currentUTC.getTime() + istOffset * 60 * 1000);

        const formattedIST = istTime.toISOString();
        user.attendence.push({ checkIn: formattedIST, checkInLocation: { latitude, longitude },checkInImage:checkInImage? checkInImage.secure_url:null });
        await user.save();

        console.log("Check-In Successful:", formattedIST, { latitude, longitude });
        res.status(200).json({ success: true, message: "Check-in recorded", data: { checkIn: formattedIST, location: { latitude, longitude } ,checkInImage:checkInImage? checkInImage.secure_url:null} });
    } catch (error) {
        console.error("Check-In Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

export const checkOut = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("Check-Out Request Received:", req.body);
        const userId = req.user.id;
        const currentUTC = new Date();
        const istOffset = 5 * 60 + 30; // Total minutes for IST offset
        const istTime = new Date(currentUTC.getTime() + istOffset * 60 * 1000);
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            console.error("Location data missing for check-out");
            return next(new ErrorHandler("Location data required for check-out", 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found for check-out");
            return next(new ErrorHandler("User not found", 404));
        }

        const formattedIST = istTime.toISOString();
        let checkOutImage = null;
        if (req.file) {
            console.log("Uploading image to Cloudinary...");
            checkOutImage = await cloudinary.v2.uploader.upload(req.file.path);
            console.log("Cloudinary Response:", checkOutImage);
        } else if (req.body.image) {
            console.log("Uploading Base64 image to Cloudinary...");
            checkOutImage = await cloudinary.v2.uploader.upload(req.body.image, {
                folder: "attendance_images",
            });
            console.log("Cloudinary Base64 Response:", checkOutImage);
        } else {
            console.error("No image received for check-out.");
        }
        const lastAttendance = user.attendence.slice().reverse().find(att => !att.checkOut);
        if (!lastAttendance) {
            console.error("No active check-in found for check-out");
            return next(new ErrorHandler("No active check-in found to check out", 400));
        }

        lastAttendance.checkOut = formattedIST;
        lastAttendance.checkOutImage = checkOutImage ? checkOutImage.secure_url : null;
        lastAttendance.checkOutLocation = { latitude, longitude };
        await user.save();

        console.log("Check-Out Successful:", formattedIST, { latitude, longitude });
        res.status(200).json({ success: true, message: "Check-out recorded", checkOut: formattedIST, location: { latitude, longitude },checkOutImage: checkOutImage ? checkOutImage.secure_url : null,});
    } catch (error) {
        console.error("Check-Out Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

export const register = catchAsyncErrors(async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, password, gender, role, verificationMethod } = req.body;

        // ✅ Corrected field validation
        if (!firstName || !lastName || !email || !phone || !password || !gender || !role || !verificationMethod) {
            return next(new ErrorHandler("All fields are required.", 400));
        }

        // function validatePhoneNumber(phone) {
        //     const phoneRegex = /^\+91\d{10}$/;
        //     return phoneRegex.test(phone);
        // }

        // if (!validatePhoneNumber(phone)) {
        //     return next(new ErrorHandler("Invalid phone number.", 400));
        // }

        const existingUser = await User.findOne({
            $or: [
                { email, accountVerified: true },
                { phone, accountVerified: true },
            ],
        });

        if (existingUser) {
            return next(new ErrorHandler("Phone or Email is already used.", 400));
        }

        const registrationAttemptsByUser = await User.find({
            $or: [
                { phone, accountVerified: false },
                { email, accountVerified: false },
            ],
        });

        if (registrationAttemptsByUser.length > 3) {
            return next(new ErrorHandler("You have exceeded the maximum attempts (3). Please try again after 1 hour.", 400));
        }

        const userData = {
            firstName,
            lastName,
            email,
            phone,
            password,
            gender,
            role
        };

        const user = await User.create(userData);
        const verificationCode = await user.generateVerificationCode();
        await user.save();

        // ✅ Await sendVerificationCode
        await sendVerificationCode(verificationMethod, verificationCode, firstName, email, phone);

        // ✅ Generate JWT Token after verification is sent
        generateToken(user, "User Registered! Verification email sent.", 200, res);

    } catch (error) {
        next(error);
    }
});

// ✅ Fixed sendVerificationCode function
async function sendVerificationCode(verificationMethod, verificationCode, firstName, email, phone) {
    try {
        if (verificationMethod === "email") {
            const message = generateEmailTemplate(verificationCode);
            await sendEmail({ email, subject: "Your Verification Code", message });

            console.log(`Verification email sent to ${firstName}`);
        } else {
            throw new ErrorHandler("Invalid verification method.", 400);
        }
    } catch (error) {
        console.error("Error sending verification code:", error);
        throw new ErrorHandler("Verification code failed to send.", 500);
    }
}

// ✅ Improved generateEmailTemplate function
function generateEmailTemplate(verificationCode) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
        <p style="font-size: 16px; color: #333;">Dear User,</p>
        <p style="font-size: 16px; color: #333;">Your verification code is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
            ${verificationCode}
          </span>
        </div>
        <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 10 minutes.</p>
        <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
        <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
          <p>Thank you,<br>Your Company Team</p>
          <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
        </footer>
      </div>
    `;
}
export const verifyOTP=catchAsyncErrors(async(req,res,next)=>{
    const{email,otp}=req.body;
    try {
        const userAllEntries=await User.find({
            $or:[
                {
                    email,
                    accountVerified:false,
                },
            ],
        }).sort({createdAt:-1});
        if(!userAllEntries){
            return next(new ErrorHandler("User not found.",404));
        }
        let user;
        if(userAllEntries.length>1){
            user=userAllEntries[0];
            await User.deleteMany({
                _id:{$ne:user._id},
                $or:[
                    {email,accountVerified:false},
                ],
            });
        }else{
            user=userAllEntries[0];
        }
        if(user.verificationCode!==Number(otp)){
           return next(new ErrorHandler("Invalid otp.",400));
        }
        const currentTime=Date.now();
        const verificationCodeExpire=new Date(user.verificationCodeExpire).getTime();
        if(currentTime>verificationCodeExpire){
            return next(new ErrorHandler("OTP Expired.",400));
        }
        user.accountVerified=true;
        user.verificationCode=null;
        user.verificationCodeExpire=null;
        await user.save({validateModifiedOnly:true});
        generateToken(user,"Account Verified",200,res);
    } catch (error) {
        return next(new ErrorHandler("Internal Server Error occured",500));
    }
})
export const login = catchAsyncErrors(async (req,res,next)=>{
    console.log(req.body);
    const {email, password, role}=req.body;
    if(!email || !password || !role ){
        return next(new ErrorHandler("Please Fill All the Details!",400));
    }

   
    const user= await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password",400));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password",400));
    }

    if(role !== user.role){
        return next(new ErrorHandler("User With This Role Not Found",400));
    }

    generateToken(user,"User LoggedIn successfully",200,res);

});

export const addNewAdmin =catchAsyncErrors(async (req,res,next)=>{
    const {firstName,lastName,email,phone,password,gender,dob} = req.body;
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob){
        return next(new ErrorHandler("Please Fill All the Details!",400));
    }

    const isRegistered =await User.findOne({email});

    if(isRegistered ){
        return next(new ErrorHandler(`${isRegistered.role} With This Email Already Exists.`,400))
    }

    const admin = await User.create({firstName,lastName,email,phone,password,gender,role:"Admin"});

    generateToken(admin,"Admin Registered",200,res);
});



export const getUserDetails = catchAsyncErrors(async (req,res,next)=>{
    const user= req.user;
    res.status(200).json({ 
        success:true,
        user
    })
})

export const logoutAdmin = catchAsyncErrors(async (req,res,next)=>{
    res.status(200)
    .cookie("adminToken","",{
        httpOnly:true,
        expires: new Date(Date.now()),
        secure:true,
        sameSite:"None"
    })
    .json({
        success:true,
        message:"User LoggedOut Successfully!!"
    })
})

export const logoutEmployee = catchAsyncErrors(async (req,res,next)=>{
    res.status(200)
    .cookie("EmployeeToken","",{
        httpOnly:true,
        expires: new Date(Date.now()),
        secure:true,
        sameSite:"None"
    })
    .json({
        success:true,
        message:"User LoggedOut Successfully!!"
    })
})


  export const adminAttendance = catchAsyncErrors(async (req, res, next) => {
    // Fetch name, email, and attendance for all users
    const users = await User.find().select("name email attendence");

    // Return the fetched data directly
    res.status(200).json({
        success: true,
        message: "Attendance list fetched successfully",
        data: users // Return all users with the selected fields
    });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({
      email: req.body.email,
      accountVerified: true,
    });
    if (!user) {
      return next(new ErrorHandler("User not found.", 404));
    }
    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  
    const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;
  
    try {
      sendEmail({
        email: user.email,
        subject: "MERN AUTHENTICATION APP RESET PASSWORD",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully.`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new ErrorHandler(
          error.message ? error.message : "Cannot send reset password token.",
          500
        )
      );
    }
  });
  // Reset Password Controller
  export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new ErrorHandler(
          "Reset password token is invalid or has been expired.",
          400
        )
      );
    }
  
    if (req.body.password !== req.body.confirmPassword) {
      return next(
        new ErrorHandler("Password & confirm password do not match.", 400)
      );
    }
  
  user.password = req.body.password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  
    generateToken(user,"Reset Password Successfully.", 200, res);
  });
  
  export const userAttendance = async (req, res) => {
    try {
        const { year, month } = req.query; // Get year and month from query parameters
        const userId = req.user.id; // Authenticated user ID

        if (!year || !month) {
            return res.status(400).json({ message: "Year and month are required" });
        }

        // Fetch user attendance data
        const user = await User.findById(userId).select("attendence");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const attendanceRecords = user.attendence || [];
        console.log("📌 Attendance Records for User:", attendanceRecords); // Debugging Step 1

        // Get the number of working days in the month (excluding Sundays)
        const totalDaysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();
        const absentDays = []; // Initialize an empty array to track absent days
        const presentDays = new Set();
        const today = moment().utc(); // Get current UTC date

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const currentDate = moment.utc(`${year}-${month}-${day}`, "YYYY-MM-DD");

            if (currentDate.day() === 0) continue; // Skip Sundays
            if (currentDate.isAfter(today, "day")) continue; // Skip future dates

            const isPresent = attendanceRecords.some(record => {
                const checkInDate = moment.utc(record.checkIn).startOf("day");
                const checkOutDate = moment.utc(record.checkOut).startOf("day");

                console.log(`📅 Checking date: ${currentDate.format("YYYY-MM-DD")}`);
                console.log(`➡️ UTC Check-In Date: ${checkInDate.format("YYYY-MM-DD HH:mm:ss")}`);
                console.log(`➡️ UTC Check-Out Date: ${checkOutDate.format("YYYY-MM-DD HH:mm:ss")}`);

                return checkInDate.isSame(currentDate, "day") &&
                       checkOutDate.isSame(currentDate, "day") &&
                       record.checkOut; // Ensure check-out exists
            });

            if (isPresent) {
                presentDays.add(day);
            } else {
                absentDays.push(day); // Add the day to absentDays if not present
            }
        }

        console.log("✅ Final Attendance Summary:", { present: presentDays.size, absent: absentDays.length });

        res.status(200).json({
            present: presentDays.size,
            absent: absentDays.length,
            absentDays: absentDays // Send the specific absent days array
        });

    } catch (error) {
        console.error("❌ Error in fetching attendance:", error);
        res.status(500).json({ message: error.message });
    }
};

  
  


  


