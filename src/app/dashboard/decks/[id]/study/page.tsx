import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById, getDeckCards } from "@/db/queries/decks";
import { Button } from "@/components/ui/button";
import { StudySession } from "@/components/study-session";

interface StudyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
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

  // Redirect back if no cards to study
  if (cards.length === 0) {
    redirect(`/dashboard/decks/${deckId}`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Link href={`/dashboard/decks/${deckId}`}>
              <Button variant="ghost" className="mb-2">
                ← Back to Deck
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">
              Study: {deck.title}
            </h1>
            {deck.description && (
              <p className="text-muted-foreground">
                {deck.description}
              </p>
            )}
          </div>

          {/* Study Session Component */}
          <StudySession cards={cards} deckTitle={deck.title} />
        </div>
      </div>
    </div>
  );
}

