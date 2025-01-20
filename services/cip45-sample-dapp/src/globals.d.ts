// globals.d.ts
export {};

declare global {
  interface Window {
    cardano?: {
      [key: string]: any;
    };
  }
}
