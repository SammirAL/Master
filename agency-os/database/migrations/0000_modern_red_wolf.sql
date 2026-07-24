CREATE TYPE "public"."client_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."decision_kind" AS ENUM('validation', 'prioritization', 'arbitration', 'escalation', 'planning');--> statement-breakpoint
CREATE TYPE "public"."decision_outcome" AS ENUM('approve', 'reject', 'revise', 'defer', 'escalate_to_human');--> statement-breakpoint
CREATE TYPE "public"."memory_collection" AS ENUM('mem_sites', 'mem_clients', 'mem_agents', 'mem_decisions', 'mem_seo_campaigns', 'mem_articles', 'mem_competitors', 'mem_keywords');--> statement-breakpoint
CREATE TYPE "public"."memory_type" AS ENUM('fact', 'lesson', 'preference', 'outcome', 'profile');--> statement-breakpoint
CREATE TYPE "public"."permission_level" AS ENUM('L0', 'L1', 'L2', 'L3');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('wordpress', 'shopify', 'laravel', 'nextjs', 'other');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('P0', 'P1', 'P2', 'P3');--> statement-breakpoint
CREATE TYPE "public"."site_status" AS ENUM('onboarding', 'active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."status_global" AS ENUM('green', 'yellow', 'red');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('draft', 'assigned', 'in_progress', 'blocked', 'awaiting_validation', 'rejected', 'done', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."validation_policy" AS ENUM('standard', 'strict');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contacts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sites" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"business_goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"editorial_preferences" jsonb NOT NULL,
	"validation_policy" "validation_policy" DEFAULT 'standard' NOT NULL,
	"budget" jsonb NOT NULL,
	"status" "client_status" NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"platform" "platform" NOT NULL,
	"environments" jsonb NOT NULL,
	"repo" jsonb,
	"credentials_ref" text NOT NULL,
	"objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"kpis" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"competitors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "site_status" NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" "priority" NOT NULL,
	"site_id" text,
	"client_id" text,
	"agent" text NOT NULL,
	"created_by" text NOT NULL,
	"workflow_run_id" text,
	"depends_on" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deadline" timestamp with time zone,
	"status" "task_status" NOT NULL,
	"permission_level_required" "permission_level" NOT NULL,
	"validation" jsonb,
	"logs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"result" jsonb,
	"history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cost" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"agent" text NOT NULL,
	"site_id" text,
	"client_id" text,
	"period" jsonb,
	"status_global" "status_global" NOT NULL,
	"sections" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "decision_kind" NOT NULL,
	"subject" jsonb NOT NULL,
	"context_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"options_considered" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"decision" "decision_outcome" NOT NULL,
	"rationale" text NOT NULL,
	"conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"decided_by" text NOT NULL,
	"at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents_state" (
	"agent" text PRIMARY KEY NOT NULL,
	"runs" integer DEFAULT 0 NOT NULL,
	"success_rate" numeric(5, 4) DEFAULT '0' NOT NULL,
	"tokens_cumulative" bigint DEFAULT 0 NOT NULL,
	"mcp_calls_cumulative" bigint DEFAULT 0 NOT NULL,
	"cost_usd_cumulative" numeric(12, 4) DEFAULT '0' NOT NULL,
	"last_heartbeat" timestamp with time zone,
	"kill_switch" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"kind" text NOT NULL,
	"actor" text NOT NULL,
	"task_id" text,
	"server" text,
	"method" text,
	"args_summary" text,
	"result" text,
	"duration_ms" integer,
	"detail" jsonb
);
--> statement-breakpoint
CREATE TABLE "kpis" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"client_id" text,
	"name" text NOT NULL,
	"value" double precision NOT NULL,
	"unit" text,
	"source" text NOT NULL,
	"captured_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"notes" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keywords" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"keyword" text NOT NULL,
	"intent" text,
	"position" integer,
	"captured_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_index" (
	"id" text PRIMARY KEY NOT NULL,
	"collection" "memory_collection" NOT NULL,
	"site_id" text,
	"client_id" text,
	"agent" text,
	"type" "memory_type" NOT NULL,
	"content" text NOT NULL,
	"source_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" double precision NOT NULL,
	"valid_until" timestamp with time zone,
	"embedding_model" text,
	"qdrant_point_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keywords" ADD CONSTRAINT "keywords_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sites_client_id_idx" ON "sites" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "tasks_site_id_idx" ON "tasks" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_agent_idx" ON "tasks" USING btree ("agent");--> statement-breakpoint
CREATE INDEX "reports_task_id_idx" ON "reports" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "reports_site_id_idx" ON "reports" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "decisions_kind_idx" ON "decisions" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor");--> statement-breakpoint
CREATE INDEX "audit_log_task_id_idx" ON "audit_log" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "audit_log_kind_idx" ON "audit_log" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "kpis_site_name_idx" ON "kpis" USING btree ("site_id","name");--> statement-breakpoint
CREATE INDEX "kpis_captured_at_idx" ON "kpis" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX "competitors_site_id_idx" ON "competitors" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "keywords_site_keyword_idx" ON "keywords" USING btree ("site_id","keyword");--> statement-breakpoint
CREATE INDEX "memory_index_collection_idx" ON "memory_index" USING btree ("collection");--> statement-breakpoint
CREATE INDEX "memory_index_site_id_idx" ON "memory_index" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "memory_index_client_id_idx" ON "memory_index" USING btree ("client_id");