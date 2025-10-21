import { z } from "zod";

export const updateDeckSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

// Export TypeScript types from Zod schemas
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

