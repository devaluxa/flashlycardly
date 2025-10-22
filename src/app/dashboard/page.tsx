import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserDecks } from "@/db/queries/decks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { DeleteDeckDialog } from "@/components/delete-deck-dialog";

// Format date as "Jan 27 2025"
function formatLastUpdated(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
}

export default async function DashboardPage() {
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Get user information
  const user = await currentUser();

  // Fetch user's decks using query helper
  const decks = await getUserDecks(userId);

  // Check if user has unlimited decks feature (Pro plan)
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const deckLimit = 3;
  const hasReachedLimit = !hasUnlimitedDecks && decks.length >= deckLimit;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold">
              Welcome {user?.firstName || "User"}
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your flashcard decks and track your progress
            </p>
            {/* Show deck limit for free users */}
            {!hasUnlimitedDecks && (
              <p className="text-sm text-muted-foreground">
                Free plan: {decks.length}/{deckLimit} decks used
                {hasReachedLimit && " - "}
                {hasReachedLimit && (
                  <Link href="/pricing" className="text-primary hover:underline">
                    Upgrade to Pro for unlimited decks
                  </Link>
                )}
              </p>
            )}
          </div>

          {/* Create New Deck Button */}
          <div>
            {hasReachedLimit ? (
              <div className="space-y-3">
                <Button 
                  size="lg"
                  className="font-semibold"
                  disabled
                >
                  + Create New Deck
                </Button>
                <p className="text-sm text-muted-foreground">
                  You've reached the free plan limit of {deckLimit} decks.{" "}
                  <Link href="/pricing" className="text-primary hover:underline font-medium">
                    Upgrade to Pro
                  </Link>{" "}
                  for unlimited decks and AI-powered flashcard generation.
                </p>
              </div>
            ) : (
              <CreateDeckDialog>
                <Button 
                  size="lg"
                  className="font-semibold"
                >
                  + Create New Deck
                </Button>
              </CreateDeckDialog>
            )}
          </div>

          {/* Decks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.length === 0 ? (
              <Card className="col-span-full border-border/40">
                <CardHeader>
                  <CardTitle>No Decks Yet</CardTitle>
                  <CardDescription>
                    Create your first flashcard deck to get started!
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              decks.map((deck) => (
                <Card key={deck.id} className="border-border/40 hover:border-border/60 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{deck.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{deck.description}</CardDescription>
                      </div>
                      <DeleteDeckDialog deckId={deck.id} deckTitle={deck.title} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/dashboard/decks/${deck.id}`}>
                      <Button variant="outline" className="w-full">
                        Study Deck
                      </Button>
                    </Link>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(deck.updatedAt).getTime() !== new Date(deck.createdAt).getTime() 
                        ? `Last updated: ${formatLastUpdated(new Date(deck.updatedAt))}`
                        : `Created: ${formatLastUpdated(new Date(deck.createdAt))}`
                      }
                    </p>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

