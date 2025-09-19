const crypto = require("crypto");
const { emailService } = require("../utils/emailService");
require("dotenv").config();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // ----- DEBUG LOGGING -----
    console.log("Incoming webhook headers:\n", JSON.stringify(req.headers, null, 2));
    console.log("Incoming webhook body:\n", JSON.stringify(req.body, null, 2));

    // ----- DETERMINE IF THIS IS A TEST -----
    // Send {"testEmail": true} in the POST body to simulate a Razorpay webhook
    const isTest = req.body.testEmail === true;

    // ----- SIGNATURE VERIFICATION -----
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

    // ----- GET PAYMENT DATA -----
    const event = req.body.event || "payment.captured";
    const payment = req.body.payload?.payment?.entity || {
      id: "test_pay",
      order_id: "test_order",
      email: "chetan.010.1999@gmail.com",
      contact: "9999999999",
      amount: 1000,
      notes: {
        customer_email: "chetan.010.1999@gmail.com",
        customer_name: "Chetan Sharma",
        quantity: 1,
        product_amount: 1000,
        customer_address: "Test Address",
        customer_pincode: "110051",
        customer_contact: "9999999999"
      }
    };

    // ----- CALL EMAIL SERVICE -----
    if (event === "payment.captured" || isTest) {
      try {
        console.log("Calling emailService with params:\n", JSON.stringify({
          to: payment.notes.customer_email || payment.email,
          name: payment.notes.customer_name,
          quantity: payment.notes.quantity,
          amount: payment.notes.product_amount || payment.amount,
          address: payment.notes.customer_address,
          pincode: payment.notes.customer_pincode,
          contact: payment.notes.customer_contact || payment.contact,
          orderId: payment.order_id,
          paymentId: payment.id
        }, null, 2));

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
      } catch (emailErr) {
        console.error("EmailService error:", emailErr);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
