import { BotConfig } from "./config-types";

const prodConfig: BotConfig = {
  commander: { concurrentTasks: 1 },
  commands: {
    sample: { seconds: 10 },
    benchmark: {
      gitFolder: `${process.cwd()}/repos`,
      repos: {
        main: {
          name: "official",
          owner: process.env.MOONBEAM_REPO_OWNER,
          repo: process.env.MOONBEAM_REPO_NAME,
          installationId: process.env.MOONBEAM_INSTALLATION_ID,
          auth: {
            appId: process.env.MOONBEAM_APP_ID,
            clientId: process.env.MOONBEAM_CLIENT_ID,
            clientSecret: process.env.MOONBEAM_CLIENT_SECRET,
            privateKey: process.env.MOONBEAM_PRIVATE_KEY,
          },
        },
        fork: {
          name: "fork",
          owner: process.env.FORK_REPO_OWNER,
          repo: process.env.FORK_REPO_NAME,
          installationId: process.env.FORK_INSTALLATION_ID,
          auth: {
            appId: process.env.FORK_APP_ID,
            clientId: process.env.FORK_CLIENT_ID,
            clientSecret: process.env.FORK_CLIENT_SECRET,
            privateKey: process.env.FORK_PRIVATE_KEY,
          },
        },
      },
    },
    "fork-test": {
      dataFolder: `/tmp/fork-test`,
      gitFolder: `${process.cwd()}/repos`,
      repo: {
        name: "moonbeam",
        owner: process.env.MOONBEAM_REPO_OWNER,
        repo: process.env.MOONBEAM_REPO_NAME,
        installationId: process.env.MOONBEAM_INSTALLATION_ID,
        auth: {
          appId: process.env.MOONBEAM_APP_ID,
          clientId: process.env.MOONBEAM_CLIENT_ID,
          clientSecret: process.env.MOONBEAM_CLIENT_SECRET,
          privateKey: process.env.MOONBEAM_PRIVATE_KEY,
        },
      },
    },
  },
  history: { limit: 1000 },
  hooks: {
    http: { urlPrefix: "/api" },
    json: {
      urlPrefix: "/json",
      auth: { type: "secret", secret: "<change-me-for-production-usage>" },
    },
  },
  server: {
    serverUrl: "http://localhost:8000",
    listener: { port: 8000, hostname: "0.0.0.0" },
  },
};

export default prodConfig;
