import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('extractions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('code', 'varchar(10)', (col) => col.notNull().unique())
    .addColumn('label', 'varchar')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()

  await db.schema
    .createTable('extractionDetails')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('code', 'varchar(2)', (col) => col.notNull())
    .addColumn('city', 'varchar')
    .addColumn('ext1', 'integer')
    .addColumn('ext2', 'integer')
    .addColumn('ext3', 'integer')
    .addColumn('ext4', 'integer')
    .addColumn('ext5', 'integer')
    .addColumn('extraction_id', 'integer', (col) =>
      col.references('extractions.id').onDelete('cascade').notNull()
    )
    .execute()

  await db.schema
    .createIndex('extraction_details_id_index')
    .on('extractionDetails')
    .column('extraction_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('extractionDetails').execute()
  await db.schema.dropTable('extractions').execute()
}