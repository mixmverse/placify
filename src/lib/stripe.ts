// src/lib/stripe.ts
import stripe from "stripe";
import db from "./db";
import { grantCredits } from "./credits";

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function createCheckoutSession(userId: string, priceCents: number, plan: string) {
  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `${plan} credits pack` },
          unit_amount: priceCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/artist/credits?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/artist/credits?canceled=1`,
    metadata: { userId, plan } as Record<string, string>,
  });
  return { sessionId: session.id, url: session.url };
}

export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  let event: stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    throw new Error("Invalid Stripe signature");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as stripe.Checkout.Session;
      const metadata = (session.metadata ?? {}) as Record<string, string>;
      const { userId, plan } = metadata;
      const credits = plan === "STARTER" ? 25 : plan === "PRO" ? 75 : 200;
      await grantCredits(userId, credits, "PACK_PURCHASE", session.id);
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as stripe.Invoice & { subscription?: string };
      const sub = await db.subscription.findUnique({
        where: { stripeSubscriptionId: (invoice.subscription as string) ?? "" },
        include: { user: true },
      });
      if (sub?.user) {
        const carried = Math.min(sub.user.creditBalance ?? 0, Math.floor(sub.monthlyCredits * 0.25));
        await grantCredits(sub.userId, carried + sub.monthlyCredits, "ROLLOVER");
        await grantCredits(sub.userId, sub.monthlyCredits, "SUBSCRIPTION_GRANT");
        await db.subscription.update({
          where: { id: sub.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date((invoice.period_start ?? 0) * 1000),
            currentPeriodEnd: new Date((invoice.period_end ?? 0) * 1000),
            updatedAt: new Date(),
          },
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as stripe.Invoice & { subscription?: string };
      const sub = await db.subscription.findUnique({
        where: { stripeSubscriptionId: (invoice.subscription as string) ?? "" },
      });
      if (sub) {
        await db.subscription.update({ where: { id: sub.id }, data: { status: "PAST_DUE" } });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = await db.subscription.findUnique({
        where: { stripeSubscriptionId: (event.data.object as stripe.Subscription).id },
      });
      if (sub) {
        await db.subscription.update({ where: { id: sub.id }, data: { status: "CANCELED" } });
      }
      break;
    }
  }
  return { received: true };
}

export async function createPortalSession(userId: string) {
  const session = await stripeClient.billingPortal.sessions.create({
    customer: userId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/artist/credits`,
  });
  return { url: session.url };
}
