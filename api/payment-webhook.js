const crypto = require("crypto");
const { emailService } = require("../utils/emailService");
require("dotenv").config();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
// testing
  console.log("Incoming webhook headers:", req.headers);
console.log("Incoming webhook raw body:", req.body);

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify Razorpay signature
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;

      const {
        id: paymentId,
        order_id: orderId,
        email,
        contact,
        notes,
        amount,
      } = payment;

      // Send email using Razorpay notes (safe because they came from your validated order)
      emailService(
        notes.customer_email || email,
        notes.customer_name,
        notes.quantity,
        notes.product_amount || amount,
        notes.customer_address,
        notes.customer_pincode,
        notes.customer_contact || contact,
        orderId,
        paymentId
      );

      console.log("Email sent for payment:", paymentId);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};