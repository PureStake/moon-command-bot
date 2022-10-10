import { TaskFactory } from "../factory";
import { GovernanceTask, Network } from "./governance-task";
import { Argv as ApiNetworkConfig, getApiFor } from "moonbeam-tools";
import { TaskArguments } from "../task";
export { Argv as ApiNetworkConfig } from "moonbeam-tools";

export interface GovernanceFactoryConfig {
  networks: ApiNetworkConfig[];
}

export type GovernanceTaskArguments = TaskArguments & {
  positional: string[];
  options: {};
};

export class GovernanceFactory extends TaskFactory {
  private networkApis: Network[];

  constructor(keyword: string, { networks }: GovernanceFactoryConfig) {
    super(keyword);
    const networkPromises = networks.map((network) => getApiFor(network));

    this.isReady = Promise.all(networkPromises).then(async (apis) => {
      this.networkApis = await Promise.all(
        apis.map(async (api) => {
          return { api, name: (await api.rpc.system.chain()).toString() };
        })
      );
      return this;
    });
  }

  public createTask(id: number, args: GovernanceTaskArguments) {
    const networks =
      args.positional.length > 0
        ? args.positional
            .map((name) =>
              this.networkApis.find(
                (n) => n.name.toLocaleLowerCase() == name.toLocaleLowerCase()
              )
            )
            .filter((network) => !!network)
        : [...this.networkApis];

    if (networks.length == 0) {
      throw new Error(`Unknown networks: ${args.positional.join(", ")}`);
    }

    return new GovernanceTask(this.keyword, id, {
      networkApis: this.networkApis,
    });
  }

  destroy() {}
}
