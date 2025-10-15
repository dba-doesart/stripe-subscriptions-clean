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
