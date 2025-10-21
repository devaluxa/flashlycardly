import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  // Redirect logged-in users to dashboard
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <SignedOut>
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-white">
              FlashyCardy
            </h1>
            <p className="text-xl text-gray-400">
              Your personal flashcard platform
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <SignInButton mode="modal">
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 bg-white text-white hover:bg-gray-200 border-0"
              >
                Sign In
              </Button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 bg-transparent text-white hover:bg-white/10 border-white/20"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}
