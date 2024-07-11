enum RoutePath {
  ROOT = "/",
  ONBOARDING = "/onboarding",
  SET_PASSCODE = "/setpasscode",
  GENERATE_SEED_PHRASE = "/generateseedphrase",
  VERIFY_SEED_PHRASE = "/verifyseedphrase",
  TABS_MENU = "/tabs",
  CREATE_PASSWORD = "/createpassword",
  SSI_AGENT = "/ssiagent",
  CONNECTION_DETAILS = "/connectiondetails",
  NOTIFICATION_DETAILS = "/notificationdetails",
  VERIFY_RECOVERY_SEED_PHRASE = "/verifyrecoveryseedphrase",
}

enum TabsRoutePath {
  ROOT = "/tabs",
  IDENTIFIERS = "/tabs/identifiers",
  CREDENTIALS = "/tabs/credentials",
  SCAN = "/tabs/scan",
  NOTIFICATIONS = "/tabs/notifications",
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
