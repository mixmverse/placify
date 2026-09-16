import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFindMany, mockUpdateMany, mockUpdate, mockCreate, mockTx } = vi.hoisted(() => {
  const mockFindMany = vi.fn();
  const mockUpdateMany = vi.fn();
  const mockUpdate = vi.fn();
  const mockCreate = vi.fn();
  const mockTx = {
    submission: { updateMany: mockUpdateMany },
    curatorProfile: { update: mockUpdate },
    notification: { create: mockCreate },
  };
  return { mockFindMany, mockUpdateMany, mockUpdate, mockCreate, mockTx };
});

vi.mock("../src/lib/db", () => ({
  default: {
    submission: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockTx)),
  },
}));

const mockRefundCredit = vi.fn().mockResolvedValue(undefined);
vi.mock("../src/lib/credits", () => ({
  refundCredit: (...args: unknown[]) => mockRefundCredit(...args),
}));

import { runSlaSweeper } from "../src/lib/sla";
import { refundCredit } from "../src/lib/credits";

describe("sla sweeper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefundCredit.mockResolvedValue(undefined);
  });

  it("returns 0 processed when no overdue submissions", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await runSlaSweeper();

    expect(result.processed).toBe(0);
  });

  it("expires overdue submissions and refunds credits", async () => {
    mockFindMany.mockResolvedValue([
      { id: "sub-1", artistUserId: "artist-1", curatorUserId: "curator-1" },
      { id: "sub-2", artistUserId: "artist-2", curatorUserId: "curator-2" },
    ]);
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockUpdate.mockResolvedValue({});
    mockCreate.mockResolvedValue({});

    const result = await runSlaSweeper();

    expect(result.processed).toBe(2);
    expect(mockRefundCredit).toHaveBeenCalledTimes(2);
    expect(mockRefundCredit).toHaveBeenCalledWith("artist-1", "sub-1");
    expect(mockRefundCredit).toHaveBeenCalledWith("artist-2", "sub-2");
  });

  it("skips already-processed submissions (idempotent)", async () => {
    mockFindMany.mockResolvedValue([
      { id: "sub-1", artistUserId: "artist-1", curatorUserId: "curator-1" },
    ]);
    mockUpdateMany.mockResolvedValue({ count: 0 });

    const result = await runSlaSweeper();

    expect(result.processed).toBe(1);
    expect(mockRefundCredit).not.toHaveBeenCalled();
  });
});
