import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FlashyCardy - Learn with Flashcards",
  description: "A modern flashcard application with Clerk authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          fontFamily: "var(--font-poppins), sans-serif",
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${poppins.variable} antialiased`}
          suppressHydrationWarning
        >
          {/* Header for signed-in users only */}
          <SignedIn>
            <header className="border-b border-border/40 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
              <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
                <div className="flex items-center">
                  <a href="/dashboard" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
                    FlashyCardy
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-all",
                        userButtonPopoverCard: "bg-black border-white/20",
                        userButtonPopoverActions: "bg-black",
                        userButtonPopoverActionButton: "text-white hover:bg-white/10",
                        userButtonPopoverActionButtonText: "text-white",
                        userButtonPopoverFooter: "hidden"
                      }
                    }}
                    afterSignOutUrl="/"
                  />
                </div>
              </div>
            </header>
          </SignedIn>
          
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
