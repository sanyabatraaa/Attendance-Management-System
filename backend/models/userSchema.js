import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const attendanceSchema = new mongoose.Schema({
    checkIn: { type: Date, required: true },
    checkInLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    checkInImage:{type:String , required:true},
    checkOut: { type: Date },
    checkOutLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    checkOutImage:{type:String },
});

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, minLength: 3 },
    lastName: { type: String, required: true, minLength: 3 },
    email: { type: String, required: true, validate: [validator.isEmail] },
    phone: { 
        type: String, 
        required: true, 
        minLength: 10, 
        maxLength: 10,  // ✅ Allows "+91XXXXXXXXXX"
    },
    gender: { type: String, required: true, enum: ["Male", "Female"] },
    password: { type: String, minLength: 8, required: true, select: false },
    accountVerified: { type: Boolean, default: false },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String, // Store the plain-text reset password token
    resetPasswordExpire: Date,
    role: { type: String, required: true, enum: ["Employee", "Admin"] },
    empAvatar: { public_id: String, url: String },
    attendence: [attendanceSchema]
}, { timestamps: true });

// Hashing password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT Token
userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES });
};

// Method to generate verification code
userSchema.methods.generateVerificationCode = function () {
    function generateRandomFiveDigitNumber() {
        const firstDigit = Math.floor(Math.random() * 9) + 1;
        const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, 0);
        return parseInt(firstDigit + remainingDigits);
    }
    const verificationCode = generateRandomFiveDigitNumber();
    this.verificationCode = verificationCode;
    this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;
    return verificationCode;
};

// Method to generate reset password token
userSchema.methods.generateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
  
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
    return resetToken;
  };

export const User = mongoose.model('User', userSchema);
