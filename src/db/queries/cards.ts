import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new card in a deck
 */
export async function createCardInDb(deckId: number, front: string, back: string) {
  const [newCard] = await db.insert(cardsTable).values({
    deckId,
    front,
    back,
  }).returning();
  
  return newCard;
}

/**
 * Get a single card by ID and verify deck ownership
 */
export async function getCardById(cardId: number, userId: string) {
  const result = await db.select({ card: cardsTable })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ));
  
  return result.length > 0 ? result[0].card : null;
}

/**
 * Update a card (with ownership verification)
 */
export async function updateCardInDb(
  cardId: number,
  userId: string,
  data: { front?: string; back?: string }
) {
  // First verify the card belongs to the user's deck
  const cardCheck = await getCardById(cardId, userId);
  
  if (!cardCheck) {
    return null;
  }
  
  const [updatedCard] = await db.update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cardId))
    .returning();
  
  return updatedCard || null;
}

/**
 * Delete a card (with ownership verification)
 */
export async function deleteCardFromDb(cardId: number, userId: string) {
  // First verify the card belongs to the user's deck
  const cardCheck = await getCardById(cardId, userId);
  
  if (!cardCheck) {
    return false;
  }
  
  const result = await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .returning();
  
  return result.length > 0;
}

