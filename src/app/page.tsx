import { SignedIn, SignedOut } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <SignedOut>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Welcome to{" "}
              <span className="text-blue-500">Flashy Cardy Course</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Master any subject with our interactive flashcard learning system.
              <br />
              Create, study, and track your progress all in one place.
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Get Started Today
            </h2>
            <p className="text-muted-foreground">
              Sign up or sign in to start creating your
              <br />
              personalized flashcard decks.
            </p>
            <p className="text-sm text-muted-foreground pt-2">
              Click the buttons in the header above to get started! 👆
            </p>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              WELCOME{" "}
              <span className="text-blue-500">
                {user?.firstName?.toUpperCase() || "USER"}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to continue your learning journey?
              <br />
              Let's master some flashcards today!
            </p>
          </div>

          <div className="pt-8">
            <button className="inline-flex items-center justify-center rounded-md text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-12 px-8 py-2">
              Start Learning
            </button>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
