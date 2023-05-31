enum RoutePath {
  ROOT = "/",
  ONBOARDING = "/onboarding",
  SET_PASSCODE = "/setpasscode",
  PASSCODE_LOGIN = "/passcodelogin",
  GENERATE_SEED_PHRASE = "/generateseedphrase",
  VERIFY_SEED_PHRASE = "/verifyseedphrase",
  TABS_MENU = "/tabs",
  CREATE_PASSWORD = "/createpassword",
}

enum TabsRoutePath {
  ROOT = "/tabs",
  DIDS = "/tabs/dids",
  CREDS = "/tabs/creds",
  SCAN = "/tabs/scan",
  CRYPTO = "/tabs/crypto",
  CHAT = "/tabs/chat",
  CARD_DETAILS = "/tabs/carddetails",
}

export { RoutePath, TabsRoutePath };
