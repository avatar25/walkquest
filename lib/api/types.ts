export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO timestamp
}

export interface QuestSummary {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  rewardPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  distanceMeters?: number;
  availableAt?: string;
}

export interface QuestDetail extends QuestSummary {
  description?: string;
  photoHint?: string;
}

export interface FeatureFlagToggle {
  key: string;
  enabled: boolean;
  payload?: Record<string, unknown>;
  updatedAt: string;
}

export interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: unknown;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
