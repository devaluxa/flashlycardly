"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { 
  createDeckSchema, 
  updateDeckSchema,
  deleteDeckSchema,
  type CreateDeckInput,
  type UpdateDeckInput,
  type DeleteDeckInput
} from "@/lib/validations/deck";
import { createDeckInDb, updateDeckInDb, deleteDeckFromDb, getUserDecks } from "@/db/queries/decks";

export async function createDeck(input: CreateDeckInput) {
  // 1. Validate input with Zod
  const validatedData = createDeckSchema.parse(input);
  
  // 2. Authenticate user
  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // 3. Check if user has unlimited decks feature (Pro plan)
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  
  if (!hasUnlimitedDecks) {
    // Free users are limited to 3 decks
    const userDecks = await getUserDecks(userId);
    
    if (userDecks.length >= 3) {
      throw new Error("Free users can only create 3 decks. Upgrade to our Pro Plan for unlimited decks.");
    }
  }
  
  // 4. Call query helper to create deck
  const newDeck = await createDeckInDb(
    userId,
    validatedData.title,
    validatedData.description || ""
  );
  
  // 5. Revalidate relevant paths
  revalidatePath("/dashboard");
  
  return { success: true, deck: newDeck };
}

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

export async function deleteDeck(input: DeleteDeckInput) {
  // 1. Validate input
  const validatedData = deleteDeckSchema.parse(input);
  
  // 2. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // 3. Call query helper to delete (includes ownership verification)
  const success = await deleteDeckFromDb(validatedData.id, userId);
  
  if (!success) {
    throw new Error("Deck not found or unauthorized");
  }
  
  // 4. Revalidate
  revalidatePath("/dashboard");
  
  return { success: true };
}

