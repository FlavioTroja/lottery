'use server'

import { queryBuilder, Extraction } from '../lib/planetscale';
//import { Extraction } from '../app/table';

export async function findByCode(code: string) {    
    
    return await queryBuilder
    .selectFrom('extractions')
    .select(['id', 'date', 'code', 'label'])
    .where('code', 'like', code)
    .executeTakeFirst();
}

export async function findLast() {    
    
    return await queryBuilder
    .selectFrom('extractions')
    .select(['id', 'date', 'code', 'label'])
    .orderBy('date', 'desc')
    .executeTakeFirst();
}

export async function count() {    
    
    return await queryBuilder
    .selectFrom('extractions')
    .select([e => e.fn.count<number>('id').as('num')])
    .executeTakeFirst();
}

export async function create(extraction: Extraction) {    
    
    return await queryBuilder
    .insertInto('extractions')
    .values({
        code: extraction.code,
        date: extraction.date,
        label: extraction.label
      })
      .executeTakeFirst();
}
