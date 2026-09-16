// src/lib/credits.ts
import db from "./db";

export async function spendCredit(userId: string) {
  const { id: ledgerId } = await db.$transaction(async (tx) => {
    const spent = await tx.user.updateMany({
      where: { id: userId, creditBalance: { gte: 1 } },
      data: { creditBalance: { decrement: 1 } },
    });
    if (spent.count === 0) throw new InsufficientCreditsError();

    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { creditBalance: true },
    });

    const ledger = await tx.creditLedger.create({
      data: {
        userId,
        delta: -1,
        reason: "SUBMISSION_SPEND",
        balanceAfter: user.creditBalance,
      },
    });
    return { id: ledger.id };
  });
  return { ledgerId };
}

export async function refundCredit(userId: string, submissionId: string) {
  await db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { creditBalance: true },
    });
    await tx.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: 1 } },
    });
    await tx.creditLedger.create({
      data: {
        userId,
        delta: +1,
        reason: "SUBMISSION_REFUND",
        balanceAfter: user.creditBalance + 1,
        submissionId,
      },
    });
  });
}

export async function grantCredits(userId: string, amount: number, reason: string, stripeRef?: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { creditBalance: true } });
  await db.user.update({ where: { id: userId }, data: { creditBalance: { increment: amount } } });
  await db.creditLedger.create({
    data: {
      userId,
      delta: amount,
      reason,
      balanceAfter: user.creditBalance + amount,
      stripeRef,
    },
  });
}

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits");
    this.name = "InsufficientCreditsError";
  }
}
