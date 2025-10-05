import { apiClient } from './client';
import type { QuestDetail, QuestSummary } from './types';

export async function fetchTodayQuests(): Promise<QuestSummary[]> {
  return apiClient.request<QuestSummary[]>('/v1/quests/today', { method: 'GET', auth: true });
}

export async function fetchQuestById(id: string): Promise<QuestDetail> {
  return apiClient.request<QuestDetail>(`/v1/quests/${id}`, { method: 'GET', auth: true });
}

export async function markQuestAccepted(id: string): Promise<void> {
  await apiClient.request(`/v1/quests/${id}/accept`, { method: 'POST', auth: true });
}
