import { createNodeMiddleware, Probot } from "probot";
import { Express } from "express";

import { Hook } from "./hook";
import Debug from "debug";
import yargs from "yargs";
import { GithubService, GithubServiceConfig } from "../services/github";
import { IssueCommentEvent } from "@octokit/webhooks-types";
import { GithubReporter } from "../reporters/github-reporter";
import { TaskArguments } from "../commands/factory";
const debug = Debug("hooks:github");

interface ProbotConfig {
  privateKey: string;
  appId: string;
  secret: string;
}
export interface GithubHookConfig {
  // Url prefix to listen to (ex: /github/moonbeam)
  urlPrefix: string;
  // Configuration for Probot
  probot: ProbotConfig;
  // List of repos currently allowed
  repo: GithubServiceConfig;
}

const yargParser = yargs().help(false);

export class GithubHook extends Hook {
  private readonly repo: GithubService;
  private readonly probot: Probot;

  constructor(config: GithubHookConfig, express: Express) {
    super();
    this.repo = new GithubService(config.repo);
    this.probot = new Probot(config.probot);

    const middleware = createNodeMiddleware(
      (app) => {
        app.on(`issue_comment`, async ({ payload, issue }) => {
          this.onWebhook(issue, payload);
        });
      },
      { probot: this.probot }
    );
    express.use(config.urlPrefix, middleware);

    this.isReady = this.repo.isReady.then(() => this);
  }

  async onWebhook(reply: ({ body }) => void, payload: IssueCommentEvent) {
    let commentText = payload.comment.body;
    if (!commentText.startsWith("/")) {
      return;
    }
    debug(`Received text: ${commentText}`);

    const cmdLine = commentText.slice(1).split("\n")[0];
    const parsedData = await yargParser.parse(cmdLine);
    if (parsedData._.length < 1) {
      reply({ body: "Missing command" });
      return;
    }

    const keyword = parsedData._[0].toString();
    const args = {
      options: { ...parsedData, pullNumber: payload.issue.number },
      positional: parsedData._.slice(1),
    } as TaskArguments;

    debug(`Received ${keyword}: ${JSON.stringify(args)}`);

    if (
      `${this.repo.owner}/${this.repo.repo}`.toLocaleLowerCase() !==
      payload.repository.full_name.toLocaleLowerCase()
    ) {
      reply({ body: "Repository not supported by the bot" });
      return;
    }

    this.emit(
      "command",
      { keyword, cmdLine, args },
      new GithubReporter(this.repo, payload.issue.number)
    );
  }

  override async destroy() {
    await this.isReady;
    await this.repo.destroy();
  }
}
