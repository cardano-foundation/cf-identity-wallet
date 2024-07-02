interface BiometryInfo {
  isAvailable: boolean;
  strongBiometryIsAvailable: boolean;
  biometricsType: number;
  biometricsTypes: number[];
  deviceIsSecure: boolean;
  reason: string;
  code: string;
}

export type { BiometryInfo };
