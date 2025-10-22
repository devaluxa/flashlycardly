import { db } from "@/db";
import { aiGenerationsTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Get the count of AI generations for a user today
 */
export async function getTodayGenerationCount(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiGenerationsTable)
    .where(
      and(
        eq(aiGenerationsTable.userId, userId),
        eq(aiGenerationsTable.date, today)
      )
    );
  
  return Number(result[0]?.count) || 0;
}

/**
 * Record a new AI generation
 */
export async function recordAIGeneration(
  userId: string,
  deckId: number,
  cardCount: number
) {
  const today = new Date().toISOString().split('T')[0];
  
  const [record] = await db.insert(aiGenerationsTable).values({
    userId,
    deckId,
    cardCount,
    date: today,
  }).returning();
  
  return record;
}

/**
 * Get user's generation history (for debugging/analytics)
 */
export async function getUserGenerationHistory(userId: string, limit = 50) {
  return await db
    .select()
    .from(aiGenerationsTable)
    .where(eq(aiGenerationsTable.userId, userId))
    .orderBy(sql`${aiGenerationsTable.generatedAt} DESC`)
    .limit(limit);
}

