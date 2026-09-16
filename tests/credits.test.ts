import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures these exist before vi.mock hoisting runs
const { mockUser, mockCreditLedger } = vi.hoisted(() => ({
  mockUser: {
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
  },
  mockCreditLedger: {
    create: vi.fn(),
  },
}));

vi.mock("../src/lib/db", () => ({
  default: {
    user: mockUser,
    creditLedger: mockCreditLedger,
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) =>
      fn({ user: mockUser, creditLedger: mockCreditLedger })
    ),
  },
}));

import { spendCredit, refundCredit, grantCredits, InsufficientCreditsError } from "../src/lib/credits";

describe("credits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("spendCredit", () => {
    it("decrements balance and creates ledger entry", async () => {
      mockUser.updateMany.mockResolvedValue({ count: 1 });
      mockUser.findUniqueOrThrow.mockResolvedValue({ creditBalance: 9 });
      mockCreditLedger.create.mockResolvedValue({ id: "ledger-1" });

      const result = await spendCredit("user-1");

      expect(result.ledgerId).toBe("ledger-1");
      expect(mockUser.updateMany).toHaveBeenCalledWith({
        where: { id: "user-1", creditBalance: { gte: 1 } },
        data: { creditBalance: { decrement: 1 } },
      });
      expect(mockCreditLedger.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          delta: -1,
          reason: "SUBMISSION_SPEND",
          balanceAfter: 9,
        },
      });
    });

    it("throws InsufficientCreditsError when balance is 0", async () => {
      mockUser.updateMany.mockResolvedValue({ count: 0 });

      await expect(spendCredit("user-1")).rejects.toThrow(InsufficientCreditsError);
    });
  });

  describe("refundCredit", () => {
    it("increments balance and creates ledger entry with submissionId", async () => {
      mockUser.findUniqueOrThrow.mockResolvedValue({ creditBalance: 4 });
      mockUser.update.mockResolvedValue({});
      mockCreditLedger.create.mockResolvedValue({});

      await refundCredit("user-1", "sub-1");

      expect(mockUser.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { creditBalance: { increment: 1 } },
      });
      expect(mockCreditLedger.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          delta: +1,
          reason: "SUBMISSION_REFUND",
          balanceAfter: 5,
          submissionId: "sub-1",
        },
      });
    });
  });

  describe("grantCredits", () => {
    it("increments balance and creates ledger entry", async () => {
      mockUser.findUniqueOrThrow.mockResolvedValue({ creditBalance: 10 });
      mockUser.update.mockResolvedValue({});
      mockCreditLedger.create.mockResolvedValue({});

      await grantCredits("user-1", 25, "PACK_PURCHASE", "stripe-1");

      expect(mockUser.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { creditBalance: { increment: 25 } },
      });
      expect(mockCreditLedger.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          delta: 25,
          reason: "PACK_PURCHASE",
          balanceAfter: 35,
          stripeRef: "stripe-1",
        },
      });
    });

    it("works without stripeRef", async () => {
      mockUser.findUniqueOrThrow.mockResolvedValue({ creditBalance: 5 });
      mockUser.update.mockResolvedValue({});
      mockCreditLedger.create.mockResolvedValue({});

      await grantCredits("user-1", 10, "ROLLOVER");

      expect(mockCreditLedger.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          delta: 10,
          reason: "ROLLOVER",
          balanceAfter: 15,
          stripeRef: undefined,
        },
      });
    });
  });
});
