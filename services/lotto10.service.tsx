'use server'

import { Lotto10, Lotto10Detail, queryBuilder } from '../lib/postgres';

export async function findByCode(code: string) {    
    
    return await queryBuilder
    .selectFrom('lotto10')
    .select(['id', 'date', 'code', 'label'])
    .where('code', 'like', code)
    .executeTakeFirst();
}

export async function findLast() {    
    
    return await queryBuilder
    .selectFrom('lotto10')
    .select(['id', 'date', 'code', 'label'])
    .orderBy('date', 'desc')
    .executeTakeFirst();
}

export async function count() {    
    
    return await queryBuilder
    .selectFrom('lotto10')
    .select([e => e.fn.count<number>('id').as('num')])
    .executeTakeFirst();
}

export async function create(lotto: Lotto10) {    
    
    return await queryBuilder
    .insertInto('lotto10')
    .values({
        code: lotto.code,
        date: lotto.date,
        label: lotto.label
      })
      .returning('id')
      .executeTakeFirst();
}

// DETAIL
export async function createDetail(detail: Lotto10Detail) {    
  return await queryBuilder
    .insertInto('lotto10detail')
    .values({
      parent_id: detail.parent_id,
      type: detail.type,
      numbers: detail.numbers
    })
    .returning('id')
    .executeTakeFirst();
}