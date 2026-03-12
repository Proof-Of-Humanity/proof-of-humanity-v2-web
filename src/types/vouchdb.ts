export interface PushVouchBody {
  humanity: string;
  claimer: string;
  voucher: string;
  expiration: number;
  signature: string;
}

interface VDBRequest {
  humanity: string;
  claimer: string;
  nbVouches: number;
}

export interface VDBRequestsResult {
  requests: VDBRequest[];
}

export interface VDBVouch {
  create_at: string;
  voucher: string;
  expiration: number;
  signature: string;
}

export interface VDBVouchesResult {
  vouches: VDBVouch[];
}
