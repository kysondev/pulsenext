import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { log } from "./logger.js";
import fs from "fs/promises";
import IModuleManager from "../interface/IModuleManager.js";

export const getAvailableModuleNames = async (): Promise<string[]> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const modulesDir = path.join(__dirname, "../modules/available-modules");

  try {
    const entries = await fs.readdir(modulesDir, { withFileTypes: true });
    const moduleNames: string[] = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".js")) {
        const modulePath = path.join(modulesDir, entry.name);
        const fileUrl = pathToFileURL(modulePath);
        const moduleImport = await import(fileUrl.href);
        if (moduleImport.default) {
          moduleNames.push(moduleImport.default.name);
        }
      }
    }

    return moduleNames;
  } catch (error) {
    log.error(`Failed to read modules directory: ${(error as Error).message}`);
    return [];
  }
};

export async function initializeModules(moduleManager: IModuleManager) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const modulesDirectory = path.join(__dirname, "../modules/available-modules");
  await moduleManager.initializeModules(modulesDirectory);
}
