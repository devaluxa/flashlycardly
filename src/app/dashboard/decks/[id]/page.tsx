import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById, getDeckCards } from "@/db/queries/decks";
import { Button } from "@/components/ui/button";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { DeckContent } from "@/components/deck-content";

interface DeckPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Check if user has AI generation feature
  const hasAIFeature = has({ feature: "ai_flash_card_generation" });

  const { id } = await params;
  const deckId = parseInt(id, 10);

  if (isNaN(deckId)) {
    notFound();
  }

  // Fetch deck and cards using query helpers
  const deck = await getDeckById(deckId, userId);
  
  if (!deck) {
    notFound();
  }

  const cards = await getDeckCards(deckId, userId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header with Back Button */}
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-2">
                ← Back to Dashboard
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl md:text-5xl font-bold">
                  {deck.title}
                </h1>
                <EditDeckDialog 
                  deckId={deckId} 
                  currentTitle={deck.title} 
                  currentDescription={deck.description || ""} 
                />
              </div>
              {deck.description && (
                <p className="text-muted-foreground text-lg mt-2">
                  {deck.description}
                </p>
              )}
            </div>
          </div>

          {/* Deck Content (Client Component for Edit Mode) */}
          <DeckContent 
            deckId={deckId} 
            deckTitle={deck.title} 
            deckDescription={deck.description || ""}
            hasAIFeature={hasAIFeature}
            initialCards={cards} 
          />
        </div>
      </div>
    </div>
  );
}

