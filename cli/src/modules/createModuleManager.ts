import { Ora } from "ora";
import fs, { existsSync } from "fs";
import asyncFs from "fs/promises";
import path from "path";
import { askUser, getAvailableModuleNames, log } from "../utils/index.js";
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
    const finalStepsMessages: string[] = [];
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
        if (module.dependencies && module.dependencies.length > 0) {
          spinner.stop();

          const newDependencies = module.dependencies.filter(
            (dependency) => !phizyConfig.modules.includes(dependency)
          );

          if (newDependencies.length > 0) {
            console.log(
              chalk.yellow("\nThe following dependencies will be installed:")
            );
            newDependencies.forEach((dependency) => {
              console.log(chalk.cyan(`- ${dependency}`));
            });

            const confirmInstall = await askUser(
              "Do you want to proceed with installation? (y/N): "
            );

            spinner.start();

            if (!confirmInstall) {
              spinner.fail(
                `Installation of "${chalk.bold(moduleName)}" cancelled by user.`
              );
              process.exit(0);
            }

            for (const dependency of newDependencies) {
              const dependencyModule = modules[dependency];
              if (dependencyModule) {
                try {
                  const depFinalSteps = await dependencyModule.initialize(spinner);
                  if (depFinalSteps) finalStepsMessages.push(depFinalSteps);
                  phizyConfig.modules.push(dependency);
                  await asyncFs.writeFile(
                    phizyConfigPath,
                    JSON.stringify(phizyConfig, null, 2)
                  );
                  spinner.succeed(
                    `Dependency "${chalk.bold(dependency)}" added successfully.`
                  );
                } catch (err) {
                  spinner.fail(`Failed to add dependency "${dependency}".`);
                  log.error((err as Error).message);
                  process.exit(1);
                }
              } else {
                spinner.fail(
                  `Dependency "${chalk.bold(dependency)}" not found.`
                );
                process.exit(1);
              }
            }
          }
        }

        const mainFinalSteps = await module.initialize(spinner);
        if (mainFinalSteps) finalStepsMessages.push(mainFinalSteps);
        phizyConfig.modules.push(moduleName);
        await asyncFs.writeFile(
          phizyConfigPath,
          JSON.stringify(phizyConfig, null, 2)
        );
        spinner.succeed(
          `Module "${chalk.bold(moduleName)}" added successfully.`
        );
        if (finalStepsMessages.length > 0) {
          console.log("\n====================\nNext steps:\n====================\n");
          const moduleOrder = [];
          if (module.dependencies && module.dependencies.length > 0) {
            module.dependencies.forEach(dep => {
              if (phizyConfig.modules.includes(dep)) moduleOrder.push(dep);
            });
          }
          moduleOrder.push(moduleName);
          moduleOrder.forEach((mod, idx) => {
            const msg = finalStepsMessages[idx];
            if (msg) {
              console.log(`[${mod}]`);
              console.log(msg + "\n");
            }
          });
        }
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

  const remove = async (
    moduleName: string,
    spinner: Ora,
    isDependency: boolean = false
  ): Promise<void> => {
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
        const dependentModules = phizyConfig.modules.filter(
          (installedModule: string) => {
            if (installedModule === moduleName) return false;
            const installedModuleConfig = modules[installedModule];
            return installedModuleConfig?.dependencies?.includes(moduleName);
          }
        );

        if (dependentModules.length > 0 && !isDependency) {
          spinner.stop();
          console.log(
            chalk.yellow("\nThe following modules depend on this module:")
          );
          dependentModules.forEach((dep: string) => {
            console.log(chalk.cyan(`- ${dep}`));
          });

          const modulesToRemove: string[] = [];
          for (const depModule of dependentModules) {
            const confirmRemoveDep = await askUser(
              `Do you want to remove "${chalk.bold(
                depModule
              )}" as well? (y/N): `
            );
            if (confirmRemoveDep) {
              modulesToRemove.push(depModule);
            }
          }

          spinner.start();

          for (const depModule of modulesToRemove) {
            await remove(depModule, spinner, true);
            phizyConfig.modules = phizyConfig.modules.filter(
              (module: string) => module !== depModule
            );
            await asyncFs.writeFile(
              phizyConfigPath,
              JSON.stringify(phizyConfig, null, 2)
            );
          }
        }

        if (
          module.dependencies &&
          module.dependencies.length > 0 &&
          !isDependency
        ) {
          const installedDependencies = module.dependencies.filter((dep) =>
            phizyConfig.modules.includes(dep)
          );

          if (installedDependencies.length > 0) {
            spinner.stop();
            console.log(
              chalk.yellow(
                "\nThis module has the following dependencies installed:"
              )
            );
            installedDependencies.forEach((dep: string) => {
              console.log(chalk.cyan(`- ${dep}`));
            });

            const depsToRemove: string[] = [];
            for (const dep of installedDependencies) {
              const confirmRemoveDep = await askUser(
                `Do you want to remove "${chalk.bold(dep)}" as well? (y/N): `
              );
              if (confirmRemoveDep) {
                depsToRemove.push(dep);
              }
            }

            spinner.start();

            for (const dep of depsToRemove) {
              await remove(dep, spinner, true);
              phizyConfig.modules = phizyConfig.modules.filter(
                (module: string) => module !== dep
              );
              await asyncFs.writeFile(
                phizyConfigPath,
                JSON.stringify(phizyConfig, null, 2)
              );
            }
          }
        }

        await module.remove(spinner);
        phizyConfig.modules = phizyConfig.modules.filter(
          (module: string) => module !== moduleName
        );
        await asyncFs.writeFile(
          phizyConfigPath,
          JSON.stringify(phizyConfig, null, 2)
        );
        spinner.succeed(
          `Module ${chalk.bold(moduleName)} removed successfully.`
        );
      } catch (err) {
        spinner.fail(`Failed to remove module "${chalk.bold(moduleName)}".`);
        log.error((err as Error).message);
        process.exit(1);
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
