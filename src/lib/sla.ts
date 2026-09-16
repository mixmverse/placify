// src/lib/sla.ts
import db from "./db";
import { refundCredit } from "./credits";

// Called every 15 min via Vercel cron
export async function runSlaSweeper() {
  const overdue = await db.submission.findMany({
    where: { status: "PENDING", deadlineAt: { lt: new Date() } },
    select: { id: true, artistUserId: true, curatorUserId: true },
    take: 500,
  });

  for (const s of overdue) {
    const alreadyProcessed = await db.$transaction(async (tx) => {
      const updated = await tx.submission.updateMany({
        where: { id: s.id, status: "PENDING" },
        data: { status: "EXPIRED", decidedAt: new Date() },
      });
      if (updated.count === 0) return true;

      await refundCredit(s.artistUserId, s.id);
      await tx.curatorProfile.update({
        where: { userId: s.curatorUserId },
        data: { missedDeadlines: { increment: 1 } },
      });
      await tx.notification.create({
        data: {
          userId: s.artistUserId,
          type: "SUBMISSION_EXPIRED_REFUND",
          payload: JSON.stringify({ submissionId: s.id, refunded: 1 }),
        },
      });
      return false;
    });
    if (alreadyProcessed) continue;
  }
  return { processed: overdue.length };
}
