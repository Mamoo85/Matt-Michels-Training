const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY ?? "";

async function stripeRequest(
  method: "GET" | "POST",
  path: string,
  params?: Record<string, string>
): Promise<unknown> {
  if (!STRIPE_SECRET) {
    throw new Error("STRIPE_SECRET_KEY env var is not set");
  }

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  if (method === "POST" && params) {
    options.body = new URLSearchParams(params).toString();
  }

  const resp = await fetch(`https://api.stripe.com${path}`, options);
  const data = (await resp.json()) as { error?: { message: string } };
  if (!resp.ok && data.error) {
    throw new Error(`Stripe API error: ${data.error.message}`);
  }
  return data;
}

export const stripe = {
  get: (path: string) => stripeRequest("GET", path),
  post: (path: string, params: Record<string, string>) =>
    stripeRequest("POST", path, params),
};
