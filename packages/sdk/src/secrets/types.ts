enum SupportedKeyType {
  Ed25519 = "ed25519",
  secp256k1 = "secp256k1"
}

type Key = {
  id: string,
  publicKeyBase64?: string,
  privateKeyBase64?: string
};

type CreateKeyOptions = {
  keyTypeOverride?: SupportedKeyType
};

export {
  SupportedKeyType,
  CreateKeyOptions,
  Key
}
