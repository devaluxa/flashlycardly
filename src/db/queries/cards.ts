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

/**
 * Batch update multiple cards (with ownership verification)
 * Note: Updates are sequential, not atomic, due to neon-http driver limitations
 */
export async function batchUpdateCardsInDb(
  deckId: number,
  userId: string,
  cards: Array<{ id: number; front: string; back: string }>
) {
  // First verify the deck belongs to the user
  const [deckCheck] = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
  
  if (!deckCheck) {
    return null;
  }
  
  // Update all cards sequentially (neon-http doesn't support transactions)
  const results = [];
  
  for (const card of cards) {
    // Verify each card belongs to the deck
    const [cardCheck] = await db.select()
      .from(cardsTable)
      .where(and(
        eq(cardsTable.id, card.id),
        eq(cardsTable.deckId, deckId)
      ));
    
    if (!cardCheck) {
      throw new Error(`Card ${card.id} not found or does not belong to this deck`);
    }
    
    // Update the card
    const [updatedCard] = await db.update(cardsTable)
      .set({
        front: card.front,
        back: card.back,
        updatedAt: new Date(),
      })
      .where(eq(cardsTable.id, card.id))
      .returning();
    
    results.push(updatedCard);
  }
  
  return results;
}

/**
 * Batch update and delete cards (with ownership verification)
 * Note: Operations are sequential, not atomic, due to neon-http driver limitations
 */
export async function batchUpdateAndDeleteCardsInDb(
  deckId: number,
  userId: string,
  cardsToUpdate: Array<{ id: number; front: string; back: string }>,
  cardIdsToDelete: number[]
) {
  // First verify the deck belongs to the user
  const [deckCheck] = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
  
  if (!deckCheck) {
    return null;
  }
  
  // Update cards first
  const updatedResults = [];
  for (const card of cardsToUpdate) {
    // Verify each card belongs to the deck
    const [cardCheck] = await db.select()
      .from(cardsTable)
      .where(and(
        eq(cardsTable.id, card.id),
        eq(cardsTable.deckId, deckId)
      ));
    
    if (!cardCheck) {
      throw new Error(`Card ${card.id} not found or does not belong to this deck`);
    }
    
    // Update the card
    const [updatedCard] = await db.update(cardsTable)
      .set({
        front: card.front,
        back: card.back,
        updatedAt: new Date(),
      })
      .where(eq(cardsTable.id, card.id))
      .returning();
    
    updatedResults.push(updatedCard);
  }
  
  // Delete cards
  for (const cardId of cardIdsToDelete) {
    // Verify each card belongs to the deck before deleting
    const [cardCheck] = await db.select()
      .from(cardsTable)
      .where(and(
        eq(cardsTable.id, cardId),
        eq(cardsTable.deckId, deckId)
      ));
    
    if (!cardCheck) {
      throw new Error(`Card ${cardId} not found or does not belong to this deck`);
    }
    
    await db.delete(cardsTable).where(eq(cardsTable.id, cardId));
  }
  
  return {
    updated: updatedResults,
    deleted: cardIdsToDelete.length,
  };
}

