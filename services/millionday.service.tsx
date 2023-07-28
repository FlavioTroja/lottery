'use server'

import { queryBuilder, MillionDay } from '../lib/planetscale';

export async function findByCode(code: string) {    
    
    return await queryBuilder
    .selectFrom('millionday')
    .select(['id', 'date', 'code', 'label'])
    .where('code', 'like', code)
    .executeTakeFirst();
}

export async function findLast() {    
    
    return await queryBuilder
    .selectFrom('millionday')
    .select(['id', 'date', 'code', 'label'])
    .orderBy('date', 'desc')
    .executeTakeFirst();
}

export async function count() {    
    
    return await queryBuilder
    .selectFrom('millionday')
    .select([e => e.fn.count<number>('id').as('num')])
    .executeTakeFirst();
}

export async function create(millionday: MillionDay) {    
    
    return await queryBuilder
    .insertInto('millionday')
    .values({
        code: millionday.code,
        date: millionday.date,
        label: millionday.label
      })
      .executeTakeFirst();
}
