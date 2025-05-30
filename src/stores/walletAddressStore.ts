let currentWagmiAddress: string | null = null;

export const setGlobalWagmiAddress = (address: string | null): void => {
  currentWagmiAddress = address;
};

export const getGlobalWagmiAddress = (): string | null => {
  return currentWagmiAddress;
}; 