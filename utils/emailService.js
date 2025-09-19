require("dotenv").config();
const nodemailer = require("nodemailer");

const emailService = (email, name, quantity, amount, address, pincode, contact, orderId, paymentId) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.APP_PWD
      }
    });

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `Casabells Order Confirmation - ${orderId}`,
      html: `<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
        ...your existing HTML here...
      </div>`
    };

    console.log("Attempting to send email to:", email);

    // Wait for email to actually send before resolving
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Failed to send email:", err);
        return reject(err);
      }
      console.log("SMTP accepted the message:", info.response);
      console.log("Email sent successfully:", info.response);
      resolve(info);
    });
  });
};

module.exports = { emailService };
