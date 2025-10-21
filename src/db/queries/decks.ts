import { db } from "@/db";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Fetch all decks for a specific user
 */
export async function getUserDecks(userId: string) {
  return await db.select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.createdAt));
}

/**
 * Fetch a single deck by ID and userId (security check)
 */
export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
  
  return deck || null;
}

/**
 * Fetch all cards for a specific deck
 * Verifies deck ownership through join
 */
export async function getDeckCards(deckId: number, userId: string) {
  const result = await db.select({ card: cardsTable })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.deckId, deckId),
      eq(decksTable.userId, userId)
    ));
  
  return result.map(r => r.card);
}

/**
 * Create a new deck
 */
export async function createDeckInDb(userId: string, title: string, description: string) {
  const [newDeck] = await db.insert(decksTable).values({
    userId,
    title,
    description,
  }).returning();
  
  return newDeck;
}

/**
 * Update a deck (with ownership verification)
 */
export async function updateDeckInDb(
  deckId: number, 
  userId: string, 
  data: { title?: string; description?: string }
) {
  const [updatedDeck] = await db.update(decksTable)
    .set({ 
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return updatedDeck || null;
}

/**
 * Delete a deck (with ownership verification)
 */
export async function deleteDeckFromDb(deckId: number, userId: string) {
  const result = await db.delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return result.length > 0;
}

