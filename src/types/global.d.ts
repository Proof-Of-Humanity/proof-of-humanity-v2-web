interface Window {
  ethereum?: {
    isCoinbaseWallet?: true;
    isMetaMask?: true;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    removeAllListeners?: (...args: any[]) => void;
    autoRefreshOnNetworkChange?: boolean;
  };
}

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

declare module "*.svg" {
  const content: React.FC<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.jpg" {
  const uri: string;
  export default uri;
}

declare module "*.png" {
  const uri: string;
  export default uri;
}
