import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Upgrade to Pro for unlimited decks and AI-powered flashcard generation
            </p>
          </div>

          {/* Pricing Table */}
          <div className="rounded-lg border bg-card p-8">
            <PricingTable />
          </div>

          {/* Features Comparison */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              What's Included
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-xl font-semibold mb-4">Free Plan</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Up to 3 decks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Unlimited cards per deck</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Basic study mode</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Manual card creation</span>
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="border rounded-lg p-6 bg-card border-primary">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Pro Plan</h3>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span className="font-medium">Unlimited decks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span className="font-medium">AI flashcard generation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Unlimited cards per deck</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Advanced study mode</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include secure cloud storage and access from any device.
              Cancel anytime, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

