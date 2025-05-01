enum NotificationRoute {
  // "Real" notifications from KERIA
  MultiSigIcp = "/multisig/icp",
  MultiSigExn = "/multisig/exn",
  MultiSigRpy = "/multisig/rpy",
  ExnIpexApply = "/exn/ipex/apply",
  ExnIpexOffer = "/exn/ipex/offer",
  ExnIpexAgree = "/exn/ipex/agree",
  ExnIpexGrant = "/exn/ipex/grant",
  // Notifications from our wallet to give further feedback to the user
  LocalAcdcRevoked = "/local/acdc/revoked",
  LocalSign = "/local/signrequest",
  LocalConfirmation = "/local/signconfirmation",
  LocalInformation = "/local/signinformation",
  LocalConnectInstructions = "/local/connectinstructions",
}

enum ExchangeRoute {
  IpexAdmit = "/ipex/admit",
  IpexGrant = "/ipex/grant",
  IpexApply = "/ipex/apply",
  IpexAgree = "/ipex/agree",
  IpexOffer = "/ipex/offer",
}

interface KeriaNotification {
  id: string;
  createdAt: string;
  a: Record<string, unknown>;
  connectionId: string;
  read: boolean;
  groupReplied: boolean;
  groupInitiatorPre?: string;
  groupInitiator?: boolean;
}

interface KeriaNotificationMarker {
  nextIndex: number;
  lastNotificationId: string;
}

export { NotificationRoute, ExchangeRoute };
export type { KeriaNotification, KeriaNotificationMarker };
