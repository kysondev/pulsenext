import chalk from "chalk";
import { getAvailableModuleNames, log } from "../utils.js";

export default async function modules() {
  const availableModuleNames = await getAvailableModuleNames();

  if (availableModuleNames.length === 0) {
    log.info("No modules are currently available.");
    return;
  }

  log.info("Available modules:");
  availableModuleNames.forEach((module) => {
    console.log(chalk.cyan(`- ${module}`));
  });
}
