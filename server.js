// 🧾 Checkout route (simplified for testing)
app.post("/api/checkout", (req, res) => {
  console.log("Received checkout:", req.body);

  // Basic validation
  const { email, plan } = req.body;
  if (!email || !plan) {
    return res.status(400).json({ error: "Missing email or plan" });
  }

  res.status(200).json({
    message: "Checkout received",
    received: { email, plan }
  });
});
