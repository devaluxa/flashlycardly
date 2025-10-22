"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  createCardManuallySchema,
  createCardWithAISchema,
  deleteCardSchema,
  batchUpdateCardsSchema,
  batchUpdateAndDeleteCardsSchema,
  generateCardsWithAISchema,
  aiFlashcardSchema,
  type CreateCardManuallyInput,
  type CreateCardWithAIInput,
  type DeleteCardInput,
  type BatchUpdateCardsInput,
  type BatchUpdateAndDeleteCardsInput,
  type GenerateCardsWithAIInput,
} from "@/lib/validations/card";
import { createCardInDb, deleteCardFromDb, batchUpdateCardsInDb, batchUpdateAndDeleteCardsInDb } from "@/db/queries/cards";
import { getDeckById, getDeckCards } from "@/db/queries/decks";
import { getTodayGenerationCount, recordAIGeneration } from "@/db/queries/ai-generations";

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

export async function batchUpdateCards(input: BatchUpdateCardsInput) {
  // 1. Validate input with Zod
  const validatedData = batchUpdateCardsSchema.parse(input);

  // 2. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Verify deck ownership and update cards using query helper
  const updatedCards = await batchUpdateCardsInDb(
    validatedData.deckId,
    userId,
    validatedData.cards
  );

  if (!updatedCards) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Revalidate relevant paths
  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
  revalidatePath("/dashboard");

  return { success: true, cards: updatedCards };
}

export async function batchUpdateAndDeleteCards(input: BatchUpdateAndDeleteCardsInput) {
  // 1. Validate input with Zod
  const validatedData = batchUpdateAndDeleteCardsSchema.parse(input);

  // 2. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Verify deck ownership and update/delete cards using query helper
  const result = await batchUpdateAndDeleteCardsInDb(
    validatedData.deckId,
    userId,
    validatedData.cardsToUpdate,
    validatedData.cardIdsToDelete
  );

  if (!result) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Revalidate relevant paths
  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
  revalidatePath("/dashboard");

  return { 
    success: true, 
    updated: result.updated.length,
    deleted: result.deleted,
  };
}

export async function generateCardsWithAI(input: GenerateCardsWithAIInput) {
  // 1. Validate input
  const validatedData = generateCardsWithAISchema.parse(input);

  // 2. Authenticate user
  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Check if user has AI generation feature (billing check)
  const hasAIFeature = has({ feature: "ai_flash_card_generation" });
  if (!hasAIFeature) {
    throw new Error("AI flashcard generation is a Pro feature. Please upgrade.");
  }

  // 4. Verify deck ownership and get deck details
  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 5. Check daily generation limit (rate limiting)
  const DAILY_LIMIT = 10;
  const todayCount = await getTodayGenerationCount(userId);
  
  if (todayCount >= DAILY_LIMIT) {
    throw new Error(`Daily AI generation limit reached (${DAILY_LIMIT} per day). Try again tomorrow!`);
  }

  // 6. Check if deck has both title and description
  if (!deck.description || deck.description.trim().length === 0) {
    throw new Error("AI generation requires both a deck title and description. Please add a description to your deck.");
  }

  // 7. Generate flashcards using Vercel AI SDK
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: aiFlashcardSchema,
      prompt: `Generate ${validatedData.count} flashcards for studying "${deck.title}".

Deck Title: "${deck.title}"
${deck.description ? `Deck Description: "${deck.description}"` : ""}

Requirements:
- Front: Short, focused question or term (max 15 words)
- Back: Concise, clear answer or definition (max 50 words)
- Keep content brief and scannable
- Focus on one key concept per card
- Avoid lengthy explanations
- Use simple, direct language
- Educational and study-friendly

Generate exactly ${validatedData.count} flashcards with concise, focused content.`,
    });

    // 8. Insert generated cards into database
    const createdCards = [];
    for (const card of object.cards) {
      const newCard = await createCardInDb(
        validatedData.deckId,
        card.front,
        card.back
      );
      createdCards.push(newCard);
    }

    // 9. Record the generation for rate limiting
    await recordAIGeneration(userId, validatedData.deckId, createdCards.length);

    // 10. Revalidate paths
    revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      cards: createdCards,
      count: createdCards.length,
      remainingToday: DAILY_LIMIT - (todayCount + 1), // How many generations left today
    };
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate flashcards with AI. Please try again.");
  }
}

