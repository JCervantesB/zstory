import { pgTable, text, timestamp, boolean, unique, foreignKey, integer } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// User table - matches Better Auth schema + game character data
export const users = pgTable('user', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  
  // Character data
  characterName: text('characterName'),
  characterLastName: text('characterLastName'),
  characterDescription: text('characterDescription'),
  characterSpecialty: text('characterSpecialty'), // Character specialty/trait
  characterItems: text('characterItems'), // JSON array as string
  characterVisualPrompt: text('characterVisualPrompt'),
  characterImageUrl: text('characterImageUrl'),
  characterClothingSet: text('characterClothingSet'), // Selected clothing set ID
  characterSelectedItems: text('characterSelectedItems'), // JSON array of selected item IDs
  characterOriginLocation: text('characterOriginLocation'), // Place of origin (country, city, fictional place)
  characterCurrentLocation: text('characterCurrentLocation'), // Current location (country, city, fictional place)
  
  // Game state
  currentSessionId: text('currentSessionId'),
  isOnboarded: boolean('isOnboarded').default(false).notNull(),
}, (table) => [
  unique('user_email_key').on(table.email),
]);

// Session table - matches Better Auth schema
export const sessions = pgTable('session', {
  id: text('id').primaryKey().notNull(),
  expiresAt: timestamp('expiresAt', { mode: 'string' }).notNull(),
  token: text('token').notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'session_userId_fkey'
  }).onDelete('cascade'),
  unique('session_token_key').on(table.token),
]);

// Account table - matches Better Auth schema
export const accounts = pgTable('account', {
  id: text('id').primaryKey().notNull(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { mode: 'string' }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { mode: 'string' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'account_userId_fkey'
  }).onDelete('cascade'),
]);

// Verification table - matches Better Auth schema
export const verifications = pgTable('verification', {
  id: text('id').primaryKey().notNull(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { mode: 'string' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

// Game Sessions table
export const gameSessions = pgTable('game_sessions', {
  id: text('id').primaryKey().notNull(),
  userId: text('userId').notNull(),
  title: text('title'),
  createdAt: timestamp('createdAt', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastActive: timestamp('lastActive', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  isCompleted: boolean('isCompleted').default(false).notNull(),
  isPublic: boolean('isPublic').default(false).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'game_sessions_userId_fkey'
  }).onDelete('cascade'),
]);

// Game Scenes table
export const gameScenes = pgTable('game_scenes', {
  id: text('id').primaryKey().notNull(),
  sessionId: text('sessionId').notNull(),
  order: integer('order').notNull(),
  narrativeText: text('narrativeText').notNull(),
  imageUrl: text('imageUrl').notNull(),
  secondaryCharacterId: text('secondaryCharacterId'), // optional: ID of another player
  createdAt: timestamp('createdAt', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.sessionId],
    foreignColumns: [gameSessions.id],
    name: 'game_scenes_sessionId_fkey'
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.secondaryCharacterId],
    foreignColumns: [users.id],
    name: 'game_scenes_secondaryCharacterId_fkey'
  }).onDelete('set null'),
]);

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  gameSessions: many(gameSessions),
  gameScenes: many(gameScenes, { relationName: 'secondaryCharacter' }),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
  scenes: many(gameScenes),
}));

export const gameScenesRelations = relations(gameScenes, ({ one }) => ({
  session: one(gameSessions, {
    fields: [gameScenes.sessionId],
    references: [gameSessions.id],
  }),
  secondaryCharacter: one(users, {
    fields: [gameScenes.secondaryCharacterId],
    references: [users.id],
    relationName: 'secondaryCharacter',
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type GameScene = typeof gameScenes.$inferSelect;
export type NewGameScene = typeof gameScenes.$inferInsert;