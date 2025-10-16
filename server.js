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

// ✅ Bulletproof CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Replace * with your Hostinger domain if needed
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// 🔍 Global request logging
app.use((req, res, next) => {
  console.log(`🌐 Incoming ${req.method} request to ${req.url}`);
  next();
});

// ✅ Test route to confirm CORS
app.get("/test", (req, res) => {
  res.json({ message: "CORS is working!" });
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

// Invoice route
app.post("/api/invoice", async (req, res) => {
  try {
    const {
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

    console.log("📩 Incoming invoice request:", req.body);

    // Simulate invoice logic or send to your invoicing system
    res.json({ message: "Invoice request received." });
  } catch (err) {
    console.error("❌ Invoice error:", err);
    res.status(500).json({ error: "Invoice request failed." });
  }
});

// Optional: legacy fallback price lookup
function getPriceIdForPark(parkName, cycle) {
  const priceMap = {
    "Cherokee Dam Campground": {
      monthly: "price_cherokee_monthly",
      annual: "price_cherokee_annual"
    },
    "Melton Hill Dam Campground": {
      monthly: "price_melton_monthly",
      annual: "price_melton_annual"
    },
    "Yarberry Campground": {
      monthly: "price_yarberry_monthly",
      annual: "price_yarberry_annual"
    },
    "Greenlee RV Park": {
      monthly: "price_greenlee_rv_monthly",
      annual: "price_greenlee_rv_annual"
    },
    "Greenlee May Springs": {
      monthly: "price_greenlee_may_monthly",
      annual: "price_greenlee_may_annual"
    },
    "Energy Park": {
      monthly: "price_energy_monthly",
      annual: "price_energy_annual"
    },
    "Zia Park": {
      monthly: "price_zia_monthly",
      annual: "price_zia_annual"
    },
    "Lea Park": {
      monthly: "price_lea_monthly",
      annual: "price_lea_annual"
    },
    "Eagle Park": {
      monthly: "price_eagle_monthly",
      annual: "price_eagle_annual"
    },
    "Arizona Mural Trail (Tucson)": {
      monthly: "price_arizona_monthly",
      annual: "price_arizona_annual"
    }
  };

  return priceMap[parkName]?.[cycle] || null;
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});