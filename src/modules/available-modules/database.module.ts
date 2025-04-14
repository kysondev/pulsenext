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

const DatabaseModule: IModule = {
  name: "database",
  initialize: async (spinner: Ora): Promise<void> => {
    const execAsync = promisify(exec);
    try {
      spinner.text = "Installing Prisma packages...";
      await execAsync("npm i prisma @prisma/client");

      spinner.text = "Initializing Prisma...";
      await execAsync("npx prisma init");

      spinner.text = "Copying database templates...";
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const templateDir = path.join(
        __dirname,
        "../../../templates/modules/database"
      );
      const targetDir = process.cwd();

      if (!fs.existsSync(templateDir)) {
        throw new Error("Database template directory not found");
      }

      await copyDir(templateDir, targetDir);

      console.log(chalk.cyan("\nNext steps:\n"));
      console.log(
        chalk.cyan(
          "1. Open your `.env` file and set the `DATABASE_URL` to your PostgreSQL connection string. For example:\n"
        )
      );
      console.log(
        chalk.bold(
          '   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"\n'
        )
      );

      console.log(
        chalk.cyan(
          "2. After setting the DATABASE_URL, run the following commands:\n"
        )
      );
      console.log(chalk.bold("   npx prisma migrate dev --name init"));
      console.log(chalk.bold("   npx prisma generate\n"));
    } catch (error) {
      spinner.fail(`Database setup failed: ${(error as Error).message}`);
      throw error;
    }
  },
  remove: async (spinner: Ora): Promise<void> => {
    const execAsync = promisify(exec);
    const targetDir = process.cwd();
    const libDir = path.join(targetDir, "lib");
    const prismaDir = path.join(targetDir, "prisma");
    const prismaFile = path.join(libDir, "prisma.ts");
    const envFilePath = path.join(process.cwd(), ".env");
    const pendingDeletes = [];

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

      spinner.start("Removing Prisma packages...");
      await execAsync("npm uninstall prisma @prisma/client");

      pendingDeletes.forEach((item) => {
        fs.rmSync(item, { recursive: true });
      });

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

export default DatabaseModule;
