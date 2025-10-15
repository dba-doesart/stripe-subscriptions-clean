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
  "Melton_Hill_Dam_Campground": {
    single: {
      monthly: "price_1S5FkjHw2ZCjSnG4rXhBv5Zk",
      annual: "price_1S5FrfHw2ZCjSnG41ipCFeY5"
    },
    multi: {
      monthly: "price_1S5F3DHw2ZCjSnG4VVlvmFo5",
      annual: "price_1S5EiHHw2ZCjSnG4dzd4hNOQ"
    }
  },
  "Yarberry": {
    single: {
      monthly: "price_1S5FmFHw2ZCjSnG4VaUbYu1a",
      annual: "price_1S5FpUHw2ZCjSnG4tqc0qHKl"
    },
    multi: {
      monthly: "price_1S5F4SHw2ZCjSnG4LNXwCf0L",
      annual: "price_1S5EjGHw2ZCjSnG4MtRNHluA"
    }
  },
  "Greenlee_RV_Park_Original": {
    single: {
      monthly: "price_1S5FcNHw2ZCjSnG4Nc5Fn6va",
      annual: "price_1S5FvnHw2ZCjSnG4qJEDpbi9"
    },
    multi: {
      monthly: "price_1S5EwwHw2ZCjSnG4OLIgEwk0",
      annual: "price_1S5EbCHw2ZCjSnG4HaYqjRLl"
    }
  },
  "Greenlee_May_Springs": {
    single: {
      monthly: "price_1S5FdFHw2ZCjSnG4wh4S9R72",
      annual: "price_1S5FugHw2ZCjSnG47pEr2XyA"
    },
    multi: {
      monthly: "price_1S5EyMHw2ZCjSnG4xE7YmDkQ",
      annual: "price_1S5EdHHw2ZCjSnG4zCtJX6U1"
    }
  },
  "ENERGY": {
    single: {
      monthly: "price_1SHrowHw2ZCjSnG4RfJUJNzz",
      annual: "price_1SI9swHw2ZCjSnG4NOdRJHOZ"
    },
    multi: {
      monthly: "price_1SHyddHw2ZCjSnG4TXqL527N",
      annual: "price_1SIAGKHw2ZCjSnG4j3bGHEHq"
    }
  },
  "ZIA": {
    single: {
      monthly: "price_1SHrnzHw2ZCjSnG4ZUxNX9VO",
      annual: "price_1SIAMxHw2ZCjSnG4xVQRSaDT"
    },
    multi: {
      monthly: "price_1SHykOHw2ZCjSnG4gtWjKlUD",
      annual: "price_1SIAPFHw2ZCjSnG4RIuCXXoP"
    }
  },
  "LEA": {
    single: {
      monthly: "price_1SHrmkHw2ZCjSnG4LomKT3La",
      annual: "price_1SIAZjHw2ZCjSnG4DuDCJ6Wf"
    },
    multi: {
      monthly: "price_1SHypIHw2ZCjSnG4XsnClabP",
      annual: "price_1SIAeSHw2ZCjSnG4pH96mRjr"
    }
  },
  "EAGLE": {
    single: {
      monthly: "price_1SHrlTHw2ZCjSnG44o2JPSKr",
      annual: "price_1SIAjVHw2ZCjSnG4M1tpmvb2"
    },
    multi: {
      monthly: "price_1SHywuHw2ZCjSnG4tyoFlUBi",
      annual: "price_1SIAnBHw2ZCjSnG4kr0MPEgL"
    }
  },
  "ARIZONA_MURAL_TRAIL": {
    single: {
      monthly: "price_1SHxh5Hw2ZCjSnG4V3PCyyhd",
      annual: "price_1SI1rrHw2ZCjSnG4vnWgSVxt"
    },
    multi: {
      monthly: "price_1SHyCYHw2ZCjSnG4kp5ivkAR",
      annual: "price_1SI23BHw2ZCjSnG4C0Lu4KAU"
    }
  }
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