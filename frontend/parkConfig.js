export const parkConfig = {
  parks: [
    {
      id: "hobbs",
      name: "Hobbs Campground",
      region: "NM",
      prices: {
        monthly: {
          card: {
            amount: 25,
            priceId: "price_abc123"
          },
          ach: {
            amount: 25,
            priceId: "price_def456"
          }
        },
        annual: {
          card: {
            amount: 250,
            priceId: "price_ghi789"
          },
          ach: {
            amount: 250,
            priceId: "price_jkl012"
          }
        }
      }
    },
    {
      id: "redmond",
      name: "Redmond Marina",
      region: "WA",
      prices: {
        monthly: {
          card: {
            amount: 35,
            priceId: "price_mno345"
          },
          ach: {
            amount: 35,
            priceId: "price_pqr678"
          }
        },
        annual: {
          card: {
            amount: 350,
            priceId: "price_stu901"
          },
          ach: {
            amount: 350,
            priceId: "price_vwx234"
          }
        }
      }
    },
    // Add more parks here as needed
  ]
};