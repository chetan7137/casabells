const crypto = require("crypto");
const { emailService } = require("../utils/emailService");
require("dotenv").config();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    console.log("Incoming webhook headers:\n", JSON.stringify(req.headers, null, 2));
    console.log("Incoming webhook body:\n", JSON.stringify(req.body, null, 2));

    const isTest = req.body.testEmail === true;

    // ---------- VERIFY SIGNATURE ----------
    if (!isTest) {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
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
    } else {
      console.log("Test mode enabled — skipping signature verification");
    }

    // ---------- GET PAYMENT DATA ----------
    const event = req.body.event || "payment.captured";
    const payment = req.body.payload?.payment?.entity;

    if (!payment) {
      console.error("No payment entity found in webhook payload");
      return res.status(400).json({ success: false, message: "Invalid payment data" });
    }

    // ---------- CALL EMAIL SERVICE ----------
    if (event === "payment.captured" || isTest) {
      console.log("Calling emailService for payment:", payment.id);

      await emailService(
        payment.notes.customer_email || payment.email,
        payment.notes.customer_name,
        payment.notes.quantity,
        payment.notes.product_amount || payment.amount,
        payment.notes.customer_address,
        payment.notes.customer_pincode,
        payment.notes.customer_contact || payment.contact,
        payment.order_id,
        payment.id
      );

      console.log("Email sent successfully for payment:", payment.id);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
