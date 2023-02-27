enum SupportedDidMethod {
  DidKey
}

type DidCreateResult = {
  success: boolean,
  did?: string,
  error?: any
};

type DidResolutionResult = {
  success: boolean,
  error?: any
};

type DidUpdateResult = {
  success: boolean,
  error?: any
};

type DidDeactivateResult = {
  success: boolean,
  error?: any
};

export {
  SupportedDidMethod,
  DidCreateResult,
  DidResolutionResult,
  DidUpdateResult,
  DidDeactivateResult
}
