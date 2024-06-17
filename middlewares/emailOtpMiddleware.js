import nodemailer from "nodemailer";

//Nodemailer
//transporter configuration

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

//Send OTP via Email
export const sendOTPByEmail = (email, otp) => {
  const mailOptions = {
    from: '"AuthModule Petaverse" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: "OTP Verification Token",
    text: `Your OTP Verification Token is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};