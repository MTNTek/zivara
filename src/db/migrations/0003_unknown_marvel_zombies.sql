CREATE TABLE "exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_currency" varchar(10) NOT NULL,
	"target_currency" varchar(10) NOT NULL,
	"rate" numeric(16, 8) NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "markup_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid,
	"category_id" uuid,
	"product_id" uuid,
	"markup_type" varchar(20) NOT NULL,
	"markup_value" numeric(10, 2) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_supplier_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"supplier_product_id" varchar(255) NOT NULL,
	"cost_price" numeric(10, 2) NOT NULL,
	"cost_currency" varchar(10) NOT NULL,
	"converted_cost_price" numeric(10, 2),
	"markup_amount" numeric(10, 2),
	"display_price" numeric(10, 2),
	"supplier_product_url" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_order_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"supplier_product_id" varchar(255) NOT NULL,
	"cost_price_at_order" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"supplier_order_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"cost_total" numeric(10, 2) NOT NULL,
	"exchange_rate_used" numeric(16, 8),
	"exchange_rate_id" uuid,
	"tracking_number" varchar(255),
	"carrier_name" varchar(100),
	"tracking_status" varchar(50),
	"tracking_updated_at" timestamp,
	"estimated_delivery" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"credential_type" varchar(50) NOT NULL,
	"encrypted_value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_supplier_link_id" uuid NOT NULL,
	"old_cost_price" numeric(10, 2) NOT NULL,
	"new_cost_price" numeric(10, 2) NOT NULL,
	"old_display_price" numeric(10, 2),
	"new_display_price" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"display_label" varchar(255),
	"base_url" text,
	"status" varchar(50) DEFAULT 'inactive' NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"last_error" text,
	"last_health_check" timestamp,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"job_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"products_checked" integer DEFAULT 0,
	"products_updated" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"result_summary" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "markup_rules" ADD CONSTRAINT "markup_rules_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "markup_rules" ADD CONSTRAINT "markup_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "markup_rules" ADD CONSTRAINT "markup_rules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_supplier_links" ADD CONSTRAINT "product_supplier_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_supplier_links" ADD CONSTRAINT "product_supplier_links_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_order_items" ADD CONSTRAINT "sub_order_items_sub_order_id_sub_orders_id_fk" FOREIGN KEY ("sub_order_id") REFERENCES "public"."sub_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_order_items" ADD CONSTRAINT "sub_order_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD CONSTRAINT "sub_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD CONSTRAINT "sub_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD CONSTRAINT "sub_orders_exchange_rate_id_exchange_rates_id_fk" FOREIGN KEY ("exchange_rate_id") REFERENCES "public"."exchange_rates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_credentials" ADD CONSTRAINT "supplier_credentials_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_price_history" ADD CONSTRAINT "supplier_price_history_product_supplier_link_id_product_supplier_links_id_fk" FOREIGN KEY ("product_supplier_link_id") REFERENCES "public"."product_supplier_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exchange_rates_pair_idx" ON "exchange_rates" USING btree ("source_currency","target_currency");--> statement-breakpoint
CREATE INDEX "exchange_rates_fetched_idx" ON "exchange_rates" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX "markup_rules_supplier_idx" ON "markup_rules" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "markup_rules_category_idx" ON "markup_rules" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "markup_rules_product_idx" ON "markup_rules" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "psl_product_idx" ON "product_supplier_links" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "psl_supplier_idx" ON "product_supplier_links" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "psl_supplier_product_idx" ON "product_supplier_links" USING btree ("supplier_id","supplier_product_id");--> statement-breakpoint
CREATE INDEX "psl_primary_idx" ON "product_supplier_links" USING btree ("product_id","is_primary");--> statement-breakpoint
CREATE INDEX "sub_order_items_sub_order_idx" ON "sub_order_items" USING btree ("sub_order_id");--> statement-breakpoint
CREATE INDEX "sub_order_items_order_item_idx" ON "sub_order_items" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "sub_orders_order_idx" ON "sub_orders" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "sub_orders_supplier_idx" ON "sub_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "sub_orders_status_idx" ON "sub_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "supplier_credentials_supplier_idx" ON "supplier_credentials" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_price_history_link_idx" ON "supplier_price_history" USING btree ("product_supplier_link_id");--> statement-breakpoint
CREATE INDEX "supplier_price_history_created_idx" ON "supplier_price_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "suppliers_name_idx" ON "suppliers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "suppliers_type_idx" ON "suppliers" USING btree ("type");--> statement-breakpoint
CREATE INDEX "suppliers_status_idx" ON "suppliers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_jobs_supplier_idx" ON "sync_jobs" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "sync_jobs_status_idx" ON "sync_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_jobs_type_idx" ON "sync_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "sync_jobs_supplier_type_status_idx" ON "sync_jobs" USING btree ("supplier_id","job_type","status");