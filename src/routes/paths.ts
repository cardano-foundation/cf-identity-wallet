enum RoutePath {
  ROOT = "/",
  ONBOARDING = "/onboarding",
  SET_PASSCODE = "/setpasscode",
  PASSCODE_LOGIN = "/passcodelogin",
  GENERATE_SEED_PHRASE = "/generateseedphrase",
  VERIFY_SEED_PHRASE = "/verifyseedphrase",
  TABS_MENU = "/tabs",
  CREATE_PASSWORD = "/createpassword",
  CONNECTION_DETAILS = "/connectiondetails",
}

enum TabsRoutePath {
  ROOT = "/tabs",
  IDENTIFIERS = "/tabs/identifiers",
  CREDS = "/tabs/creds",
  SCAN = "/tabs/scan",
  CHAT = "/tabs/chat",
  MENU = "/tabs/menu",
  IDENTIFIER_DETAILS = "/tabs/identifiers/:id?",
  CRED_DETAILS = "/tabs/creds/:id?",
}

export { RoutePath, TabsRoutePath };
