#!/usr/bin/env node
import { Command } from "commander";
import modules from "./commands/modules.js";
import add from "./commands/add.js";
import create from "./commands/create.js";
import remove from "./commands/remove.js";

const program = new Command();

program
  .name("pulsenext")
  .description("CLI to create and extend projects with the PulseNext")
  .version("0.1.0");

program
  .command("create")
  .argument("<project-name>", "Name of the new project")
  .description("Create a new project using the base template")
  .action(create);

program
  .command("add")
  .argument("<module-name>", "Name of the module to add")
  .description("Add a module to the current project from templates/modules")
  .action(add);

program
  .command("remove")
  .argument("<module-name>", "Name of the module to remove")
  .description("Remove a module from the current project")
  .action(remove);

program
  .command("modules")
  .description("List all available modules")
  .action(modules);

program.parse();
