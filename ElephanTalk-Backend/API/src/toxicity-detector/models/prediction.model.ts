export interface ToxicityClassificationResponse {
  results: ToxicityClassificationTags;
}

export interface ToxicityClassificationTags {
  toxicity: number;
  severe_toxicity: number;
  obscene: number;
  identity_attack: number;
  insult: number;
  threat: number;
  sexual_explicit: number;
}

export interface ToxicityClassificationResult {
  isToxic: boolean;
  tags: string[];
}
