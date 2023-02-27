import { Key } from '../../secrets';
import { DidCreateResult, DidResolutionResult, DidUpdateResult, DidDeactivateResult } from './types';

interface DidMethodHandler {
  create(authKey: Key): Promise<DidCreateResult>;
  resolve(): Promise<DidResolutionResult>;
  update(): Promise<DidUpdateResult>;
  deactivate(): Promise<DidDeactivateResult>;
}

export {
  DidMethodHandler
}
