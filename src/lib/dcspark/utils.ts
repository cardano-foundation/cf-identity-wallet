import { DcSparkModule } from './loader';
import { toUnitInterval } from '../utils';
export const transactionMinFee = async (
  txBytes: Uint8Array,
  linearFee: { minFeeA: string; minFeeB: string },
  exUnitPrices: { memPrice: string; stepPrice: string }
) => {
  const Cardano = await DcSparkModule.CardanoWasm();

  return Cardano.min_fee(
    Cardano.Transaction.from_bytes(txBytes),
    Cardano.LinearFee.new(
      Cardano.BigNum.from_str(linearFee.minFeeA.toString()),
      Cardano.BigNum.from_str(linearFee.minFeeB.toString())
    ),
    Cardano.ExUnitPrices.new(
      await toUnitInterval(exUnitPrices.memPrice.toString()),
      await toUnitInterval(exUnitPrices.stepPrice.toString())
    )
  );
};
