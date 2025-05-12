// Imports required modules for file handling, CLI interactions, and utilities
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { copyDir, log } from "../../utils/index.js";
import chalk from "chalk";
import { promisify } from "util";
import { Ora } from "ora";
import IModule from "../../interface/IModule.js";
import readline from "readline";

// Defines the "database" module with initialize and remove functions
const DatabaseModule: IModule = {
  name: "database",

  // Sets up Prisma in the project (installation, initialization, template copying)
  initialize: async (spinner: Ora): Promise<void> => {
    const execAsync = promisify(exec);
    try {
      spinner.text = "Installing Prisma packages...";
      await execAsync("npm i prisma @prisma/client");

      spinner.text = "Initializing Prisma...";
      await execAsync("npx prisma init");

      spinner.text = "Copying database templates...";
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const templateDir = path.join(__dirname, "../../../templates/modules/database");
      const targetDir = process.cwd();

      if (!fs.existsSync(templateDir)) {
        throw new Error("Database template directory not found");
      }

      await copyDir(templateDir, targetDir);

      // Outputs next steps for user to finalize Prisma setup
      console.log(chalk.cyan("\nNext steps:\n"));
      console.log(chalk.cyan("1. Set your DATABASE_URL in the `.env` file."));
      console.log(chalk.bold('   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"\n'));
      console.log(chalk.cyan("2. Run the Prisma migration and generate commands:\n"));
      console.log(chalk.bold("   npx prisma migrate dev --name init"));
      console.log(chalk.bold("   npx prisma generate\n"));
    } catch (error) {
      spinner.fail(`Database setup failed: ${(error as Error).message}`);
      throw error;
    }
  },

  // Removes Prisma setup from the project
  remove: async (spinner: Ora): Promise<void> => {
    const execAsync = promisify(exec);
    const targetDir = process.cwd();
    const libDir = path.join(targetDir, "lib");
    const prismaDir = path.join(targetDir, "prisma");
    const prismaFile = path.join(libDir, "prisma.ts");
    const envFilePath = path.join(process.cwd(), ".env");
    const pendingDeletes = [];

    // Identify files and directories to remove
    if (fs.existsSync(libDir)) {
      const files = fs.readdirSync(libDir);
      if (files.length === 1 && files[0] === "prisma.ts") {
        pendingDeletes.push(libDir);
      } else if (files.includes("prisma.ts")) {
        pendingDeletes.push(prismaFile);
      }
    }

    if (fs.existsSync(prismaDir)) {
      pendingDeletes.push(prismaDir);
    }

    // Determine if .env file contains only DATABASE_URL or needs line removal
    let envModification = null;
    if (fs.existsSync(envFilePath)) {
      const envFileContent = fs.readFileSync(envFilePath, "utf-8");
      const lines = envFileContent
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"));
      if (lines.length === 1 && lines[0]?.startsWith("DATABASE_URL=")) {
        pendingDeletes.push(envFilePath);
      } else if (lines.some((line) => line.startsWith("DATABASE_URL="))) {
        envModification = "Remove DATABASE_URL line from .env file";
      }
    }

    spinner.stop();

    // Display summary of items to remove and ask for user confirmation
    log.info(chalk.bold("The following will be removed:"));
    log.info("- Packages: prisma, @prisma/client");
    pendingDeletes.forEach((item) => log.info(`- ${item}`));
    if (envModification) log.info(`- ${envModification}`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        rl.question("Continue with removal? (y/N): ", (answer: string) => {
          resolve(answer.toLowerCase() === "y");
          rl.close();
        });
      });

      if (!confirmed) {
        log.info("Removal cancelled.");
        process.exit(0);
      }

      // Perform removal of packages and files
      spinner.start("Removing Prisma packages...");
      await execAsync("npm uninstall prisma @prisma/client");

      pendingDeletes.forEach((item) => {
        fs.rmSync(item, { recursive: true });
      });

      // Clean DATABASE_URL from .env if needed
      if (envModification && fs.existsSync(envFilePath)) {
        const envFileContent = fs.readFileSync(envFilePath, "utf-8");
        const updatedLines = envFileContent
          .split("\n")
          .filter((line) => !line.startsWith("DATABASE_URL="));
        fs.writeFileSync(envFilePath, updatedLines.join("\n") + "\n");
      }
    } catch (error) {
      spinner.fail(`Database removal failed: ${(error as Error).message}`);
      throw error;
    }
  },
};

// Export the module for use in the system
export default DatabaseModule;
