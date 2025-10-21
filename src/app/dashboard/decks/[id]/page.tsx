import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById, getDeckCards } from "@/db/queries/decks";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlipCard } from "@/components/flip-card";
import { AddCardDialog } from "@/components/add-card-dialog";
import { EditDeckDialog } from "@/components/edit-deck-dialog";

interface DeckPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

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

          {/* Cards Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {cards.length} {cards.length === 1 ? "card" : "cards"} in this deck
            </p>
            <AddCardDialog deckId={deckId} deckTitle={deck.title} />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.length === 0 ? (
              <Card className="col-span-full border-border/40">
                <CardHeader>
                  <CardTitle>No Cards Yet</CardTitle>
                  <p className="text-muted-foreground text-sm mt-2">
                    Add your first flashcard to get started studying!
                  </p>
                </CardHeader>
              </Card>
            ) : (
              cards.map((card) => (
                <FlipCard 
                  key={card.id}
                  front={card.front}
                  back={card.back}
                />
              ))
            )}
          </div>

          {/* Study Mode Button */}
          {cards.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button size="lg" className="font-semibold">
                Start Study Session
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

