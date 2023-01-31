export function accountStateBody() {
    return `
    query accountStateBody (
    $addresses: [String!]
    ){
        utxos(
             where: { address: { _in: $addresses }}
        ) {
            value
            tokens {
              quantity
              asset {
                  assetName
                  policyId
                  assetId
                  fingerprint
                  tokenMints {
                    quantity
                    transaction {
                        includedAt
                    }
                  }
          }
        }
    }
  }
   `
}
