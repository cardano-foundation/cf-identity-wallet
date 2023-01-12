import {DcSparkModule} from './dcspark';

export const computeDiv = async (n1: string, n2: string) => {
	const Cardano = await DcSparkModule.CardanoWasm();
	return Cardano.BigNum.from_str(n1)
		.checked_div(Cardano.BigNum.from_str(n2))
		.to_str();
};

export const addressIsValid = async (address: string) => {
	const Cardano = await DcSparkModule.CardanoWasm();

	try {
		if (Cardano.ByronAddress.is_valid(address)) {
			return true;
		}
		const shelleyAddress = Cardano.Address.from_bech32(address);
		if (Cardano.ByronAddress.from_address(shelleyAddress)) {
			return true;
		}
		if (Cardano.BaseAddress.from_address(shelleyAddress)) {
			return true;
		}
		if (Cardano.PointerAddress.from_address(shelleyAddress)) {
			return true;
		}
		if (Cardano.EnterpriseAddress.from_address(shelleyAddress)) {
			return true;
		}
		if (Cardano.RewardAddress.from_address(shelleyAddress)) {
			return true;
		}
		return false;
	} catch (error) {
		return false;
	}
};

// mesh utils
export const toUnitInterval = async (float: string) => {
	const Cardano = await DcSparkModule.CardanoWasm();

	const decimal = float.split('.')[1];
	const numerator = `${parseInt(decimal, 10)}`;
	const denominator = '1' + '0'.repeat(decimal.length);

	return Cardano.UnitInterval.new(
		Cardano.BigNum.from_str(numerator),
		Cardano.BigNum.from_str(denominator)
	);
};
