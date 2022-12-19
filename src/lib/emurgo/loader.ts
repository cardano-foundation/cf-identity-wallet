type Lib = typeof import('@emurgo/cardano-serialization-lib-browser');

class Module {
  private _wasm: Lib | null = null;

  private async load(): Promise<Lib> {
    if (!this._wasm) {
      this._wasm = await import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib');
    }
    return this._wasm;
  }

  async CardanoWasm(): Promise<Lib> {
    return this.load();
  }
}

export const EmurgoModule: Module = new Module();
