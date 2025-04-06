import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export const log = {
  success: (msg: string) => console.log(chalk.green(`✔ ${msg}`)),
  error: (msg: string) => console.error(chalk.red(`✖ ${msg}`)),
  info: (msg: string) => console.log(chalk.cyan(`➤ ${msg}`)),
};

export const copyDir = async (src: string, dest: string) => {
  const entries = await fs.readdir(src, { withFileTypes: true });
  await fs.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
};

export const getAvailableModuleNames = async (): Promise<string[]> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const modulesDir = path.join(__dirname, "../templates/modules");

  try {
    const entries = await fs.readdir(modulesDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
};
