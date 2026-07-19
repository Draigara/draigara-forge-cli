import { confirm, isCancel, multiselect, spinner } from "@clack/prompts";

export interface TargetChoice {
  readonly value: string;
  readonly label: string;
  readonly hint?: string;
  readonly selected: boolean;
}

export type SetupInteractionEvent =
  | { readonly kind: "brand"; readonly message: string }
  | { readonly kind: "task-start"; readonly message: string }
  | { readonly kind: "task-success"; readonly message: string }
  | { readonly kind: "task-error"; readonly message: string }
  | { readonly kind: "plan"; readonly message: string }
  | { readonly kind: "confirm"; readonly message: string }
  | { readonly kind: "select-targets"; readonly message: string }
  | { readonly kind: "info"; readonly message: string }
  | { readonly kind: "warning"; readonly message: string }
  | { readonly kind: "success"; readonly message: string };

export interface SetupInteraction {
  readonly interactive: boolean;
  showBrand(message: string): void;
  selectTargets(message: string, choices: readonly TargetChoice[]): Promise<readonly string[] | null>;
  confirm(message: string): Promise<boolean | null>;
  task<T>(message: string, operation: () => Promise<T>, success: (value: T) => string): Promise<T>;
  showPlan(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  success(message: string): void;
  snapshot(): { readonly stdout: string; readonly stderr: string };
}

export interface RecordingSetupInteractionOptions {
  readonly interactive: boolean;
  readonly confirmations?: readonly boolean[];
  readonly targetSelections?: readonly (readonly string[])[];
}

export class RecordingSetupInteraction implements SetupInteraction {
  public readonly events: SetupInteractionEvent[] = [];
  readonly #confirmations: boolean[];
  readonly #targetSelections: (readonly string[])[];
  #stdout = "";
  #stderr = "";

  public constructor(private readonly options: RecordingSetupInteractionOptions) {
    this.#confirmations = [...(options.confirmations ?? [])];
    this.#targetSelections = [...(options.targetSelections ?? [])];
  }

  public get interactive(): boolean { return this.options.interactive; }

  public showBrand(message: string): void {
    this.record("brand", message);
  }

  public async selectTargets(message: string, choices: readonly TargetChoice[]): Promise<readonly string[] | null> {
    this.events.push({ kind: "select-targets", message });
    return this.#targetSelections.shift() ?? choices.filter((choice) => choice.selected).map((choice) => choice.value);
  }

  public async confirm(message: string): Promise<boolean | null> {
    this.events.push({ kind: "confirm", message });
    return this.#confirmations.shift() ?? true;
  }

  public async task<T>(message: string, operation: () => Promise<T>, success: (value: T) => string): Promise<T> {
    this.record("task-start", message);
    try {
      const value = await operation();
      this.record("task-success", success(value));
      return value;
    } catch (error) {
      this.events.push({ kind: "task-error", message });
      throw error;
    }
  }

  public showPlan(message: string): void { this.record("plan", message); }
  public info(message: string): void { this.record("info", message); }
  public warning(message: string): void {
    this.events.push({ kind: "warning", message });
    this.#stderr += `${message}\n`;
  }
  public success(message: string): void { this.record("success", message); }

  public snapshot(): { readonly stdout: string; readonly stderr: string } {
    return { stdout: this.#stdout, stderr: this.#stderr };
  }

  private record(kind: Exclude<SetupInteractionEvent["kind"], "confirm" | "select-targets" | "task-error" | "warning">, message: string): void {
    this.events.push({ kind, message });
    this.#stdout += `${message}\n`;
  }
}

export interface ConsoleSetupInteractionOptions {
  readonly interactive: boolean;
  readonly stdout?: (message: string) => void;
  readonly stderr?: (message: string) => void;
}

export class ConsoleSetupInteraction implements SetupInteraction {
  readonly #stdout: (message: string) => void;
  readonly #stderr: (message: string) => void;

  public constructor(private readonly options: ConsoleSetupInteractionOptions) {
    this.#stdout = options.stdout ?? ((message) => process.stdout.write(message));
    this.#stderr = options.stderr ?? ((message) => process.stderr.write(message));
  }

  public get interactive(): boolean { return this.options.interactive; }

  public showBrand(message: string): void { this.#stdout(`${message}\n\n`); }

  public async selectTargets(message: string, choices: readonly TargetChoice[]): Promise<readonly string[] | null> {
    if (!this.interactive) return null;
    const selection = await multiselect({
      message,
      options: choices.map(({ value, label, hint }) => ({ value, label, ...(hint === undefined ? {} : { hint }) })),
      initialValues: choices.filter((choice) => choice.selected).map((choice) => choice.value),
      required: true
    });
    return isCancel(selection) ? null : selection;
  }

  public async confirm(message: string): Promise<boolean | null> {
    if (!this.interactive) return null;
    const answer = await confirm({ message, initialValue: true });
    return isCancel(answer) ? null : answer;
  }

  public async task<T>(message: string, operation: () => Promise<T>, success: (value: T) => string): Promise<T> {
    if (!this.interactive) {
      this.#stdout(`… ${message}\n`);
      const value = await operation();
      this.#stdout(`✓ ${success(value)}\n`);
      return value;
    }
    const progress = spinner();
    progress.start(message);
    try {
      const value = await operation();
      progress.stop(success(value));
      return value;
    } catch (error) {
      progress.error(`${message} failed`);
      throw error;
    }
  }

  public showPlan(message: string): void { this.#stdout(`${message}\n\n`); }
  public info(message: string): void { this.#stdout(`${message}\n`); }
  public warning(message: string): void { this.#stderr(`${message}\n`); }
  public success(message: string): void { this.#stdout(`${message}\n`); }
  public snapshot(): { readonly stdout: string; readonly stderr: string } { return { stdout: "", stderr: "" }; }
}
