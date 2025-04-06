import chalk from "chalk";
import ora from "ora";
import path from "path";
import { existsSync } from "fs";
import { copyDir, getAvailableModuleNames, log } from "../utils.js";
import { fileURLToPath } from "url";
export default async function add(moduleName: string): Promise<void> {
  const availableModuleNames = await getAvailableModuleNames();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const spinner = ora(`Adding module: ${moduleName}...`).start();

  try {
    if (!availableModuleNames.includes(moduleName)) {
      spinner.fail(`Module "${moduleName}" is not supported.`);
      console.log(
        chalk.yellow(
          `Available modules: ${availableModuleNames
            .map((m) => chalk.cyan(m))
            .join(", ")}`
        )
      );
      process.exit(1);
    }

    const moduleDir = path.join(
      __dirname,
      `../../templates/modules/${moduleName}`
    );
    const targetDir = process.cwd();

    if (!existsSync(moduleDir)) {
      spinner.fail(`Module "${moduleName}" does not exist in templates.`);
      process.exit(1);
    }

    await copyDir(moduleDir, targetDir);
    spinner.succeed(`Module ${chalk.bold(moduleName)} added successfully.`);
  } catch (err) {
    spinner.fail("Failed to add module.");
    log.error((err as Error).message);
  }
}
