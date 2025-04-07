import chalk from "chalk";
import ora from "ora";
import path from "path";
import { log, getAvailableModuleNames } from "../utils/index.js";
import { fileURLToPath, pathToFileURL } from "url";
import { existsSync } from "fs";
import fs from "fs/promises";

export default async function add(moduleName: string): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const spinner = ora(`Adding module: ${moduleName}...`).start();

  try {
    const currentDir = process.cwd();
    const phizyConfigPath = path.join(currentDir, ".phizy-stack.json");

    if (!existsSync(phizyConfigPath)) {
      spinner.fail("Not in a valid phizy-stack project directory");
      log.error(
        "This command must be run from within a project created by phizy-stack"
      );
      log.info(
        `To create a new project, run: ${chalk.bold(
          "phizy-stack create <project-name>"
        )}`
      );
      process.exit(1);
    }

    const phizyConfig = JSON.parse(await fs.readFile(phizyConfigPath, "utf8"));

    if (phizyConfig.modules.includes(moduleName)) {
      spinner.fail(
        `Module "${moduleName}" is already installed in this project`
      );
      process.exit(1);
    }

    const availableModuleNames = await getAvailableModuleNames();

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

    const modulePath = path.join(__dirname, `modules/${moduleName}`);
    try {
      const moduleURL = pathToFileURL(`${modulePath}.js`).href;
      const moduleImport = await import(moduleURL);
      const moduleFunction = moduleImport.default;

      if (typeof moduleFunction === "function") {
        await moduleFunction(spinner);
        phizyConfig.modules.push(moduleName);
        await fs.writeFile(
          phizyConfigPath,
          JSON.stringify(phizyConfig, null, 2)
        );
        spinner.succeed(`Module ${chalk.bold(moduleName)} added successfully.`);
      } else {
        spinner.fail(`Module "${moduleName}" does not export a function.`);
      }
    } catch (err) {
      spinner.fail(`Failed to execute module "${moduleName}".`);
      log.error((err as Error).message);
    }
  } catch (err) {
    spinner.fail("Failed to add module.");
    log.error((err as Error).message);
  }
}
