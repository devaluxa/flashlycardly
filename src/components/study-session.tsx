"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, CheckCircle2, Circle } from "lucide-react";

interface CardData {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StudySessionProps {
  cards: CardData[];
  deckTitle: string;
}

export function StudySession({ cards, deckTitle }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState(cards);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = studyCards[currentIndex];
  const progress = ((currentIndex + 1) / studyCards.length) * 100;
  const knownCount = knownCards.size;

  // Reset flip state when moving to a new card
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setIsComplete(false);
  };

  const handleReset = () => {
    setStudyCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setIsComplete(false);
  };

  const toggleKnown = () => {
    const newKnownCards = new Set(knownCards);
    if (knownCards.has(currentCard.id)) {
      newKnownCards.delete(currentCard.id);
    } else {
      newKnownCards.add(currentCard.id);
    }
    setKnownCards(newKnownCards);
  };

  const isCurrentCardKnown = knownCards.has(currentCard.id);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "k" || e.key === "K") {
        toggleKnown();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, isFlipped, knownCards]);

  if (isComplete) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/50">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              🎉 Study Session Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-lg text-muted-foreground">
                  You've reviewed all <span className="font-semibold text-foreground">{studyCards.length}</span> cards in this deck.
                </p>
                <p className="text-lg">
                  Marked as known: <span className="font-semibold text-primary">{knownCount}</span> / {studyCards.length}
                </p>
              </div>
              
              {knownCount < studyCards.length && (
                <div className="bg-card/50 rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground">
                    {studyCards.length - knownCount} cards still need review
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRestart} size="lg" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Study Again
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
                Reset & Shuffle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {studyCards.length}
          </span>
          <span className="text-muted-foreground">
            Known: {knownCount} / {studyCards.length}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="perspective-1000">
        <div
          className="relative min-h-[400px] cursor-pointer"
          onClick={handleFlip}
        >
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of card */}
            <div
              className="absolute w-full h-full"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <Card className="h-full min-h-[400px] border-2 border-border/40 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Question
                  </CardTitle>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKnown();
                    }}
                    className="transition-colors hover:scale-110 transition-transform"
                  >
                    {isCurrentCardKnown ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </button>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[calc(100%-80px)] min-h-[320px]">
                  <p className="text-center text-xl px-6 py-8 overflow-y-auto max-h-full leading-relaxed">
                    {currentCard.front}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Back of card */}
            <div
              className="absolute w-full h-full"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <Card className="h-full min-h-[400px] border-2 border-primary/50 shadow-lg shadow-primary/20 bg-card/95">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
                    Answer
                  </CardTitle>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKnown();
                    }}
                    className="transition-colors hover:scale-110 transition-transform"
                  >
                    {isCurrentCardKnown ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </button>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[calc(100%-80px)] min-h-[320px]">
                  <p className="text-center text-xl px-6 py-8 overflow-y-auto max-h-full leading-relaxed">
                    {currentCard.back}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Flip hint */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Click card or press <kbd className="px-2 py-1 bg-secondary rounded text-xs">Space</kbd> to flip
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            size="lg"
            className="flex-1 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={toggleKnown}
            variant={isCurrentCardKnown ? "default" : "outline"}
            size="lg"
            className="gap-2"
          >
            {isCurrentCardKnown ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Known
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Mark Known
              </>
            )}
          </Button>

          <Button
            onClick={handleNext}
            variant="default"
            size="lg"
            className="flex-1 gap-2"
          >
            {currentIndex === studyCards.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Additional Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleShuffle}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle
          </Button>
          <Button
            onClick={handleRestart}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <Card className="bg-secondary/30 border-border/50">
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold mb-2">Keyboard Shortcuts:</p>
            <div className="grid grid-cols-2 gap-2">
              <div><kbd className="px-2 py-1 bg-background rounded">←</kbd> Previous card</div>
              <div><kbd className="px-2 py-1 bg-background rounded">→</kbd> Next card</div>
              <div><kbd className="px-2 py-1 bg-background rounded">Space</kbd> Flip card</div>
              <div><kbd className="px-2 py-1 bg-background rounded">K</kbd> Toggle known</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

