import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, rename, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";

export type ArtifactFetcher = (url: string, init: RequestInit) => Promise<Response>;

export interface ArtifactDownloadRequest {
  readonly url: string;
  readonly destination: string;
  readonly sha256: string;
  readonly fetcher?: ArtifactFetcher;
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}

export class ArtifactDigestError extends Error {
  public constructor() {
    super("Downloaded APM artifact did not match its embedded SHA-256 digest.");
    this.name = "ArtifactDigestError";
  }
}

export async function downloadVerifiedArtifact(request: ArtifactDownloadRequest): Promise<void> {
  const fetcher = request.fetcher ?? fetch;
  const maxBytes = request.maxBytes ?? 256 * 1024 * 1024;
  const init: RequestInit = request.signal
    ? { redirect: "error", signal: request.signal }
    : { redirect: "error" };
  const response = await fetcher(request.url, init);
  if (!response.ok) throw new Error(`APM artifact download failed with HTTP ${response.status}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw new Error(`APM artifact exceeds ${maxBytes} bytes.`);
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual.toLowerCase() !== request.sha256.toLowerCase()) throw new ArtifactDigestError();

  const directory = dirname(request.destination);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporary = join(directory, `.forge-artifact-${randomUUID()}.tmp`);
  const handle = await open(temporary, "wx", 0o700);
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(temporary, request.destination);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}
