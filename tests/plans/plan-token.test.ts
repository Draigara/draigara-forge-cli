import { describe, expect, it } from "vitest";
import { PlanTokenService } from "../../src/plans/plan-token.js";

describe("PlanTokenService", () => {
  it("detects changes to an approved installation plan", () => {
    const service = new PlanTokenService(Buffer.alloc(32, 7));
    const plan = {
      repositoryRoot: "C:/repo",
      marketplaceId: "draigara-openapm",
      packages: ["forge-plugin@draigara-openapm"],
      apmStateDigest: "apm-state",
      gitStateDigest: "git-state",
      expiresAt: "2026-07-19T12:05:00.000Z"
    };
    const token = service.issue(plan);

    expect(service.verify(token, new Date("2026-07-19T12:00:00.000Z"))).toEqual(plan);
    expect(() => service.verify(`${token.slice(0, -1)}x`, new Date("2026-07-19T12:00:00.000Z"))).toThrow("invalid");
    expect(() => service.verify(token, new Date("2026-07-19T12:06:00.000Z"))).toThrow("expired");
  });
});
