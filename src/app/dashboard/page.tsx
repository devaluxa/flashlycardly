import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserDecks } from "@/db/queries/decks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Format date as "Jan 27 2025"
function formatLastUpdated(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Get user information
  const user = await currentUser();

  // Fetch user's decks using query helper
  const decks = await getUserDecks(userId);

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
          </div>

          {/* Create New Deck Button */}
          <div>
            <Button 
              size="lg"
              className="font-semibold"
            >
              + Create New Deck
            </Button>
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
                    <CardTitle>{deck.title}</CardTitle>
                    <CardDescription>{deck.description}</CardDescription>
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

