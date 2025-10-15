const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// 🔍 Global request logger
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// 🧪 Ping route to confirm server is alive
app.get("/api/ping", (req, res) => {
  res.send("pong");
});

// 🧪 Stripe key test route
app.get("/api/stripe-test", async (req, res) => {
  try {
    const products = await stripe.products.list({ limit: 1 });
    console.log("Stripe key test successful:", products.data[0]?.name || "No products found");
    res.status(200).json({ message: "Stripe key is valid", product: products.data[0] });
  } catch (error) {
    console.error("Stripe key test failed:", error.message);
    res.status(500).json({ error: "Invalid Stripe key or network issue" });
  }
});

// 💳 Price ID lookup table
const priceMap = {
  "Cherokee_Dam_Campground": {
    single: {
      monthly: "price_1S6HwdHw2ZCjSnG4uGEurGFu",
      annual: "price_1S5FsxHw2ZCjSnG43MHiN6hj"
    },
    multi: {
      monthly: "price_1S5F1aHw2ZCjSnG4MSfCkIh1",
      annual: "price_1S5EgRHw2ZCjSnG4pU8Ooac2"
    }
  }
  // Add other parks here as needed
};

// 🧾 Checkout route with Stripe integration and improved logging
app.post("/api/checkout", async (req, res) => {
  console.log("Checkout request body:", req.body);

  const {
    businessName,
    ownerEmail,
    ownerPhone,
    responsibleParty,
    state,
    park,
    billingCycle,
    type
  } = req.body;

  // Validate required fields
  if (!businessName || !ownerEmail || !ownerPhone || !responsibleParty || !state || !park || !billingCycle || !type) {
    console.warn("Missing required fields");
    return res.status(400).json({ error: "Missing required fields in request body" });
  }

  // Resolve price ID
  const priceId = priceMap?.[park]?.[type]?.[billingCycle];
  console.log("Resolved priceId:", priceId);

  if (!priceId) {
    console.warn("Invalid park/type/billingCycle combination");
    return res.status(400).json({ error: "Invalid park/type/billingCycle combination" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: ownerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: "https://campgroundguides.com/success",
      cancel_url: "https://campgroundguides.com/cancel",
      metadata: {
        businessName,
        ownerPhone,
        responsibleParty,
        state,
        park,
        billingCycle,
        type
      }
    });

    console.log("Stripe session created:", session.id);
    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

// 🚀 Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});