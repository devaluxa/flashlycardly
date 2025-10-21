"use client";

import { useState } from "react";
import { createCardManually, createCardWithAI } from "@/app/actions/card-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface AddCardDialogProps {
  deckId: number;
  deckTitle: string;
}

export function AddCardDialog({ deckId, deckTitle }: AddCardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createCardManually({
        deckId,
        front,
        back,
      });

      // Reset form and close dialog
      setFront("");
      setBack("");
      setShowManualForm(false);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create card");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await createCardWithAI({ deckId });

      // Close dialog
      setShowManualForm(false);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate card with AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing
      setShowManualForm(false);
      setFront("");
      setBack("");
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Add Card</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Card to {deckTitle}</DialogTitle>
          <DialogDescription>
            Choose how you want to add a new flashcard to this deck.
          </DialogDescription>
        </DialogHeader>

        {!showManualForm ? (
          <div className="grid gap-4 py-4">
            {/* Option Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                onClick={() => setShowManualForm(true)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">✍️ Manual Entry</CardTitle>
                  <CardDescription>
                    Create a custom flashcard with your own content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Add Manually
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                onClick={handleAIGenerate}
              >
                <CardHeader>
                  <CardTitle className="text-lg">🤖 AI Generated</CardTitle>
                  <CardDescription>
                    Let AI create a contextual flashcard for you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating..." : "Generate with AI"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="front">Front of Card (Question/Prompt)</Label>
              <Textarea
                id="front"
                placeholder="e.g., What is the capital of France?"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                required
                maxLength={1000}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {front.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="back">Back of Card (Answer)</Label>
              <Textarea
                id="back"
                placeholder="e.g., Paris"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                required
                maxLength={1000}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {back.length}/1000 characters
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManualForm(false)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading || !front || !back}>
                {isLoading ? "Creating..." : "Create Card"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

