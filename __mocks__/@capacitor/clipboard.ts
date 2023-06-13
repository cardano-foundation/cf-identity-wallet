export const Clipboard = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async read(): Promise<{ value: string | undefined }> {
    return { value: undefined };
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async write(string: string): Promise<void> {},
};
