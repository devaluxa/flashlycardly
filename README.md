# FlashyCardy 🃏

A modern flashcard application built with Next.js, featuring AI-powered card generation, spaced repetition study sessions, and user authentication.

## Features

- **User Authentication**: Secure authentication and user management with Clerk
- **Deck Management**: Create, edit, and organize flashcard decks
- **Manual Card Creation**: Add flashcards manually with front and back content
- **AI Card Generation** (Pro Feature): Generate 10 flashcards automatically using AI (requires deck title and description)
- **Study Sessions**: Interactive study mode with card flipping and progress tracking
- **Billing & Subscriptions**: Two-tier pricing with free and pro plans

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn UI components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **AI Generation**: Vercel AI SDK with OpenAI
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- Clerk account for authentication
- OpenAI API key (for AI flashcard generation)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
# Get your Neon database connection string from https://neon.tech
DATABASE_URL=your_database_url

# OpenAI API (Required for AI flashcard generation)
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key
```

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your database:

```bash
npm run db:generate
npm run db:migrate
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server Actions for mutations
│   ├── dashboard/        # Dashboard and deck pages
│   ├── pricing/          # Pricing page with Clerk Billing
│   └── layout.tsx        # Root layout with dark theme
├── components/
│   ├── ui/              # shadcn UI components
│   └── ...              # Custom components
├── db/
│   ├── queries/         # Database query helpers
│   └── schema.ts        # Drizzle database schema
└── lib/
    └── validations/     # Zod validation schemas
```

## Features Breakdown

### Free Plan

- Create up to 3 decks
- Manual card creation
- Study sessions
- Basic card management

### Pro Plan

- **Unlimited decks**
- **AI-powered card generation** (10 cards per generation, requires deck description)
- All free features

## AI Card Generation

The AI card generation feature uses OpenAI's GPT-4o-mini model to automatically create flashcards based on:
- Deck title (required)
- Deck description (required)

**Requirements:**
- Pro plan subscription
- Deck must have both a title AND description

When you click "Generate Cards with AI", the system:
1. Checks if you have the Pro plan
   - If no: Shows a tooltip and redirects to the pricing page
2. Checks if deck has a description
   - If no: Shows a tooltip prompting you to add a description
3. If all requirements met: Generates 10 high-quality flashcards tailored to your deck topic

## Database Schema

- **decks**: User flashcard decks (with userId for multi-tenancy)
- **cards**: Individual flashcards linked to decks

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations

## Security

This application follows strict security practices:
- All database queries are filtered by userId
- Server Actions validate input with Zod
- Billing features are checked server-side
- No direct database access from client components

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai)
- [shadcn UI Documentation](https://ui.shadcn.com)

## License

MIT
