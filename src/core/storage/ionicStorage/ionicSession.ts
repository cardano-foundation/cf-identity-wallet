import { Drivers, Storage } from "@ionic/storage";

class IonicSession {
  private static readonly drivers = [Drivers.IndexedDB];

  private sessionInstance?: Storage;

  get session() {
    return this.sessionInstance;
  }

  async open(storageName: string): Promise<void> {
    if (!this.session) {
      this.sessionInstance = new Storage({
        name: storageName,
        driverOrder: IonicSession.drivers,
      });
      await this.sessionInstance.create();
    }
  }

  async wipe(_storageName: string): Promise<void> {
    await this.sessionInstance?.clear();
  }
}

export { IonicSession };
