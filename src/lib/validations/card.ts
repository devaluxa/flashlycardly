import { z } from "zod";

export const createCardManuallySchema = z.object({
  deckId: z.number(),
  front: z.string().min(1, "Front content is required").max(1000, "Front content is too long"),
  back: z.string().min(1, "Back content is required").max(1000, "Back content is too long"),
});

export const createCardWithAISchema = z.object({
  deckId: z.number(),
});

export const deleteCardSchema = z.object({
  cardId: z.number(),
  deckId: z.number(), // For revalidation
});

export const updateCardSchema = z.object({
  id: z.number(),
  front: z.string().min(1, "Front content is required").max(1000, "Front content is too long"),
  back: z.string().min(1, "Back content is required").max(1000, "Back content is too long"),
});

export const batchUpdateCardsSchema = z.object({
  deckId: z.number(),
  cards: z.array(updateCardSchema).min(1, "At least one card must be updated"),
});

export const batchUpdateAndDeleteCardsSchema = z.object({
  deckId: z.number(),
  cardsToUpdate: z.array(updateCardSchema),
  cardIdsToDelete: z.array(z.number()),
});

export const generateCardsWithAISchema = z.object({
  deckId: z.number(),
  count: z.number().min(1).max(10).optional().default(10),
});

// Zod schema for AI-generated flashcard output
export const aiFlashcardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().min(1, "Front is required").max(1000),
      back: z.string().min(1, "Back is required").max(1000),
    })
  ).min(1, "At least one card must be generated"),
});

// Export TypeScript types from Zod schemas
export type CreateCardManuallyInput = z.infer<typeof createCardManuallySchema>;
export type CreateCardWithAIInput = z.infer<typeof createCardWithAISchema>;
export type DeleteCardInput = z.infer<typeof deleteCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type BatchUpdateCardsInput = z.infer<typeof batchUpdateCardsSchema>;
export type BatchUpdateAndDeleteCardsInput = z.infer<typeof batchUpdateAndDeleteCardsSchema>;
export type GenerateCardsWithAIInput = z.infer<typeof generateCardsWithAISchema>;
export type AIFlashcardOutput = z.infer<typeof aiFlashcardSchema>;

