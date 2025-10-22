import { integer, pgTable, varchar, text, timestamp, date } from "drizzle-orm/pg-core";

export const decksTable = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const cardsTable = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer().notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text().notNull(), // Question or prompt (e.g., "Dog" or "Who was the first Tudor king?")
  back: text().notNull(), // Answer (e.g., "Anjing" or "Henry VII")
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const aiGenerationsTable = pgTable("ai_generations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  deckId: integer().notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  generatedAt: timestamp().notNull().defaultNow(),
  date: date().notNull().defaultNow(), // For daily grouping (YYYY-MM-DD)
  cardCount: integer().notNull().default(10), // How many cards were generated
});
