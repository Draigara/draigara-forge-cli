import { spawn } from "node:child_process";

export interface ProcessRequest {
  readonly file: string;
  readonly arguments: readonly string[];
  readonly cwd?: string;
  readonly environment?: NodeJS.ProcessEnv;
  readonly timeoutMs: number;
  readonly maxOutputBytes: number;
  readonly signal?: AbortSignal;
}

export interface ProcessResult {
  readonly exitCode: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut: boolean;
  readonly cancelled: boolean;
}

export class ProcessOutputLimitError extends Error {
  public constructor(limit: number) {
    super(`Child process output exceeded ${limit} bytes.`);
    this.name = "ProcessOutputLimitError";
  }
}

export async function runProcess(request: ProcessRequest): Promise<ProcessResult> {
  return await new Promise<ProcessResult>((resolve, reject) => {
    let timedOut = false;
    let cancelled = false;
    let settled = false;
    let outputBytes = 0;
    const child = spawn(request.file, [...request.arguments], {
      cwd: request.cwd,
      env: request.environment,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    const terminate = () => child.kill("SIGKILL");
    const capture = (destination: Buffer[]) => (chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes > request.maxOutputBytes) {
        settled = true;
        terminate();
        reject(new ProcessOutputLimitError(request.maxOutputBytes));
        return;
      }
      destination.push(chunk);
    };
    child.stdout.on("data", capture(stdout));
    child.stderr.on("data", capture(stderr));
    const timeout = setTimeout(() => {
      timedOut = true;
      terminate();
    }, request.timeoutMs);
    const onAbort = () => {
      cancelled = true;
      terminate();
    };
    request.signal?.addEventListener("abort", onAbort, { once: true });
    child.once("error", (error) => {
      clearTimeout(timeout);
      request.signal?.removeEventListener("abort", onAbort);
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    child.once("close", (exitCode) => {
      clearTimeout(timeout);
      request.signal?.removeEventListener("abort", onAbort);
      if (settled) return;
      settled = true;
      resolve({
        exitCode,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
        timedOut,
        cancelled
      });
    });
  });
}
