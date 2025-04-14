import { Ora } from "ora";

export default interface IModuleManager {
  initializeModules: (directory: string) => Promise<void>;
  add: (moduleName: string, spinner: Ora) => Promise<void>;
  remove: (moduleName: string, spinner: Ora) => Promise<void>;
}
