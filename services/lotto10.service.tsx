'use server'

import { queryBuilder, Lotto } from '../lib/planetscale';

export async function findByCode(code: string) {    
    
    return await queryBuilder
    .selectFrom('lotto')
    .select(['id', 'date', 'code', 'label'])
    .where('code', 'like', code)
    .executeTakeFirst();
}

export async function findLast() {    
    
    return await queryBuilder
    .selectFrom('lotto')
    .select(['id', 'date', 'code', 'label'])
    .orderBy('date', 'desc')
    .executeTakeFirst();
}

export async function count() {    
    
    return await queryBuilder
    .selectFrom('lotto')
    .select([e => e.fn.count<number>('id').as('num')])
    .executeTakeFirst();
}

export async function create(lotto: Lotto) {    
    
    return await queryBuilder
    .insertInto('lotto')
    .values({
        code: lotto.code,
        date: lotto.date,
        label: lotto.label
      })
      .executeTakeFirst();
}
