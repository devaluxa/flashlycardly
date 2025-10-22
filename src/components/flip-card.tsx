"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FlipCardProps {
  front: string;
  back: string;
}

export function FlipCard({ front, back }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="perspective-1000 h-[280px] cursor-pointer"
      onClick={handleFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Card className="h-full border-border/40 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Front
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[calc(100%-80px)]">
              <p className="text-center text-base px-4 py-2 group-hover:scale-105 transition-transform duration-300 overflow-y-auto max-h-full">
                {front}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="h-full border-border/40 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group bg-card/95">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
                Back
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[calc(100%-80px)]">
              <p className="text-center text-base px-4 py-2 group-hover:scale-105 transition-transform duration-300 overflow-y-auto max-h-full">
                {back}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

