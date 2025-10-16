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

// Helper function to get metadata by product name
function getMetadataByProductName(productName) {
  const entry = stripeMetadata.find(item => item.productName === productName);
  return entry ? entry.metadata : null;
}

app.use(express.json());

// Create Checkout Session
app.post("/api/checkout", async (req, res) => {
  const { productName, priceId, customerEmail } = req.body;

  console.log("📩 Incoming request:", req.body);

  if (!productName || !priceId || !customerEmail) {
    return res.status(400).json({ error: "Missing required fields: productName, priceId, or customerEmail" });
  }

  const metadata = getMetadataByProductName(productName);

  if (!metadata) {
    return res.status(404).json({ error: `No metadata found for product: ${productName}` });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: metadata,
      success_url: "https://campgroundguides.com/success",
      cancel_url: "https://campgroundguides.com/cancel",
    });

    console.log("✅ Session URL:", session.url);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe error:", error);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});
app.get("/test", (req, res) => {
  res.json({ message: "CORS is working!" });
});
// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
