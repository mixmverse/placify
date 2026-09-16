// src/lib/notifications.ts
import db from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

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
    await resend.emails.send({
      from: "Placify <support@placify.com>",
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
  return { subject: "Pitch expired — credit refunded", body: `Your pitch ${submissionId} exceeded the 72h window. 1 credit has been refunded.` };
}
