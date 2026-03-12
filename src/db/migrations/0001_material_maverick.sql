CREATE TABLE "search_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" varchar(255) NOT NULL,
	"user_id" uuid,
	"session_id" varchar(255),
	"results_count" integer DEFAULT 0 NOT NULL,
	"execution_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "search_queries_query_idx" ON "search_queries" USING btree ("query");--> statement-breakpoint
CREATE INDEX "search_queries_created_at_idx" ON "search_queries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_guest_email_idx" ON "orders" USING btree ("guest_email");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price");--> statement-breakpoint
CREATE INDEX "products_rating_idx" ON "products" USING btree ("average_rating");--> statement-breakpoint
CREATE INDEX "products_is_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "products_active_category_idx" ON "products" USING btree ("is_active","category_id");--> statement-breakpoint
CREATE INDEX "products_active_price_idx" ON "products" USING btree ("is_active","price");--> statement-breakpoint
CREATE INDEX "reviews_product_rating_idx" ON "reviews" USING btree ("product_id","rating");--> statement-breakpoint
CREATE INDEX "reviews_product_created_idx" ON "reviews" USING btree ("product_id","created_at");