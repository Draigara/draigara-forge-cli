import { describe, expect, it } from "vitest";
import { reconcileMarketplaces } from "../../src/marketplaces/reconcile.js";

describe("reconcileMarketplaces", () => {
  it("distinguishes managed, unmanaged, missing, and conflicting registrations", () => {
    const result = reconcileMarketplaces(
      [
        { id: "managed", source: "https://example.test/managed" },
        { id: "missing", source: "https://example.test/missing" },
        { id: "conflict", source: "https://example.test/expected" }
      ],
      [
        { id: "managed", source: "https://example.test/managed" },
        { id: "unmanaged", source: "https://example.test/unmanaged" },
        { id: "conflict", source: "https://example.test/actual" }
      ]
    );

    expect(result.map(({ id, status }) => ({ id, status }))).toEqual([
      { id: "conflict", status: "conflicting" },
      { id: "managed", status: "managed" },
      { id: "missing", status: "missing" },
      { id: "unmanaged", status: "unmanaged" }
    ]);
  });
});
