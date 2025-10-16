require('dotenv').config(); // Load environment variables

const express = require("express");
const app = express();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 3000;

const fs = require("fs");
const path = require("path");

// Load metadata from JSON file in the root directory
const metadataPath = path.join(__dirname, "./stripeMetadata.json");
const stripeMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

app.use(express.json());

// 🔍 Global request logging
app.use((req, res, next) => {
  console.log(`🌐 Incoming ${req.method} request to ${req.url}`);
  next();
});

// Create Checkout Session using direct priceId
app.post("/api/checkout", async (req, res) => {
  console.log("🚀 /api/checkout route triggered");

  const {
    priceId,
    businessName,
    ownerEmail,
    ownerPhone,
    responsibleParty,
    state,
    park,
    billingCycle,
    paymentMethod,
    type
  } = req.body;

  console.log("📩 Incoming advertiser form:", req.body);

  // Validate required fields
  if (!priceId || !businessName || !ownerEmail || !billingCycle) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Build metadata from form fields
  const metadata = {
    businessName,
    ownerEmail,
    ownerPhone,
    responsibleParty,
    state,
    park,
    billingCycle,
    paymentMethod,
    type
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: ownerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      success_url: "https://campgroundguides.com/success",
      cancel_url: "https://campgroundguides.com/cancel"
    });

    console.log("✅ Stripe session created");
    console.log("🔗 Stripe session URL:", session.url);

    if (!session || !session.url) {
      console.error("❌ Stripe session is missing or incomplete:", session);
      return res.status(500).json({ error: "Stripe session creation failed — no URL returned" });
    }

    res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err.message);
    console.error("🔍 Full error object:", JSON.stringify(err, null, 2));
    res.status(500).json({ error: err.message || "Stripe session creation failed" });
  }
});

// CORS test route
app.get("/test", (req, res) => {
  res.json({ message: "CORS is working!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});