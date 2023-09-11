import { clear } from "console";
import { prompt } from "inquirer";

import {
  BaseInquirer,
  ConfirmOptions,
  Output,
  Title,
} from "./types/baseInquirer";
import { startServer } from "./server";
import qrcode from "qrcode-terminal";
import { AriesAgent } from "./ariesAgent";
export const main = async () => {
  clear();
  console.log("Starting server aries agent...");
  const faber = await MainInquirer.build();
  await faber.processAnswer();
};

enum PromptOptions {
  CreateInvitation = "Create invitation url",
  OfferCredential = "Offer credential (automatic)",
  Exit = "Exit \n\n",
}

export class MainInquirer extends BaseInquirer {
  public promptOptionsString: string[];
  public agent: AriesAgent;
  public connectionId: string = "";

  public constructor() {
    super();
    this.promptOptionsString = Object.values(PromptOptions);
    this.agent = AriesAgent.agent;
  }

  public static async build(): Promise<MainInquirer> {
    await startServer();
    return new MainInquirer();
  }

  private async getPromptChoice() {
    let choices;
    if (!this.connectionId) {
      choices = [PromptOptions.CreateInvitation, PromptOptions.Exit];
    } else {
      choices = Object.values(PromptOptions);
    }
    return prompt([this.inquireOptions(choices)]);
  }

  public async processAnswer() {
    const choice = await this.getPromptChoice();

    switch (choice.options) {
      case PromptOptions.CreateInvitation:
        await this.connection();
        break;
      case PromptOptions.OfferCredential:
        await this.offderCredential();
        break;
      case PromptOptions.Exit:
        await this.exit();
        break;
    }
    await this.processAnswer();
  }

  public async connection() {
    console.log("Creating invitaion URL ...");
    const { url, outOfBandId } = await this.agent.createInvitation();
    console.log("Invitation URL: ", url);
    qrcode.generate(url, { small: true });
    await this.agent.waitForConnection(outOfBandId);
    const [connectionRecord] = await this.agent.connectionFindAllByOutOfBandId(
      outOfBandId
    );
    if (connectionRecord) this.connectionId = connectionRecord.id;
  }

  public async offderCredential() {
    await this.agent.offerCredential(this.connectionId);
    console.log(Output.OfferCredentialSuccess);
  }

  public async exit() {
    const confirm = await prompt([
      this.inquireConfirmation(Title.ConfirmTitle),
    ]);
    if (confirm.options === ConfirmOptions.No) {
      return;
    } else if (confirm.options === ConfirmOptions.Yes) {
      process.exit(0);
    }
  }
}

void main();
