import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
});

export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"Gradiant Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Password Reset OTP',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #555;">Hello,</p>
            <p style="font-size: 16px; color: #555;">We received a request to reset your password. Please use the verification code below to proceed:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A90E2; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; border: 1px dashed #4A90E2;">
                    ${otp}
                </span>
            </div>

            <p style="font-size: 14px; color: #888; text-align: center;">
                This OTP is valid for the next <b>10 minutes</b>.
                If you did not request a password reset, please ignore this email or contact support if you have concerns.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">
                Sent by Gradiant Team <br>
                Karachi, Pakistan
            </p>
        </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};