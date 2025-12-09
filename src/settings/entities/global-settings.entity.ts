export interface GlobalSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalFeeSettings {
  fixedFee: number;
  percentageFee: number;
}