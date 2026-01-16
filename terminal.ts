import chalk from "chalk";

export const banner = () => {
  const art = [
    "========================================",
    "CLAUDE BACKROOMS",
    "========================================",
    "STATE: ACTIVE",
    "MODE: CONTAINMENT",
    "OUTPUT: INDEXED",
    "========================================",
  ].join("\n");
  return chalk.green(art);
};

export const ok = (s: string) => chalk.green(`✔ ${s}`);
export const warn = (s: string) => chalk.yellow(`! ${s}`);
export const err = (s: string) => chalk.red(`✖ ${s}`);
