type Lib = typeof import('@dcspark/cardano-multiplatform-lib-browser');

class Module {
	private _wasm: Lib | null = null;

	private async load(): Promise<Lib> {
		if (!this._wasm) {
			this._wasm = await import('@dcspark/cardano-multiplatform-lib-browser');
		}
		return this._wasm;
	}

	async CardanoWasm(): Promise<Lib> {
		return this.load();
	}
}

export const DcSparkModule: Module = new Module();
