'use server'

import { Lotto, LottoDetail, LottoOccurrence, queryBuilder } from '../lib/postgres';
import { formattedDate } from './utils.service';
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
      .returning('id')
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
    .returning('id')
    .executeTakeFirst();
}
  

// OCCURRENCE

    export async function findOccurence(ext: number, city: string) {    
   
        return await queryBuilder
        .selectFrom('lottooccurrence')
        .select(['id', 'date', 'ext', 'city', 'occurrence'])
        .where('ext', '=', ext)
        .where('city', 'like', `${city}`)
        .executeTakeFirst();
    }

    export async function updateOccurrence(id: number | undefined, occurrence: number, date: string[]) {    
   
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

    export async function setOccurence(city: string, ext: number, day: string) { 
        const lottoOccurrence = await findOccurence(ext, city);

        if (!lottoOccurrence) {
            return await createOccurence({
            city,
            ext,
            occurrence: 1,
            date: [day] 
            });
        }

        if (lottoOccurrence.date.includes(day)) {
            return new Error('Estrazione già presente');
        }
        
        const newDates = [...lottoOccurrence.date, day];

        return await updateOccurrence(
            lottoOccurrence.id, 
            (lottoOccurrence.occurrence ?? 0) + 1,
            newDates
        ); 
    }
    
    export async function syncOccurenceByLottoId(lottoId: number) {    
        const extraction = await queryBuilder
            .selectFrom('lotto')
            .innerJoin('lottodetail', 'parent_id', 'lotto.id')
            .select(['lotto.id as id', 'lotto.date as date', 'lotto.code as code', 
            'lottodetail.city as city', 'lottodetail.ext1 as ext1', 'lottodetail.ext2 as ext2', 
            'lottodetail.ext3 as ext3', 'lottodetail.ext4 as ext4', 'lottodetail.ext5 as ext5'])
            .where('lotto.id', '=', lottoId)
            .execute();
        
        for (let i = 0; i < extraction.length; i++) {
            const {city, date, ext1, ext2, ext3, ext4, ext5} = extraction[i];
            console.log(`${formattedDate(date)} > ${city} - ${ext1}, ${ext2}, ${ext3}, ${ext4}, ${ext5}`);
            await setOccurence(city, ext1, formattedDate(date));
            await setOccurence(city, ext2, formattedDate(date));
            await setOccurence(city, ext3, formattedDate(date));
            await setOccurence(city, ext4, formattedDate(date));
            await setOccurence(city, ext5, formattedDate(date));
        }
    }