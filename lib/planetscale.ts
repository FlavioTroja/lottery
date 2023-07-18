import 'server-only';
import { Generated, Kysely } from 'kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';

interface User {
  id: Generated<number>;
  name: string;
  username: string;
  email: string;
}

interface Extraction {
  id: Generated<number>;
  date: string;
  code: string;
  details: ExtractionDetail[];
}

interface ExtractionDetail {
  id: Generated<number>;
  city: string;
  ext1: string;
  ext2: string;
  ext3: string;
  ext4: string;
  ext5: string;
}

interface Database {
  users: User;
  extractions: Extraction;
  extractionDetails: ExtractionDetail;
  // https://github.com/nextauthjs/next-auth/issues/4922
}

export const queryBuilder = new Kysely<Database>({
  dialect: new PlanetScaleDialect({
    url: process.env.DATABASE_URL
  })
});
