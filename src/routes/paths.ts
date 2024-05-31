enum RoutePath {
  ROOT = "/",
  ONBOARDING = "/onboarding",
  SET_PASSCODE = "/setpasscode",
  GENERATE_SEED_PHRASE = "/generateseedphrase",
  VERIFY_SEED_PHRASE = "/verifyseedphrase",
  TABS_MENU = "/tabs",
  CREATE_PASSWORD = "/createpassword",
  CONNECTION_DETAILS = "/connectiondetails",
}

enum TabsRoutePath {
  ROOT = "/tabs",
  IDENTIFIERS = "/tabs/identifiers",
  CREDENTIALS = "/tabs/credentials",
  SCAN = "/tabs/scan",
  NOTIFICATION = "/tabs/notification",
  MENU = "/tabs/menu",
  IDENTIFIER_DETAILS = "/tabs/identifiers/:id",
  CREDENTIAL_DETAILS = "/tabs/credentials/:id",
}

const PublicRoutes = [
  RoutePath.ROOT,
  RoutePath.ONBOARDING,
  RoutePath.SET_PASSCODE,
];

export { RoutePath, TabsRoutePath, PublicRoutes };
