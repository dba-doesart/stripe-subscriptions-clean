const express = require("express");
const cors = require("cors");

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

// 💳 Price ID lookup table (still here for later)
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

// 🧾 Checkout route (simplified for testing)
app.post("/api/checkout", (req, res) => {
  console.log("Received checkout:", req.body);

  const { email, plan } = req.body;
  if (!email || !plan) {
    return res.status(400).json({ error: "Missing email or plan" });
  }

  res.status(200).json({
    message: "Checkout received",
    received: { email, plan }
  });
});

// 🚀 Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
