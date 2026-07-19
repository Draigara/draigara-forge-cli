import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const planSchema = z.object({
  repositoryRoot: z.string().min(1).max(4096),
  marketplaceId: z.string().min(1).max(64),
  packages: z.array(z.string().min(1).max(2048)).max(128),
  apmStateDigest: z.string().min(1).max(256),
  gitStateDigest: z.string().min(1).max(256),
  expiresAt: z.string().datetime()
}).strict();

export type InstallationPlan = z.infer<typeof planSchema>;

export class PlanTokenService {
  public constructor(private readonly key: Buffer) {
    if (key.byteLength < 32) throw new Error("Plan token key must be at least 32 bytes.");
  }

  public issue(input: InstallationPlan): string {
    const plan = planSchema.parse(input);
    const payload = Buffer.from(JSON.stringify(plan), "utf8").toString("base64url");
    return `${payload}.${this.sign(payload)}`;
  }

  public verify(token: string, now = new Date()): InstallationPlan {
    const [payload, signature, extra] = token.split(".");
    if (payload === undefined || signature === undefined || extra !== undefined) throw new Error("Plan token is invalid.");
    const expected = Buffer.from(this.sign(payload));
    const actual = Buffer.from(signature);
    if (expected.byteLength !== actual.byteLength || !timingSafeEqual(expected, actual)) throw new Error("Plan token is invalid.");
    const plan = planSchema.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    if (Date.parse(plan.expiresAt) <= now.getTime()) throw new Error("Plan token is expired.");
    return plan;
  }

  private sign(payload: string): string {
    return createHmac("sha256", this.key).update(payload, "utf8").digest("base64url");
  }
}
