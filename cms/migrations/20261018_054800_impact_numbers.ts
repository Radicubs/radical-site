import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_page_impact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"prefix" varchar,
  	"value" numeric NOT NULL,
  	"suffix" varchar,
  	"label" varchar NOT NULL,
  	"detail" varchar
  );
  
  ALTER TABLE "home_page_impact" ADD CONSTRAINT "home_page_impact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_impact_order_idx" ON "home_page_impact" USING btree ("_order");
  CREATE INDEX "home_page_impact_parent_id_idx" ON "home_page_impact" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_page_impact" CASCADE;`)
}
