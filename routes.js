const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Price ID lookup table
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
  },
  // ... [keep all other parks exactly as you had them]
};

// Unified checkout route
router.post("/checkout", async (req, res) => {
  console.log("Checkout request body:", req.body);

  const {
    businessName,
    ownerEmail,
    ownerPhone,
    responsibleParty,
    state,
    park,
    billingCycle,
    type // 'single' or 'multi'
  } = req.body;

  const priceId = priceMap?.[park]?.[type]?.[billingCycle];
  console.log("park:", park);
  console.log("type:", type);
  console.log("billingCycle:", billingCycle);
  console.log("Resolved priceId:", priceId);

  if (!priceId) {
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

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;