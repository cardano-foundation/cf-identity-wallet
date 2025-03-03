export enum RoleIndex {
  ISSUER = 0,
  VERIFIER = 1,
  HOLDER = 2,
}

export const roleViewText: { [key in RoleIndex]: string } = {
  [RoleIndex.ISSUER]: "navbar.switchaccount.issuer",
  [RoleIndex.VERIFIER]: "navbar.switchaccount.verifier",
  [RoleIndex.HOLDER]: "navbar.switchaccount.holder",
};
