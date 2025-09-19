const Razorpay = require("razorpay");
require("dotenv").config();
const { emailService } = require("../utils/emailService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const ALLOWED_AMOUNTS = [240, 480, 600, 800, 900];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { name, email, contact, address, pincode, quantity, amount } = req.body;

    // Validations
    if (!name || !/^[a-zA-Z\s]{2,50}$/.test(name.trim())) {
      return res.status(400).json({ success: false, message: "Invalid name" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (!contact || !/^\d{10}$/.test(contact)) {
      return res.status(400).json({ success: false, message: "Invalid contact number" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: "Invalid pincode" });
    }
    if (!quantity || isNaN(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }
    if (!ALLOWED_AMOUNTS.includes(Number(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // ✅ Create order
    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: {
        customer_name: name,
        customer_email: email,
        customer_contact: contact,
        customer_address: address,
        customer_pincode: pincode,
        quantity,
        product_amount: amount,
      },
    });

    // Send email
    emailService(email, name, quantity, amount, address, pincode, contact);

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
