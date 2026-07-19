import { Chalk } from "chalk";

export interface BrandRenderOptions {
  readonly columns: number;
  readonly color: boolean;
  readonly interactive: boolean;
}

const wideLogo = `      ▄██████▄       DRAIGARA
   ▄██▀      ▀██▄    FORGE
  ██▀   ▄▄▄    ▀██
  ██   ██▀██     ██
  ▀██▄  ▀▀▀   ▄██▀
    ▀██████████▀──╮
       ▀▀▀▀▀    ╰─`;

const compactLogo = ` ▄████▄  Draigara Forge
 ██  ▀██▄
 ▀█████▀─╮
    ▀▀  ╰─`;

const draig = `       ╱╲      ╱╲
     ╭─╯ ╰────╯ ╰─╮
  ╭──┤   ●    ●   ├──╮
  ╰╮ │      ▴     │ ╭╯
   ╰─┤   ╰────╯   ├─╯
     ╰╮  ╭──╮  ╭╯
      ╰──╯  ╰──╯`;

export function renderBrand(options: BrandRenderOptions): string {
  if (!options.interactive) return "Draigara Forge";
  const art = options.columns >= 80 ? `${wideLogo}\n\n${draig}` : compactLogo;
  if (!options.color) return art;
  const chalk = new Chalk({ level: 1 });
  return chalk.hex("#F97316")(art);
}
