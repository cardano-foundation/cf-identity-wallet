
class CardanoModule {

  wasmV4;

  async load() {
    /* eslint-disable-next-line no-console */
    // console.log('loading Cardano WASM library...');
    if (this.wasmV4 != null) {
      /* eslint-disable-next-line no-console */
      // console.log('library seems to be already loaded');
      return;
    }
    this.wasmV4 = await import(
      '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
    );
    /* eslint-disable-next-line no-console */
    // console.log(this.wasmV4);
  }
}

export default new CardanoModule();
