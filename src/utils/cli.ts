import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "./logger.js";

export const getVersion = async (): Promise<string> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const cliPackageJsonPath = path.join(__dirname, "../../package.json");
  const cliPackageJson = JSON.parse(
    await fs.readFile(cliPackageJsonPath, "utf8")
  );
  return cliPackageJson.version;
};

export const getAvailableModuleNames = async (): Promise<string[]> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const modulesDir = path.join(__dirname, "../commands/modules");

  try {
    const entries = await fs.readdir(modulesDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".js"))
      .map((e) => e.name.replace(/\.js$/, ""));
  } catch (error) {
    log.error(`Failed to read modules directory: ${(error as Error).message}`);
    return [];
  }
};
