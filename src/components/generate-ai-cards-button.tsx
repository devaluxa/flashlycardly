"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { generateCardsWithAI } from "@/app/actions/card-actions";
import { toast } from "sonner";

interface GenerateAICardsButtonProps {
  deckId: number;
  hasDescription: boolean;
  hasAIFeature: boolean;
}

export function GenerateAICardsButton({ deckId, hasDescription, hasAIFeature }: GenerateAICardsButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    // If user doesn't have the feature, redirect to pricing
    if (!hasAIFeature) {
      router.push("/pricing");
      return;
    }

    // If deck doesn't have description, show error
    if (!hasDescription) {
      toast.error("Please add a description to your deck before generating cards with AI.");
      return;
    }

    // User has the feature and deck has description, generate cards
    setIsGenerating(true);
    try {
      const result = await generateCardsWithAI({
        deckId,
        count: 10,
      });

      toast.success(`Successfully generated ${result.count} flashcards with AI! 🎉 (${result.remainingToday} generations remaining today)`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate flashcards";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }

  const button = (
    <Button
      variant={hasAIFeature && hasDescription ? "default" : "outline"}
      onClick={handleGenerate}
      disabled={isGenerating}
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Generate Cards with AI"}
    </Button>
  );

  // If user doesn't have the feature, wrap button in tooltip
  if (!hasAIFeature) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              AI flashcard generation is a Pro feature. Click to upgrade and
              unlock AI-powered card creation!
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If deck doesn't have description, show tooltip
  if (!hasDescription) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              AI generation requires a deck description. Please add a description to your deck to use this feature.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // User has the feature and deck has description, show button without tooltip
  return button;
}

