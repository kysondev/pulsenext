import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { log } from "./logger.js";
import asyncFs from "fs/promises";
import fs from "fs";
import IModuleManager from "../interface/IModuleManager.js";
import { Ora } from "ora";
import { promisify } from "util";
import { exec } from "child_process";
import readline from "readline";
import chalk from "chalk";

export const getAvailableModuleNames = async (): Promise<string[]> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const modulesDir = path.join(__dirname, "../modules/available-modules");

  try {
    const entries = await asyncFs.readdir(modulesDir, { withFileTypes: true });
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

export const initializeModules = async (
  moduleManager: IModuleManager
): Promise<void> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const modulesDirectory = path.join(__dirname, "../modules/available-modules");
  await moduleManager.initializeModules(modulesDirectory);
};

export const runCommand = async (
  spinner: Ora,
  command: string,
  text?: string
): Promise<void> => {
  const execAsync = promisify(exec);
  try {
    if (text) {
      spinner.isSpinning ? (spinner.text = text) : spinner.start(text);
    }
    await execAsync(command);
  } catch (err) {
    log.error((err as Error).message);
    process.exit(1);
  }
};

export const askUser = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
};

export const cleanupModuleResources = async ({
  spinner,
  packages,
  filesToDelete,
  envFilePath,
  envKeyToRemove,
}: {
  spinner: Ora;
  packages: string[];
  filesToDelete: string[];
  envFilePath?: string;
  envKeyToRemove?: string;
}) => {
  spinner.stop();

  log.info(chalk.bold("The following will be removed:"));
  log.info(`- Packages: ${packages.join(", ")}`);
  filesToDelete.forEach((item) => log.info(`- ${item}`));
  if (envKeyToRemove) log.info(`- Remove ${envKeyToRemove} from .env`);

  const confirmed = await askUser("Continue with removal? (y/N): ");
  if (!confirmed) {
    log.info("Removal cancelled.");
    process.exit(0);
  }
  await runCommand(
    spinner,
    `npm uninstall ${packages.join(" ")}`,
    "Uninstalling packages..."
  );

  const potentialEmptyDirs = new Set<string>();

  const checkAndRemoveEmptyParentDir = async (dir: string) => {
    if (dir === "." || dir === "public") return;

    try {
      const dirContents = fs.readdirSync(dir);
      if (dirContents.length === 0) {
        spinner.stop();
        const confirmDirRemoval = await askUser(
          `Directory "${chalk.bold(dir)}" is now empty. Remove it? (y/N): `
        );
        if (confirmDirRemoval) {
          fs.rmdirSync(dir);
          const parentDir = path.dirname(dir);
          await checkAndRemoveEmptyParentDir(parentDir);
        }
      }
    } catch (error) {
      log.error(`Error checking directory ${dir}: ${error}`);
    }
  };

  filesToDelete.forEach((item) => {
    fs.rmSync(item, { recursive: true, force: true });

    const parentDir = path.dirname(item);
    if (parentDir !== "." && fs.existsSync(parentDir)) {
      potentialEmptyDirs.add(parentDir);
    }
  });

  for (const dir of potentialEmptyDirs) {
    await checkAndRemoveEmptyParentDir(dir);
  }

  if (envFilePath && envKeyToRemove && fs.existsSync(envFilePath)) {
    const keysToRemove = envKeyToRemove.split(",");
    const lines = fs
      .readFileSync(envFilePath, "utf-8")
      .split("\n")
      .filter((line) => {
        if (!line.trim() || line.trim().startsWith("#")) return true;
        return !keysToRemove.some((key) => line.trim().startsWith(`${key}=`));
      });
    fs.writeFileSync(envFilePath, lines.join("\n") + "\n");
  }
};

export const installDependencies = async (
  spinner: Ora,
  dependencies: string[]
): Promise<void> => {
  try {
    spinner.stop();
    log.info(
      "This module has dependencies, would you like to install them now?"
    );
    for (const dependency of dependencies) {
      log.info(`- ${dependency}`);
    }
    const confirmed = await askUser("Install dependencies? (y/N): ");
    if (confirmed) {
      for (const dependency of dependencies) {
        await runCommand(
          spinner,
          `pulsenext add ${dependency}`,
          "Installing dependencies..."
        );
      }
    }
  } catch (error) {
    log.error(`Failed to install dependencies: ${(error as Error).message}`);
    process.exit(0);
  }
};
