"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlipCard } from "@/components/flip-card";
import { AddCardDialog } from "@/components/add-card-dialog";
import { CardsEditMode } from "@/components/cards-edit-mode";
import { GenerateAICardsButton } from "@/components/generate-ai-cards-button";
import { BookOpen } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { cardsTable } from "@/db/schema";

type CardType = InferSelectModel<typeof cardsTable>;

interface DeckContentProps {
  deckId: number;
  deckTitle: string;
  deckDescription: string;
  hasAIFeature: boolean;
  initialCards: CardType[];
}

export function DeckContent({ deckId, deckTitle, deckDescription, hasAIFeature, initialCards }: DeckContentProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  if (isEditMode) {
    return (
      <CardsEditMode
        deckId={deckId}
        initialCards={initialCards}
        onExitEditMode={() => setIsEditMode(false)}
      />
    );
  }

  return (
    <>
      {/* Cards Count and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-muted-foreground">
          {initialCards.length} {initialCards.length === 1 ? "card" : "cards"} in this deck
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {initialCards.length > 0 && (
            <>
              <Link href={`/dashboard/decks/${deckId}/study`}>
                <Button className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Study Now
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setIsEditMode(true)}
              >
                ✏️ Edit Cards
              </Button>
            </>
          )}
          <GenerateAICardsButton 
            deckId={deckId} 
            hasDescription={!!deckDescription && deckDescription.trim().length > 0}
            hasAIFeature={hasAIFeature}
          />
          <AddCardDialog deckId={deckId} deckTitle={deckTitle} />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCards.length === 0 ? (
          <Card className="col-span-full border-border/40">
            <CardHeader>
              <CardTitle>No Cards Yet</CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                Add your first flashcard to get started studying!
              </p>
            </CardHeader>
          </Card>
        ) : (
          initialCards.map((card) => (
            <FlipCard 
              key={card.id}
              front={card.front}
              back={card.back}
            />
          ))
        )}
      </div>

      {/* Study Mode Button */}
      {initialCards.length > 0 && (
        <div className="flex justify-center pt-4">
          <Link href={`/dashboard/decks/${deckId}/study`}>
            <Button size="lg" className="font-semibold gap-2">
              <BookOpen className="h-5 w-5" />
              Start Study Session
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}

