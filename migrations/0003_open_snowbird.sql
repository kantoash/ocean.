ALTER TABLE "user" RENAME COLUMN "full_name" TO "name";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "avatar_url" TO "image";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;