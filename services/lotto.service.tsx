import { queryBuilder, Lotto, LottoDetail, Occurrence, Lotto5 } from '../lib/planetscale';
import { setOccurence } from './occurrence.service';
export async function findByCode(code: string) {    
    
    return await queryBuilder
    .selectFrom('lotto')
    .select(['id', 'date', 'code', 'label'])
    .where('code', 'like', code)
    .executeTakeFirst();
}

export async function findAll() {    
    
    return await queryBuilder
    .selectFrom('lotto')
    .select(['id', 'date', 'code', 'label'])
    .orderBy('date')
    .execute();
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
export async function syncOccurenceByLottoId(lottoId: number) {    
    const extraction = await queryBuilder
        .selectFrom('lotto')
        .innerJoin('lottodetail', 'parent_id', 'lotto.id')
        .select(['lotto.id as id', 'lotto.date as date', 'lotto.code as code', 
        'lottodetail.city as city', 'lottodetail.ext1 as ext1', 'lottodetail.ext2 as ext2', 
        'lottodetail.ext3 as ext3', 'lottodetail.ext4 as ext4', 'lottodetail.ext5 as ext5'])
        .where('lotto.id', '=', lottoId)
        .execute();
    
    for (const { city, date, ext1, ext2, ext3, ext4, ext5 } of extraction) {
        await Promise.all([
            setOccurence(city, ext1, date),
            setOccurence(city, ext2, date),
            setOccurence(city, ext3, date),
            setOccurence(city, ext4, date),
            setOccurence(city, ext5, date)
        ]);
    }
}