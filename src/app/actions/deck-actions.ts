"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateDeckSchema, type UpdateDeckInput } from "@/lib/validations/deck";
import { updateDeckInDb } from "@/db/queries/decks";

export async function updateDeck(input: UpdateDeckInput) {
  // 1. Validate input with Zod
  const validatedData = updateDeckSchema.parse(input);
  
  // 2. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // 3. Call query helper to update (includes ownership verification)
  const updatedDeck = await updateDeckInDb(
    validatedData.id,
    userId,
    {
      title: validatedData.title,
      description: validatedData.description,
    }
  );
  
  if (!updatedDeck) {
    throw new Error("Deck not found or unauthorized");
  }
  
  // 4. Revalidate relevant paths
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/decks/${validatedData.id}`);
  
  return { success: true, deck: updatedDeck };
}

