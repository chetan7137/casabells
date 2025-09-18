const express = require("express");
require("dotenv").config();
const Razorpay = require("razorpay");
const { emailService } = require("./utils/emailService.js");
// const internRoute = require("./route/internRoute.js");
// const courseRoute = require("./route/courseRoute.js");

const app = express();
app.use(express.json());

const PORT = "3000"

app.use(express.static('public'));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
const ALLOWED_AMOUNTS = [240, 480, 600, 800, 900];
app.post("/create-order", async (req, res) => {
  try {
    const { name, email, contact, address, pincode, quantity, amount } = req.body;
    console.log(req.body);

    // Name validation (letters + spaces, 2–50 chars)
    if (!name || !/^[a-zA-Z\s]{2,50}$/.test(name.trim())) {
      console.log("debug-1")
      return res.status(400).json({ success: false, message: "Invalid name" });
    }

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("debug-2")
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Contact validation (10 digits)
    if (!contact || !/^\d{10}$/.test(contact)) {
      return res.status(400).json({ success: false, message: "Invalid contact number" });
    }

    // Address validation (at least 5 characters, max 200)
    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    // Pincode validation (6 digits)
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: "Invalid pincode" });
    }

    // Quantity validation (1–10 for safety)
    if (!quantity || isNaN(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    // Amount validation (must match allowed values)
    if (!ALLOWED_AMOUNTS.includes(Number(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    
    const options = {
      amount: Number(amount)*100, // amount in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: {
        customer_name: name,
        customer_email: email,
        customer_contact: contact,
        customer_address: address,
        customer_pincode: pincode,
        quantity: quantity,
        product_amount: amount
      },
    };

    const order = await razorpay.orders.create(options);
    emailService(email, name, quantity, amount, address, pincode, contact);
    return res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = app;
module.exports.handler = serverless(app);