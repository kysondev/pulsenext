import { Ora } from "ora";
import IModule from "../../interface/IModule.js";
import { cleanupModuleResources, runCommand } from "../../utils/modules.js";
import path from "path";
import fs from "fs";
import { copyDir } from "../../utils/filesystem.js";
import { fileURLToPath } from "url";
import chalk from "chalk";

const targetDir = process.cwd();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DatabaseModule: IModule = {
  name: "email",
  initialize: async (spinner: Ora): Promise<string | undefined> => {
    try {
      await runCommand(
        spinner,
        "npm i resend @react-email/components",
        "Installing Resend packages..."
      );
      spinner.text = "Copying email templates...";

      const templateDir = path.join(
        __dirname,
        "../../../templates/modules/email"
      );

      if (!fs.existsSync(templateDir)) {
        throw new Error("Email template directory not found");
      }

      await copyDir(templateDir, targetDir);

      const envPath = path.join(targetDir, ".env");
      const envContent = `
# Email Configuration
DEFAULT_EMAIL_SENDER_NAME="My App"
DEFAULT_EMAIL_SENDER_EMAIL="no-reply@example.com"
TWO_FA_EMAIL="2fa@example.com"
VERIFICATION_EMAIL="verification@example.com"
RESET_PASSWORD_EMAIL="reset-password@example.com"
RESEND_API_KEY="your-resend-api-key"
      `;

      if (fs.existsSync(envPath)) {
        fs.appendFileSync(envPath, envContent);
      } else {
        fs.writeFileSync(envPath, envContent);
      }

      const finalSteps = [
        chalk.cyan(
          "1. Open your `.env` file and set newly added environment variables. For example:\n"
        ),
        chalk.bold('   DEFAULT_EMAIL_SENDER_NAME="My App"\n'),
        chalk.bold('   DEFAULT_EMAIL_SENDER_EMAIL="email@example.com"\n'),
        chalk.bold('   TWO_FA_EMAIL="2fa@example.com"\n'),
        chalk.bold('   VERIFICATION_EMAIL="verification@example.com"\n'),
        chalk.bold('   RESET_PASSWORD_EMAIL="reset-password@example.com"\n'),
        chalk.bold('   RESEND_API_KEY="your-resend-api-key"\n'),
        chalk.bold('   2. Link your domain to Resend. (https://resend.com/emails)\n'),
        chalk.cyan("3. Use sendEmail function to send emails.\n"),
      ];
      return finalSteps.join("\n");
    } catch (error) {
      spinner.fail(`Email setup failed: ${(error as Error).message}`);
      throw error;
    }
  },
  remove: async (spinner: Ora): Promise<void> => {
    try {
      await runCommand(
        spinner,
        "npm uninstall resend",
        "Uninstalling Resend..."
      );

      const envKeysToRemove = [
        "DEFAULT_EMAIL_SENDER_NAME",
        "DEFAULT_EMAIL_SENDER_EMAIL",
        "TWO_FA_EMAIL",
        "VERIFICATION_EMAIL",
        "RESET_PASSWORD_EMAIL",
        "RESEND_API_KEY",
      ];

      await cleanupModuleResources({
        spinner,
        packages: ["resend", "@react-email/components"],
        filesToDelete: ["templates/emails", "lib/email.ts"],
        envFilePath: ".env",
        envKeyToRemove: envKeysToRemove.join(","),
      });
    } catch (error) {
      spinner.fail(`Email removal failed: ${(error as Error).message}`);
      throw error;
    }
  },
};

export default DatabaseModule;
