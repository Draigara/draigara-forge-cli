import { Command, Option } from "commander";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createForgeMcpServer } from "./mcp/server.js";
import { runDoctor } from "./diagnostics/doctor.js";
import { runSetupCommand } from "./setup/setup-command.js";
import { forgeChannel, forgeCommit, forgeVersion } from "./build-identity.js";
import { runMarketplaceCommand, type CommandResult } from "./commands/marketplace-commands.js";
import { runPluginCommand } from "./commands/plugin-commands.js";

function addGlobalOptions(command: Command): Command {
  return command
    .option("--non-interactive", "Prohibit prompts and require explicit choices.")
    .option("--yes", "Authorize the complete displayed mutation plan.")
    .option("--verbose", "Show redacted diagnostic details.")
    .option("--no-color", "Disable ANSI color and styling.")
    .addOption(new Option("--target <target>", "Select a coding harness target.").argParser((value, previous: string[] = []) => [...previous, value]).default([]))
    .addOption(new Option("--marketplace <id=source>", "Register a marketplace during setup.").argParser((value, previous: string[] = []) => [...previous, value]).default([]));
}

function writeCommandResult(result: CommandResult): void {
  if (result.stdout.length > 0) process.stdout.write(result.stdout);
  if (result.stderr.length > 0) process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}

function addMarketplaceGroup(root: Command): void {
  const group = root.command("marketplace").description("Manage Forge-owned APM marketplaces.");
  group.command("add").argument("<id>").argument("<source>").option("--adopt", "Track an identical existing APM registration without taking ownership.").description("Add or explicitly adopt a marketplace.")
    .action(async (id: string, source: string, options: { adopt?: boolean }) => writeCommandResult(await runMarketplaceCommand({ kind: "add", id, source, adoptExisting: options.adopt === true })));
  group.command("list").description("List marketplace state.")
    .action(async () => writeCommandResult(await runMarketplaceCommand({ kind: "list" })));
  group.command("update").argument("<id>").description("Update a marketplace.")
    .action(async (id: string) => writeCommandResult(await runMarketplaceCommand({ kind: "update", id })));
  group.command("remove").argument("<id>").description("Remove a marketplace.")
    .action(async (id: string) => writeCommandResult(await runMarketplaceCommand({ kind: "remove", id })));
}

function addPluginGroup(root: Command): void {
  const group = root.command("plugin").description("Manage the global Forge APM plugin.");
  group.command("install").description("Install the Forge plugin globally.")
    .action(async (_options, command: Command) => {
      const options = command.optsWithGlobals<{ target: string[] }>();
      writeCommandResult(await runPluginCommand("install", options.target));
    });
  group.command("list").description("List global Forge plugin state.")
    .action(async () => writeCommandResult(await runPluginCommand("list", [])));
  group.command("update").description("Update the Forge plugin globally.")
    .action(async () => writeCommandResult(await runPluginCommand("update", [])));
  group.command("remove").description("Remove the Forge plugin from explicit targets.")
    .action(async (_options, command: Command) => {
      const options = command.optsWithGlobals<{ target: string[] }>();
      writeCommandResult(await runPluginCommand("remove", options.target));
    });
}

export function createForgeProgram(): Command {
  const root = addGlobalOptions(
    new Command()
      .name("forge")
      .description("Draigara Forge — low-friction Microsoft APM onboarding.")
      .version(`${forgeVersion} (${forgeChannel}, ${forgeCommit}, ${process.platform}-${process.arch})`)
      .showHelpAfterError()
  );

  root.command("setup")
    .description("Set up or reconcile Forge on this machine.")
    .action(async (_options, command: Command) => {
      const options = command.optsWithGlobals<{ nonInteractive?: boolean; target: string[]; marketplace: string[]; color: boolean; yes?: boolean }>();
      if (options.nonInteractive === true && options.target.length === 0) {
        process.stderr.write("Non-interactive setup requires at least one explicit --target.\n");
        process.exitCode = 3;
        return;
      }
      const result = await runSetupCommand({
        targets: options.target,
        marketplaces: options.marketplace,
        nonInteractive: options.nonInteractive === true,
        color: options.color,
        yes: options.yes === true
      });
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr);
      process.exitCode = result.exitCode;
    });
  addMarketplaceGroup(root);
  addPluginGroup(root);
  root.command("doctor")
    .description("Inspect Forge, APM, marketplace, target, and plugin health.")
    .action(async () => {
      const result = await runDoctor();
      process.stdout.write(`${result.lines.join("\n")}\n`);
      if (result.warnings.length > 0) process.stderr.write(`${result.warnings.join("\n")}\n`);
      process.exitCode = result.exitCode;
    });
  root.command("mcp", { hidden: true })
    .description("Run the Forge stdio MCP server.")
    .action(async () => {
      const server = createForgeMcpServer();
      await server.connect(new StdioServerTransport());
    });

  return root;
}
