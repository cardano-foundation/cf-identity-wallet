interface BiometryInfo {
  isAvailable: boolean;
  strongBiometryIsAvailable: boolean;
  biometryType: number;
  biometryTypes: number[];
  deviceIsSecure: boolean;
  reason: string;
  code: string;
}

export type { BiometryInfo };
