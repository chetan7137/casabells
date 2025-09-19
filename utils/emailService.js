// In your emailService.js
const emailService = async (email, name, quantity, amount, address, pincode, contact, orderId, paymentId) => {
  return new Promise(async (resolve, reject) => {
    try {
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
        <table width="100%" border="0" cellspacing="0" cellpadding="0" 
               style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #facc15; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #1f2937;">Thank You for Your Purchase!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; color: #374151; font-size: 16px; line-height: 1.6;">
              <p>Hi <strong>${name}</strong>,</p>
              <p>We are delighted to confirm your order with <strong>Casabelles</strong>.</p>
              <p style="margin-bottom: 20px;">Here are your order details:</p>

              <table width="100%" cellpadding="6" cellspacing="0" 
                     style="border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 20px; font-size: 14px; color: #374151;">
                <tr>
                  <td><strong>Quantity</strong></td>
                  <td>${quantity} Kamdhenu Cow Figurine(s)</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td><strong>Total Amount</strong></td>
                  <td>₹${amount}</td>
                </tr>
                <tr>
                  <td><strong>Shipping To</strong></td>
                  <td>${address}, ${pincode}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td><strong>Contact</strong></td>
                  <td>${contact}</td>
                </tr>
              </table>

              <p>We’ll notify you once your order has been shipped 🚚.</p>
              <p>Thank you for choosing Casabelles. We look forward to serving you again!</p>

              <p style="margin-top: 30px;">Warm regards,<br/><strong>The Casabelles Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
              © ${new Date().getFullYear()} Casabelles. All rights reserved.
            </td>
          </tr>
        </table>
      </div>`
      };

      console.log("Attempting to send email to:", email);

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Failed to send email:", err);
          return reject(err);
        } else {
          console.log("SMTP accepted the message:", info.response);
          console.log("Email sent successfully:", info.response);
          return resolve(info);
        }
      });

    } catch (err) {
      console.error("EmailService caught error:", err);
      reject(err);
    }
  });
};
