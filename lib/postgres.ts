import { Generated, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

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

export interface LottoOccurrence {
  id?: Generated<number>;
  date: string[];
  ext: number;
  city: string;
  occurrence: number;
}

export interface Lotto10 {
  id?: Generated<number>;
  type: 'LOTTO10' | 'LOTTO5';
  date: Date;
  code: string;
  label: string;
}

export interface Lotto10Detail {
  id?: Generated<number>;
  parent_id: number;
  type: 'PRIMARY' | 'NUMERO ORO' | 'DOPPIO ORO' | 'EXTRA';
  numbers: number[];
}

export interface Lotto10Occurrence {
  id?: Generated<number>;
  date: string[];             
  ext: number;                
  type: 'PRIMARY' | 'NUMERO ORO' | 'DOPPIO ORO' | 'EXTRA'; 
  occurrence: number;         
}

export interface MillionDay {
  id?: Generated<number>;
  date: Date;
  code: string;
  label: string;
}

export interface MillionDayDetail {
  id?: Generated<number>;
  type: string;
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
  lottooccurrence: LottoOccurrence;
  lotto10: Lotto10;
  lotto10detail: Lotto10Detail;
  lotto10occurrence: Lotto10Occurrence;
  millionday: MillionDay;
  milliondaydetail: MillionDayDetail;
  // eventuali altre tabelle
}

export const queryBuilder = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL // Variabile d'ambiente con URL di Neon Postgres
    }),
  }),
});

