require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Replace these with your actual Stripe Price IDs
const priceMap = {
  'Eagle RV Park': 'price_abc123',
  'Lea Co. RV Park': 'price_def456',
  'ZIA RVillas': 'price_ghi789',
  'Energy Plex RV Park': 'price_jkl012'
};

app.post('/create-checkout-session', async (req, res) => {
  const selectedParks = req.body.selectedParks; // Array of park names

  if (!selectedParks || selectedParks.length === 0) {
  return res.status(400).json({ error: 'No parks selected.' });
}

const pricePerPark = selectedParks.length === 1 ? 2500 : 2000;

const lineItems = selectedParks.map(park => ({
  price_data: {
    currency: 'usd',
    product_data: {
      name: park
    },
    unit_amount: pricePerPark,
    recurring: {
      interval: 'month'
    }
  },
  quantity: 1
}));

 

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel'
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create session.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
