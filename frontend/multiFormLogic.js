form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedPark = parkConfig.parks.find(p => p.id === parkSelect.value);
  const cycle = billingCycle.value;

  const priceId =
    cycle === "monthly"
      ? selectedPark.priceIdMonthly
      : selectedPark.priceIdAnnual ?? selectedPark.priceIdMonthly;

  const productName = `${selectedPark.name.toUpperCase().replace(/ /g, "_")}_${selectedPark.region}`;
  const customerEmail = "info@campgroundguides.com"; // You can make this dynamic later

  const payload = {
    productName,
    priceId,
    customerEmail
  };

  const endpoint = "https://stripe-subscriptions-clean.onrender.com/api/checkout";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error("Submission failed:", err);
    alert("Something went wrong. Please try again.");
  }
});
