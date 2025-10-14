import { parkConfig } from "./parkConfig.js";

const form = document.getElementById("subscriptionForm");
const parkSelect = document.getElementById("park");
const billingCycle = document.getElementById("billingCycle");
const paymentMethod = document.getElementById("paymentMethod");
const priceDisplay = document.getElementById("priceDisplay");

// Populate park dropdown
parkConfig.parks.forEach((park) => {
  const option = document.createElement("option");
  option.value = park.id;
  option.textContent = park.name;
  parkSelect.appendChild(option);
});

// Update price display
function updatePrice() {
  const selectedPark = parkConfig.parks.find(p => p.id === parkSelect.value);
  const cycle = billingCycle.value;
  const price =
    cycle === "monthly"
      ? selectedPark.priceMonthly
      : selectedPark.priceAnnual ?? selectedPark.priceMonthly;

  priceDisplay.textContent = `Total: $${price.toFixed(2)}`;
}

// Hide annual option if not supported
function toggleBillingOptions() {
  const selectedPark = parkConfig.parks.find(p => p.id === parkSelect.value);
  const annualOption = [...billingCycle.options].find(opt => opt.value === "annual");
  annualOption.disabled = selectedPark.priceAnnual === null;
  if (selectedPark.priceAnnual === null && billingCycle.value === "annual") {
    billingCycle.value = "monthly";
  }
  updatePrice();
}

// Event listeners
parkSelect.addEventListener("change", toggleBillingOptions);
billingCycle.addEventListener("change", updatePrice);

// Initial load
toggleBillingOptions();

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    parkId: parkSelect.value,
    billingCycle: billingCycle.value,
    paymentMethod: paymentMethod.value
  };

  const endpoint =
    paymentMethod.value === "card"
      ? "https://campground-subscriptions-backend-2.onrender.com/api/checkout"
      : "https://campground-subscriptions-backend-2.onrender.com/api/invoice";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (paymentMethod.value === "card") {
      window.location.href = data.checkoutUrl;
    } else {
      alert("Invoice request submitted! You’ll receive an email shortly.");
    }
  } catch (err) {
    console.error("Submission failed:", err);
    alert("Something went wrong. Please try again.");
  }
});