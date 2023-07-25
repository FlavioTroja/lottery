import { promises as fs } from 'fs';
import { FileMigrationProvider, Migrator } from 'kysely';
import path from 'path';
import { queryBuilder } from '../../lib/planetscale';

export default async function handler(req, res) {    

    const migrator = new Migrator({
      queryBuilder,
      provider: new FileMigrationProvider({
          fs,
          path,
          // Path to the folder that contains all your migrations.
          migrationFolder: '../../migrations'
      })
    });


    await migrator.migrateUp();

    return res.status(200);
}