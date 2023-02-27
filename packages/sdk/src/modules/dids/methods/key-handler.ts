import { Key } from '../../../secrets';
import { DidMethodHandler } from '../did-method-handler';
import { DidCreateResult, DidResolutionResult, DidUpdateResult, DidDeactivateResult } from '../types';

class KeyHandler implements DidMethodHandler {
  async create(authKey: Key): Promise<DidCreateResult> {
    const multibase = `z${authKey.publicKeyBase64}`; // This is not multibase - fix!
    return { success: true, did: `did:key:${multibase}` };
  }
  
  async resolve(): Promise<DidResolutionResult> {
    return { success: false, error: "Method not implemented" };
  }
  
  async update(): Promise<DidUpdateResult> {
    return { success: false, error: "Method not implemented" };
  }
  
  async deactivate(): Promise<DidDeactivateResult> {
    return { success: false, error: "Method not implemented" };
  }
}

export {
  KeyHandler
}
