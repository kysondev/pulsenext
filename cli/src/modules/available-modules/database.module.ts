import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  cleanupModuleResources,
  copyDir,
  runCommand,
} from "../../utils/index.js";
import chalk from "chalk";
import { Ora } from "ora";
import IModule from "../../interface/IModule.js";
const targetDir = process.cwd();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DatabaseModule: IModule = {
  name: "database",
  initialize: async (spinner: Ora): Promise<string | undefined> => {
    try {
      await runCommand(
        spinner,
        "npm i @prisma/client",
        "Installing Prisma packages..."
      );
      await runCommand(spinner, "npx prisma init", "Initializing Prisma...");
      spinner.text = "Copying database templates...";
      const templateDir = path.join(
        __dirname,
        "../../../templates/modules/database"
      );
      if (!fs.existsSync(templateDir)) {
        throw new Error("Database template directory not found");
      }

      await copyDir(templateDir, targetDir);

      const finalSteps = [
        chalk.cyan(
          "1. Open your `.env` file and set the `DATABASE_URL` to your PostgreSQL connection string. For example:\n"
        ),
        chalk.bold(
          '   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"\n'
        ),
        chalk.cyan(
          "2. After setting the DATABASE_URL, run the following commands:\n"
        ),
        chalk.bold("   npx prisma migrate dev --name init"),
        chalk.bold("   npx prisma generate\n"),
      ];
      return finalSteps.join("\n");
    } catch (error) {
      spinner.fail(`Database setup failed: ${(error as Error).message}`);
      throw error;
    }
  },
  remove: async (spinner: Ora): Promise<void> => {
    const libDir = path.join(targetDir, "lib");
    const prismaDir = path.join(targetDir, "prisma");
    const prismaFile = path.join(libDir, "prisma.ts");
    try {
      await cleanupModuleResources({
        spinner,
        packages: ["@prisma/client", "prisma"],
        filesToDelete: [prismaDir, prismaFile],
        envFilePath: ".env",
        envKeyToRemove: "DATABASE_URL",
      });
    } catch (error) {
      spinner.fail(`Database removal failed: ${(error as Error).message}`);
      throw error;
    }
  },
};

export default DatabaseModule;
