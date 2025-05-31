import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export const getVersion = async (): Promise<string> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const cliPackageJsonPath = path.join(__dirname, "../../package.json");
  const cliPackageJson = JSON.parse(
    await fs.readFile(cliPackageJsonPath, "utf8")
  );
  return cliPackageJson.version;
};
