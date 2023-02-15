export function protocolParamsBody() {
  return `
    query protocolParamsBody {
      genesis {
        shelley {
          protocolParams {
            a0
            decentralisationParam
            eMax
            extraEntropy
            keyDeposit
            maxBlockBodySize
            maxBlockHeaderSize
            maxTxSize
            minFeeA
            minFeeB
            minPoolCost
            minUTxOValue
            nOpt
            poolDeposit
            protocolVersion
            rho
            tau
          }
        }
        alonzo{
          maxValueSize
          maxCollateralInputs
          lovelacePerUTxOWord
          collateralPercentage
          maxCollateralInputs
        }
      }
    }
  `;
}
