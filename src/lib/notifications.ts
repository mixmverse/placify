// src/lib/notifications.ts
import db from "./db";
import { Resend } from "resend";

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendInAppNotification(
  userId: string,
  type: string,
  payload: Record<string, unknown>,
) {
  await db.notification.create({
    data: {
      userId,
      type,
      payload: JSON.stringify(payload),
    },
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  reactNode: React.ReactElement,
) {
  try {
    const client = getResend();
    if (!client) {
      console.error("Resend email skipped: RESEND_API_KEY not set");
      return;
    }
    await client.emails.send({
      from: "Placify <onboarding@resend.dev>",
      to,
      subject,
      react: reactNode,
    });
  } catch (e) {
    // Non-critical: log but don't fail the operation
    console.error("Resend email failed:", e);
  }
}

// Email template helpers
export function submissionReceivedEmail(trackTitle: string, curatorName: string) {
  return { subject: `New pitch: ${trackTitle}`, body: `Your track "${trackTitle}" was pitched to ${curatorName}.` };
}

export function submissionDecidedEmail(outcome: string, feedback: string) {
  return { subject: `Pitch ${outcome}`, body: `Your pitch was ${outcome}. Feedback: ${feedback}` };
}

export function creditsRefundedEmail(submissionId: string) {
  return { subject: "Pitch expired — credit refunded", body: `Your pitch ${submissionId} exceeded the 7-day window. 1 credit has been refunded.` };
}
