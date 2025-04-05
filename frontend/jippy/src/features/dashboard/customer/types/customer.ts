export interface PredictionSample {
  category: string;
  content: string;
  created_at: string;
  sentiment: string;
}

export interface PredictionData {
  store_id: number;
  positive_count: number;
  negative_count: number;
  positive_samples: PredictionSample[];
  negative_samples: PredictionSample[];
  positive_keywords: string[];
  negative_keywords: string[];
}

export interface Feedback {
  id: number;
  storeId: number;
  category: string;
  content: string;
  createdAt: string;
}