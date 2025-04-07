import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { copyDir } from "../../utils/index.js";
import chalk from "chalk";
import { promisify } from "util";
import { Ora } from "ora";

export default async function database(spinner: Ora) {
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
}
