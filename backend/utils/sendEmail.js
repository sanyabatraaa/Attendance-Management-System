// utils/sendEmail.js
import nodemailer from "nodemailer"; // Correctly import nodemailer

const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        service: process.env.SMTP_SERVICE,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const options = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html: message,
    };

    try {
        await transporter.sendMail(options);
        console.log("Verification email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email");
    }
};

// ✅ Use default export to match ESM import syntax
export default sendEmail;
