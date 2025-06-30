import { Ora } from "ora";
import IModule from "../../interface/IModule.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  askUser,
  copyDir,
  runCommand,
  cleanupModuleResources,
} from "../../utils/index.js";
import chalk from "chalk";

const targetDir = process.cwd();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AuthModule: IModule = {
  name: "auth",
  dependencies: ["database", "email"],
  initialize: async (spinner: Ora): Promise<string | undefined> => {
    try {
      const prismaSchemaPath = path.join(targetDir, "prisma", "schema.prisma");
      if (fs.existsSync(prismaSchemaPath)) {
        const answer = await askUser(
          "\n⚠️  Warning: The auth module will modify your Prisma schema. Do you want to continue? (y/N) "
        );

        if (!answer) {
          spinner.fail("Auth module installation cancelled by user");
          return;
        }
      }

      const shouldProceed = await askUser(
        "\nThe auth module will install the following packages:\n" +
          "- better-auth\n" +
          "- argon2\n" +
          "- react-hot-toast\n" +
          "Do you want to proceed? (y/N) "
      );

      if (!shouldProceed) {
        spinner.fail("Auth module installation cancelled by user");
        return;
      }

      await runCommand(
        spinner,
        "npm i better-auth argon2 react-hot-toast",
        "Installing auth packages..."
      );

      spinner.text = "Copying auth templates...";
      const templateDir = path.join(
        __dirname,
        "../../../templates/modules/auth"
      );
      if (!fs.existsSync(templateDir)) {
        throw new Error("Auth template directory not found");
      }

      await copyDir(templateDir, targetDir);

      const layoutPath = path.join(targetDir, "app", "layout.tsx");
      if (fs.existsSync(layoutPath)) {
        let layoutContent = fs.readFileSync(layoutPath, "utf-8");

        if (!layoutContent.includes("import { Toaster }")) {
          layoutContent = layoutContent.replace(
            'import "./globals.css";',
            'import "./globals.css";\nimport { Toaster } from "react-hot-toast";'
          );
        }

        if (!layoutContent.includes("<Toaster")) {
          layoutContent = layoutContent.replace(
            "<body className={`antialiased`}>",
            '<body className={`antialiased`}>\n        <div>\n          <Toaster\n            toastOptions={{ style: { background: "#232323", color: "#fff" } }}\n          />\n        </div>'
          );
        }

        fs.writeFileSync(layoutPath, layoutContent);
      }

      const envPath = path.join(targetDir, ".env");
      const envContent = `
# App Configuration
APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
`;

      if (fs.existsSync(envPath)) {
        fs.appendFileSync(envPath, envContent);
      } else {
        fs.writeFileSync(envPath, envContent);
      }

      const finalSteps = [
        chalk.bold(
          "   # App Configuration\n" +
            '   APP_NAME="Your App Name"\n' +
            '   NEXT_PUBLIC_APP_URL="http://localhost:3000"\n' +
            '   BETTER_AUTH_SECRET="your-secret-key-here"\n\n' +
            "   # OAuth Providers (Optional)\n" +
            '   GITHUB_CLIENT_ID="your-github-client-id"\n' +
            '   GITHUB_CLIENT_SECRET="your-github-client-secret"\n' +
            '   GOOGLE_CLIENT_ID="your-google-client-id"\n' +
            '   GOOGLE_CLIENT_SECRET="your-google-client-secret"\n'
        ),
        chalk.cyan(
          "\n2. After setting the environment variables, run the following command:\n"
        ),
        chalk.bold("   npx prisma generate\n"),
      ];
      return finalSteps.join("\n");
    } catch (error) {
      spinner.fail(`Auth setup failed: ${(error as Error).message}`);
      throw error;
    }
  },
  remove: async (spinner: Ora): Promise<void> => {
    try {
      const directoriesToRemove = [
        "app/api/auth",
        "app/auth",
        "services/auth",
        "prisma/auth",
        "lib/auth",
        "lib/validations",
        "components/auth",
      ];

      const filesToRemove = [
        "middleware.ts",
        "lib/validations/auth.schema.ts",
        "lib/auth.ts",
        "lib/auth-client.ts",
        "lib/resend.ts",
        "lib/routes.ts",
        "services/user.service.ts",
        "components/ui/loading.tsx",
        "actions/auth.action.ts",
        "public/github.svg",
        "public/google.svg",
      ];

      const packagesToRemove = ["better-auth", "argon2", "react-hot-toast"];

      const envKeysToRemove = [
        "APP_NAME",
        "NEXT_PUBLIC_APP_URL",
        "BETTER_AUTH_SECRET",
        "GITHUB_CLIENT_ID",
        "GITHUB_CLIENT_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
      ];

      await cleanupModuleResources({
        spinner,
        packages: packagesToRemove,
        filesToDelete: [...directoriesToRemove, ...filesToRemove],
        envFilePath: ".env",
        envKeyToRemove: envKeysToRemove.join(","),
      });

      const layoutPath = path.join(targetDir, "app", "layout.tsx");
      if (fs.existsSync(layoutPath)) {
        try {
          let layoutContent = fs.readFileSync(layoutPath, "utf-8");
          layoutContent = layoutContent.replace(
            /import\s*{\s*Toaster\s*}\s*from\s*["']react-hot-toast["'];\n?/g,
            ""
          );
          layoutContent = layoutContent.replace(
            /<div>\s*<Toaster[^>]*\/>\s*<\/div>/g,
            ""
          );
          layoutContent = layoutContent.replace(/\n{3,}/g, "\n\n");
          fs.writeFileSync(layoutPath, layoutContent);
          spinner.succeed("Removed Toaster from layout");
        } catch (error) {
          spinner.warn(
            `Failed to remove Toaster from layout: ${(error as Error).message}`
          );
        }
      }
    } catch (error) {
      spinner.fail(`Auth removal failed: ${(error as Error).message}`);
      throw error;
    }
  },
};

export default AuthModule;
