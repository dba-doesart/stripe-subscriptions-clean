import { parkConfig } from "./parkConfig.js";

// Helper: Lookup Stripe priceId from config
function getPriceId(selectedPark, billingCycle, paymentMethod) {
  const park = parkConfig.parks.find(p => p.name === selectedPark);
  return park?.prices?.[billingCycle]?.[paymentMethod]?.priceId || null;
}

export const createSale = () => {};
export const inputToMultiAdvertiser = () => {};
export const inputToSingleAdvertiser = () => {};
export const stateToAbbreviation = () => {};
export const validateForm = () => {};

export const advertToCheckout = async () => {
  const park = "Eagle Park"; // Replace with dynamic form value
  const billingCycle = "monthly"; // Replace with form value
  const paymentMethod = "card"; // Replace with form value

  const priceId = getPriceId(park, billingCycle, paymentMethod);

  if (!priceId) {
    alert("No Stripe price ID found for this selection.");
    return;
  }

  const payload = {
    priceId,
    businessName: "dba",
    ownerEmail: "info@campgroundguides.com",
    ownerPhone: "6026727327",
    responsibleParty: "Diana",
    states: ["NM"],
    parks: [park],
    billingCycle,
    paymentMethod,
    type: "multi"
  };

  try {
    const response = await fetch("https://stripe-subscriptions-clean.onrender.com/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      console.error("❌ No checkout URL returned:", data);
      alert("Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error("❌ Fetch error:", err);
    alert("Unable to reach the server. Please try again later.");
  }
};