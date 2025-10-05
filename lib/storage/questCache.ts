import { openDatabaseSync } from 'expo-sqlite';
import type { QuestSummary } from '../api';

const DB_NAME = 'walkquest-cache.db';
const TABLE_QUESTS = 'quests';

const db = openDatabaseSync(DB_NAME);
let initialized = false;

async function ensureInitialized() {
  if (initialized) return;
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS ${TABLE_QUESTS} (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius REAL NOT NULL,
      reward_points INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      distance REAL,
      available_at TEXT
    )`
  );
  initialized = true;
}

export async function writeQuestCache(quests: QuestSummary[]): Promise<void> {
  await ensureInitialized();
  await db.withTransactionAsync(async () => {
    await db.execAsync(`DELETE FROM ${TABLE_QUESTS}`);
    for (const quest of quests) {
      await db.runAsync(
        `INSERT OR REPLACE INTO ${TABLE_QUESTS} (id, title, latitude, longitude, radius, reward_points, difficulty, distance, available_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          .replace(/\s+/g, ' '),
        [
          quest.id,
          quest.title,
          quest.latitude,
          quest.longitude,
          quest.radiusMeters,
          quest.rewardPoints,
          quest.difficulty,
          quest.distanceMeters ?? null,
          quest.availableAt ?? null,
        ]
      );
    }
  });
}

export async function readQuestCache(): Promise<QuestSummary[]> {
  await ensureInitialized();
  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    radius: number;
    reward_points: number;
    difficulty: QuestSummary['difficulty'];
    distance: number | null;
    available_at: string | null;
  }>(`SELECT * FROM ${TABLE_QUESTS}`);
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusMeters: row.radius,
    rewardPoints: row.reward_points,
    difficulty: row.difficulty,
    distanceMeters: row.distance ?? undefined,
    availableAt: row.available_at ?? undefined,
  }));
}

export async function clearQuestCache(): Promise<void> {
  await ensureInitialized();
  await db.execAsync(`DELETE FROM ${TABLE_QUESTS}`);
}
