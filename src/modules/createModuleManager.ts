import { Ora } from "ora";
import fs, { existsSync } from "fs";
import asyncFs from "fs/promises";
import path from "path";
import { getAvailableModuleNames, log } from "../utils/index.js";
import chalk from "chalk";
import { pathToFileURL } from "url";
import IModule from "../interface/IModule.js";

const createModuleManager = async () => {
  const modules: { [key: string]: IModule } = {};
  let initialized: boolean = false;

  const initializeModules = async (directory: string) => {
    if (initialized) return;
    const files = fs.readdirSync(directory);
    for (const file of files) {
      if (file.endsWith(".js")) {
        const modulePath = path.join(directory, file);
        const fileUrl = pathToFileURL(modulePath);
        const moduleImport = await import(fileUrl.href);
        if (moduleImport.default) {
          const moduleName = moduleImport.default.name;
          modules[moduleName] = moduleImport.default;
        }
      }
    }
    initialized = true;
  };

  const add = async (moduleName: string, spinner: Ora): Promise<void> => {
    const module = modules[moduleName];
    if (module) {
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
      const phizyConfig = JSON.parse(
        await asyncFs.readFile(phizyConfigPath, "utf8")
      );

      if (phizyConfig.modules.includes(moduleName)) {
        spinner.fail(
          `Module "${chalk.bold(
            moduleName
          )}" is already installed in this project`
        );
        process.exit(1);
      }

      try {
        await module.initialize(spinner);
        phizyConfig.modules.push(moduleName);
        spinner.succeed(
          `Module "${chalk.bold(moduleName)}" added successfully.`
        );
      } catch (err) {
        spinner.fail(`Failed to add module "${moduleName}".`);
        log.error((err as Error).message);
      }
    } else {
      const availableModuleNames = await getAvailableModuleNames();
      spinner.fail(`Module "${chalk.bold(moduleName)}" is not supported.`);
      console.log(
        chalk.yellow(
          `Available modules: ${availableModuleNames
            .map((m) => chalk.cyan(m))
            .join(", ")}`
        )
      );
      process.exit(1);
    }
  };

  const remove = async (moduleName: string, spinner: Ora): Promise<void> => {
    const module = modules[moduleName];
    if (module) {
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
      const phizyConfig = JSON.parse(
        await asyncFs.readFile(phizyConfigPath, "utf8")
      );

      if (!phizyConfig.modules.includes(moduleName)) {
        spinner.fail(
          `Module "${chalk.bold(moduleName)}" is not installed in this project`
        );
        process.exit(1);
      }

      try {
        await module.remove(spinner);
        phizyConfig.modules = phizyConfig.modules.filter(
          (module: string) => module !== moduleName
        );
        spinner.succeed(
          `Module ${chalk.bold(moduleName)} removed successfully.`
        );
      } catch (err) {
        spinner.fail(`Failed to remove module "${chalk.bold(moduleName)}".`);
      }
    } else {
      throw new Error(`Module "${chalk.bold(moduleName)}" not found.`);
    }
  };

  return {
    initializeModules,
    add,
    remove,
  };
};

export default createModuleManager;
