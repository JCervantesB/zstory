CREATE TABLE "game_scenes" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"order" integer NOT NULL,
	"narrativeText" text NOT NULL,
	"imageUrl" text NOT NULL,
	"secondaryCharacterId" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"lastActive" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "characterName" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "characterLastName" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "characterDescription" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "characterSpecialty" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "characterItems" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "characterVisualPrompt" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "characterImageUrl" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "currentSessionId" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "isOnboarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "game_scenes" ADD CONSTRAINT "game_scenes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_scenes" ADD CONSTRAINT "game_scenes_secondaryCharacterId_fkey" FOREIGN KEY ("secondaryCharacterId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;