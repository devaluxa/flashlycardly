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

// Export TypeScript types from Zod schemas
export type CreateCardManuallyInput = z.infer<typeof createCardManuallySchema>;
export type CreateCardWithAIInput = z.infer<typeof createCardWithAISchema>;
export type DeleteCardInput = z.infer<typeof deleteCardSchema>;

