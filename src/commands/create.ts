import ora from "ora";
import { existsSync } from "fs";
import path from "path";
import chalk from "chalk";
import { copyDir, log } from "../utils.js";
import { promisify } from "util";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs/promises";

export default async function create(projectName: string) {
  const execAsync = promisify(exec);
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const spinner = ora("Creating new Phizy Stack project...").start();
  try {
    const baseTemplateDir = path.join(__dirname, "../../templates/base");
    const projectDir = path.resolve(projectName);

    if (existsSync(projectDir)) {
      spinner.fail("Directory already exists.");
      process.exit(1);
    }

    await copyDir(baseTemplateDir, projectDir);

    const packageJsonPath = path.join(projectDir, "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
    packageJson.name = projectName;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    const packageLockJsonPath = path.join(projectDir, "package-lock.json");
    const packageLockJson = JSON.parse(
      await fs.readFile(packageLockJsonPath, "utf8")
    );
    packageLockJson.name = projectName;
    if (packageLockJson.dependencies) {
      for (const dep in packageLockJson.dependencies) {
        if (packageLockJson.dependencies[dep].hasOwnProperty("version")) {
          packageLockJson.dependencies[dep].name = projectName;
        }
      }
    }
    await fs.writeFile(
      packageLockJsonPath,
      JSON.stringify(packageLockJson, null, 2)
    );

    spinner.text = "Installing dependencies...";
    await execAsync("npm install", { cwd: projectDir });
    spinner.succeed(`Project ${chalk.bold(projectName)} created successfully.`);
    log.success("Dependencies installed.");
    log.info("Next steps:");
    log.info(`1. Run ${chalk.bold(`cd ${projectName}`)}`);
    log.info(`2. Run ${chalk.bold("npm run dev")}`);
    log.info("3. Happy coding!");
  } catch (err) {
    spinner.fail("Failed to create project.");
    log.error((err as Error).message);
  }
}
