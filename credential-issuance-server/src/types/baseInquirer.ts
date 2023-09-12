enum Title {
  OptionsTitle = "\nOptions:",
  ConfirmTitle = "\n\nAre you sure?",
}

enum Output {
  NoConnectionRecordFromOutOfBand = `\nNo connectionRecord has been created from invitation\n`,
  ConnectionEstablished = `\nConnection established!`,
  MissingConnectionRecord = `\nNo connectionRecord ID has been set yet\n`,
  ConnectionLink = `\nRun 'Receive connection invitation' in Alice and paste this invitation link:\n\n`,
  OfferCredentialSuccess = `\nOffer credentials successfully, wait for some seconds when sending your credentials to agent\n\n`,
  Exit = 'Shutting down agent...\nExiting...',
}

enum ConfirmOptions {
  Yes = "yes",
  No = "no",
}

class BaseInquirer {
  public optionsInquirer: {
    type: string;
    prefix: string;
    name: string;
    message: string;
    choices: string[];
  };
  public inputInquirer: {
    type: string;
    prefix: string;
    name: string;
    message: string;
    choices: string[];
  };

  public constructor() {
    this.optionsInquirer = {
      type: "list",
      prefix: "",
      name: "options",
      message: "",
      choices: [],
    };

    this.inputInquirer = {
      type: "input",
      prefix: "",
      name: "input",
      message: "",
      choices: [],
    };
  }

  public inquireOptions(promptOptions: string[]) {
    this.optionsInquirer.message = Title.OptionsTitle;
    this.optionsInquirer.choices = promptOptions;
    return this.optionsInquirer;
  }

  public inquireInput(title: string) {
    this.inputInquirer.message = title;
    return this.inputInquirer;
  }

  public inquireConfirmation(title: string) {
    this.optionsInquirer.message = title;
    this.optionsInquirer.choices = [ConfirmOptions.Yes, ConfirmOptions.No];
    return this.optionsInquirer;
  }
}

export { Title, BaseInquirer, ConfirmOptions, Output };
