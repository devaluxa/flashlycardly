"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { batchUpdateAndDeleteCards } from "@/app/actions/card-actions";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { cardsTable } from "@/db/schema";

type CardType = InferSelectModel<typeof cardsTable>;

interface CardsEditModeProps {
  deckId: number;
  initialCards: CardType[];
  onExitEditMode: () => void;
}

export function CardsEditMode({ deckId, initialCards, onExitEditMode }: CardsEditModeProps) {
  const [cards, setCards] = useState(initialCards);
  const [cardsMarkedForDeletion, setCardsMarkedForDeletion] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const handleCardChange = (cardId: number, field: "front" | "back", value: string) => {
    setCards(prev =>
      prev.map(card =>
        card.id === cardId ? { ...card, [field]: value } : card
      )
    );
  };

  const handleMarkForDeletion = (cardId: number) => {
    setCardsMarkedForDeletion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId); // Unmark if already marked
      } else {
        newSet.add(cardId); // Mark for deletion
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    // Filter out cards marked for deletion
    const cardsToUpdate = cards.filter(card => !cardsMarkedForDeletion.has(card.id));
    
    // Validate remaining cards have content
    const hasEmptyFields = cardsToUpdate.some(
      card => card.front.trim() === "" || card.back.trim() === ""
    );

    if (hasEmptyFields) {
      toast.error("All cards must have content on both front and back");
      return;
    }

    // Check if we're deleting all cards
    if (cardsToUpdate.length === 0 && cardsMarkedForDeletion.size > 0) {
      toast.error("Cannot delete all cards. At least one card must remain.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await batchUpdateAndDeleteCards({
        deckId,
        cardsToUpdate: cardsToUpdate.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back,
        })),
        cardIdsToDelete: Array.from(cardsMarkedForDeletion),
      });

      const messages = [];
      if (result.updated > 0) messages.push(`${result.updated} card(s) updated`);
      if (result.deleted > 0) messages.push(`${result.deleted} card(s) deleted`);
      
      toast.success(messages.length > 0 ? messages.join(", ") + "!" : "No changes made");
      onExitEditMode();
    } catch (error) {
      console.error("Error updating cards:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update cards");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Check for content changes
    const hasContentChanges = cards.some((card, index) => {
      const original = initialCards[index];
      return card.front !== original.front || card.back !== original.back;
    });

    // Check for deletion marks
    const hasDeletionMarks = cardsMarkedForDeletion.size > 0;

    if (hasContentChanges || hasDeletionMarks) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }

    onExitEditMode();
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-between sticky top-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 rounded-lg border border-border/40">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Editing {cards.length} {cards.length === 1 ? "card" : "cards"}
          </span>
          {cardsMarkedForDeletion.size > 0 && (
            <span className="text-sm text-destructive font-medium">
              {cardsMarkedForDeletion.size} marked for deletion
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>

      {/* Editable Cards - 3 Column Grid (same as view mode) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const isMarkedForDeletion = cardsMarkedForDeletion.has(card.id);
          
          return (
            <Card 
              key={card.id} 
              className={`border-border/40 flex flex-col relative transition-all duration-200 ${
                isMarkedForDeletion 
                  ? "opacity-50 grayscale border-destructive/50" 
                  : ""
              }`}
            >
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive z-10"
                onClick={() => handleMarkForDeletion(card.id)}
                type="button"
                title={isMarkedForDeletion ? "Undo deletion" : "Mark for deletion"}
              >
                <X className="h-4 w-4" />
              </Button>

              <CardHeader className="pb-3 pr-10">
                <CardTitle className="text-base font-semibold">
                  Card {index + 1}
                  {isMarkedForDeletion && (
                    <span className="ml-2 text-xs font-normal text-destructive">
                      (Will be deleted)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div className="space-y-1.5">
                  <Label htmlFor={`front-${card.id}`} className="text-sm font-medium">
                    Front
                  </Label>
                  <Textarea
                    id={`front-${card.id}`}
                    value={card.front}
                    onChange={(e) => handleCardChange(card.id, "front", e.target.value)}
                    placeholder="Question/Prompt..."
                    className="min-h-[80px] resize-none text-sm"
                    maxLength={1000}
                    disabled={isMarkedForDeletion}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {card.front.length}/1000
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`back-${card.id}`} className="text-sm font-medium">
                    Back
                  </Label>
                  <Textarea
                    id={`back-${card.id}`}
                    value={card.back}
                    onChange={(e) => handleCardChange(card.id, "back", e.target.value)}
                    placeholder="Answer..."
                    className="min-h-[80px] resize-none text-sm"
                    maxLength={1000}
                    disabled={isMarkedForDeletion}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {card.back.length}/1000
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

