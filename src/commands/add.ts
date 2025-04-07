import chalk from "chalk";
import ora from "ora";
import path from "path";
import { log, getAvailableModuleNames } from "../utils.js";
import { fileURLToPath, pathToFileURL } from "url";

export default async function add(moduleName: string): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const spinner = ora(`Adding module: ${moduleName}...`).start();

  try {
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
