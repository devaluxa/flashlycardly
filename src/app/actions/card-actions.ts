"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createCardManuallySchema,
  createCardWithAISchema,
  deleteCardSchema,
  type CreateCardManuallyInput,
  type CreateCardWithAIInput,
  type DeleteCardInput,
} from "@/lib/validations/card";
import { createCardInDb, deleteCardFromDb } from "@/db/queries/cards";
import { getDeckById, getDeckCards } from "@/db/queries/decks";

export async function createCardManually(input: CreateCardManuallyInput) {
  // 1. Validate input with Zod
  const validatedData = createCardManuallySchema.parse(input);

  // 2. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Verify deck ownership
  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Create card using query helper
  const newCard = await createCardInDb(
    validatedData.deckId,
    validatedData.front,
    validatedData.back
  );

  // 5. Revalidate relevant paths
  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
  revalidatePath("/dashboard");

  return { success: true, card: newCard };
}

export async function createCardWithAI(input: CreateCardWithAIInput) {
  // 1. Validate input
  const validatedData = createCardWithAISchema.parse(input);

  // 2. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Verify deck ownership and get deck details
  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Get existing cards for context
  const existingCards = await getDeckCards(validatedData.deckId, userId);

  // 5. Generate AI card based on deck context
  const aiGeneratedCard = await generateCardWithAI(deck, existingCards);

  // 6. Create card using query helper
  const newCard = await createCardInDb(
    validatedData.deckId,
    aiGeneratedCard.front,
    aiGeneratedCard.back
  );

  // 7. Revalidate relevant paths
  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
  revalidatePath("/dashboard");

  return { success: true, card: newCard };
}

export async function deleteCard(input: DeleteCardInput) {
  // 1. Validate input
  const validatedData = deleteCardSchema.parse(input);

  // 2. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Delete card (includes ownership verification)
  const success = await deleteCardFromDb(validatedData.cardId, userId);

  if (!success) {
    throw new Error("Card not found or unauthorized");
  }

  // 4. Revalidate
  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Generate a flashcard using AI based on deck context
 * TODO: Replace with actual AI service (OpenAI, Anthropic, etc.)
 */
async function generateCardWithAI(
  deck: { title: string; description: string | null },
  existingCards: Array<{ front: string; back: string }>
) {
  // This is a placeholder implementation
  // In production, this would call an AI API like OpenAI's GPT-4

  const deckTopic = deck.title;
  const cardNumber = existingCards.length + 1;

  // Simple contextual generation based on deck title
  // You can replace this with actual AI API calls
  const templates = [
    {
      front: `What is an important concept in ${deckTopic}?`,
      back: `[AI-Generated] A key concept in ${deckTopic} that builds upon previous knowledge.`,
    },
    {
      front: `Explain a key term related to ${deckTopic}`,
      back: `[AI-Generated] This term is fundamental to understanding ${deckTopic}.`,
    },
    {
      front: `What is the significance of ${deckTopic}?`,
      back: `[AI-Generated] ${deckTopic} is important because it demonstrates core principles.`,
    },
    {
      front: `How does ${deckTopic} relate to practical applications?`,
      back: `[AI-Generated] In practice, ${deckTopic} can be applied to solve real-world problems.`,
    },
  ];

  const selectedTemplate = templates[cardNumber % templates.length];

  return {
    front: selectedTemplate.front,
    back: `${selectedTemplate.back}\n\n💡 Tip: Edit this card to add specific details about ${deckTopic}!`,
  };
}

