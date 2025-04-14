import ora from "ora";
import {
  getAvailableModuleNames,
  initializeModules,
  log,
} from "../utils/index.js";
import createModuleManager from "../modules/createModuleManager.js";

export default async function remove(moduleName: string): Promise<void> {
  const spinner = ora(`Removing module: ${moduleName}...`).start();

  try {
    const availableModules = await getAvailableModuleNames();
    const moduleFound = availableModules.filter(
      (module) => module === moduleName
    );
    if (moduleFound) {
      const moduleManager = await createModuleManager();
      await initializeModules(moduleManager);
      await moduleManager.remove(moduleName, spinner);
    } else {
      spinner.fail(`Module "${moduleName}" is not supported.`);
    }
  } catch (err) {
    log.error((err as Error).message);
  }
}
