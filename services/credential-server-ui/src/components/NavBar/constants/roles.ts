export enum RoleIndex {
  ISSUER = 0,
  VERIFIER = 1,
  HOLDER = 2,
}

export const roleViewText: { [key in RoleIndex]: string } = {
  [RoleIndex.ISSUER]: "navbar.switchAccount.issuer",
  [RoleIndex.VERIFIER]: "navbar.switchAccount.verifier",
  [RoleIndex.HOLDER]: "navbar.switchAccount.holder",
};
