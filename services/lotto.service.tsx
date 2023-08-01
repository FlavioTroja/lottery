'use server'

import { queryBuilder, Lotto, LottoDetail, LottoOccurrence } from '../lib/planetscale';

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


// DETAIL
  
export async function createDetail(detail: LottoDetail) {    
    
    return await queryBuilder
    .insertInto('lottodetail')
    .values({
        code: detail.code,
        city: detail.city,
        ext1: detail.ext1,
        ext2: detail.ext2,
        ext3: detail.ext3,
        ext4: detail.ext4,
        ext5: detail.ext5,
        parent_id: detail.parent_id
    })
    .executeTakeFirst();
}
  

// OCCURRENCE

    export async function findOccurencesByExt(ext: number, city?: string) {    
   
        return await queryBuilder
        .selectFrom('lottooccurrence')
        .select(['id', 'date', 'ext', 'city', 'occurrence'])
        .where('ext', '=', ext)
        .where('city', 'like', `${city}`)
        .execute();
    }

    export async function updateOccurrence(id: number, occurrence: number, date: string) {    
   
        return await queryBuilder
        .updateTable('lottooccurrence')
        .set({
            occurrence,
            date
        })
        .where('id', '=', id)
        .executeTakeFirst()
    }

    export async function createOccurence(occ: LottoOccurrence) {    
    
        return await queryBuilder
        .insertInto('lottooccurrence')
        .values({
            ext: occ.ext,
            city: occ.city,
            date: occ.date,
            occurrence: occ.occurrence
        })
        .executeTakeFirst();
    }