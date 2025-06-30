import { Ora } from "ora";

export default interface IModule {
  name: string;
  dependencies?: string[];
  initialize(spinner: Ora): Promise<string | undefined>;
  remove(spinner: Ora): Promise<void>;
}
