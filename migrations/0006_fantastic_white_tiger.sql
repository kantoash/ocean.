ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "emailVerified" timestamp;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "billing_address";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "payment_method";