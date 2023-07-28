import { Generated, Kysely } from 'kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';

interface User {
  id: Generated<number>;
  name: string;
  username: string;
  email: string;
}

export interface Lotto {
  id?: Generated<number>;
  date: Date;
  code: string;
  label: string;
}

export interface LottoDetail {
  id?: Generated<number>;
  code: string;
  city: string;
  ext1: number;
  ext2: number;
  ext3: number;
  ext4: number;
  ext5: number;
  parent_id: number;
}

export interface Database {
  users: User;
  lotto: Lotto;
  lottodetail: LottoDetail;
  // https://github.com/nextauthjs/next-auth/issues/4922
}

export const queryBuilder = new Kysely<Database>({
  dialect: new PlanetScaleDialect({
    url: process.env.DATABASE_URL
  })
});
