import { Router } from "express";
import { stripe } from "../stripeClient";

const router = Router();

const ROAD_WORKOUTS_PRICE_ID = "price_1TAmz1ExKk6XaaWgWpTBxlIs";
const ROAD_WORKOUTS_PAYMENT_LINK = "https://buy.stripe.com/test_cNi3cvggre7Y2ISe0ffbq00";

router.post("/checkout/road-workouts", async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.json({ url: ROAD_WORKOUTS_PAYMENT_LINK });
  }

  try {
    const origin =
      req.headers.origin ??
      req.headers.referer ??
      "https://m2training.com";

    const session = (await stripe.post("/v1/checkout/sessions", {
      mode: "payment",
      "line_items[0][price]": ROAD_WORKOUTS_PRICE_ID,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/purchase-success`,
      cancel_url: `${origin}/store`,
      "metadata[product]": "workouts_on_the_road",
    })) as { url: string };

    return res.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[checkout] Stripe error:", err);
    return res.json({ url: ROAD_WORKOUTS_PAYMENT_LINK });
  }
});

export default router;
