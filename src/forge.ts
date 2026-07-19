import { createForgeProgram } from "./cli.js";

const program = createForgeProgram();

process.once("SIGINT", () => {
  process.exitCode = 130;
});

await program.parseAsync(process.argv);
