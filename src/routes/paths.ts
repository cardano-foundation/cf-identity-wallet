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
  DIDS = "/tabs/dids",
  CREDS = "/tabs/creds",
  SCAN = "/tabs/scan",
  CRYPTO = "/tabs/crypto",
  CRYPTO_PLACEHOLDER = "/tabs/cryptoplaceholder",
  CHAT = "/tabs/chat",
  DID_DETAILS = "/tabs/dids/:id?",
  CRED_DETAILS = "/tabs/creds/:id?",
}

export { RoutePath, TabsRoutePath };
