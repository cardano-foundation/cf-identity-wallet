declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      SERVER_URL?: string;
    };
  }
}

export const getServerUrl = (): string => {
  return window.__RUNTIME_CONFIG__?.SERVER_URL || "http://localhost:3001";
};
