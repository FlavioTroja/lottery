'use server'

import { queryBuilder, Extraction } from '../lib/planetscale';
//import { Extraction } from '../app/table';

export async function findByCode(code: string) {    
    
    const result = await queryBuilder
    .selectFrom('extractions')
    .select(['id', 'date', 'code', 'label'])
    .where('code', 'like', code)
    .executeTakeFirst();

    console.log(result);

    return result;
}

export async function create(extraction: Extraction) {    
    
    const result = await queryBuilder
    .insertInto('extractions')
    .values({
        code: extraction.code,
        date: extraction.date,
        label: extraction.label,
        details: extraction.details
      })
      .executeTakeFirst();

      console.log(result);

      return result;
}
