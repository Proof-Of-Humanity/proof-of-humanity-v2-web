export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      "poh-vouchdb": {
        Row: {
          chainId: number;
          claimer: string;
          expiration: number;
          pohId: string;
          signature: string;
          voucher: string;
        };
        Insert: {
          chainId: number;
          claimer: string;
          expiration: number;
          pohId: string;
          signature: string;
          voucher: string;
        };
        Update: {
          chainId?: number;
          claimer?: string;
          expiration?: number;
          pohId?: string;
          signature?: string;
          voucher?: string;
        };
        Relationships: [];
      };
    };
  };
}
