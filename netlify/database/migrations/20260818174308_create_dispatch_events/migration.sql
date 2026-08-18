CREATE TABLE "dispatch_events" (
	"id" serial PRIMARY KEY,
	"event_type" text NOT NULL,
	"customer_name" text,
	"customer_phone" text,
	"issue_type" text,
	"message" text,
	"priority" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
