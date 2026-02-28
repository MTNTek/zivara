-- Migration: Add search_queries table for search analytics and suggestions
-- Created: 2024

-- Create search_queries table
CREATE TABLE IF NOT EXISTS "search_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" varchar(255) NOT NULL,
	"user_id" uuid,
	"session_id" varchar(255),
	"results_count" integer DEFAULT 0 NOT NULL,
	"execution_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "search_queries_query_idx" ON "search_queries" ("query");
CREATE INDEX IF NOT EXISTS "search_queries_created_at_idx" ON "search_queries" ("created_at");

-- Add additional indexes to products table for search optimization
-- These indexes improve search performance for 100k+ products
CREATE INDEX IF NOT EXISTS "products_name_trgm_idx" ON "products" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "products_description_trgm_idx" ON "products" USING gin (description gin_trgm_ops);

-- Note: The trigram indexes require the pg_trgm extension
-- Run this if not already enabled: CREATE EXTENSION IF NOT EXISTS pg_trgm;
