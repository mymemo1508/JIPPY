export interface QRPage {
  name: string;
  path: string;
}

export interface QRConfig {
  name: string;
  explain: string;
  url: string;
}

export interface QRData {
  id: number;
  explain: string;
  url: string;
}

export type QRType = QRPage | QRConfig;