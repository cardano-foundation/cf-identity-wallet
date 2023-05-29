interface DidsProps {
  identities: [
    id: string,
    keyType: string,
    controller: string,
    publicKeyBase58: string
  ];
}

export type { DidsProps };
