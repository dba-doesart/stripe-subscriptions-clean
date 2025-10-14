const express = require("express");

const routes = require("./routes");
const app = express();
app.use(express.json());

const priceMap = {
  ENERGY_SINGLE: "price_1SHrowHw2ZCjSnG4RfJUJNzz",
  ENERGY_MULTI: "price_1SHyddHw2ZCjSnG4TXqL527N",
  ZIA_SINGLE: "price_1SHrnzHw2ZCjSnG4ZUxNX9VO",
  ZIA_MULTI: "price_1SHykOHw2ZCjSnG4gtWjKlUD",
  LEA_SINGLE: "price_1SHrmkHw2ZCjSnG4LomKT3La",
  LEA_MULTI: "price_1SHypIHw2ZCjSnG4XsnClabP",
  EAGLE_SINGLE: "price_1SHrlTHw2ZCjSnG44o2JPSKr",
  EAGLE_MULTI: "price_1SHywuHw2ZCjSnG4tyoFlUBi",
  ARIZONA_SINGLE: "price_1SHxh5Hw2ZCjSnG4V3PCyyhd",
  ARIZONA_MULTI: "price_1SHyCYHw2ZCjSnG4kp5ivkAR",
};

app.post("/create-checkout-session", async (req, res) => {
  const { park, type } = req.body;
  const key = `${park.toUpperCase()}_${type.toUpperCase()}`;
  const priceId = priceMap[key];

  console.log("Received request:", { park, type, key, priceId });

  if (!priceId) {
    return res.status(400).send("Invalid park or advertiser type");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: "https://your-site.com/success",
      cancel_url: "https://your-site.com/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).send("Stripe session creation failed");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
