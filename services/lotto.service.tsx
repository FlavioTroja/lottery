import { queryBuilder, Lotto, LottoDetail, Occurrence, Lotto5 } from '../lib/planetscale';
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

// LOTTO5
export async function createLotto5(lotto5: Lotto5) {    
    
    return await queryBuilder
    .insertInto('lotto5')
    .values({
        code: lotto5.code,
        date: lotto5.date,
        progressive_daily: lotto5.progressive_daily,
        maximum_progressive_daily: lotto5.maximum_progressive_daily,
        numbers: lotto5.numbers,
        numbers_overtime: lotto5.numbers_overtime,
        special_number: lotto5.special_number,
        double_special_number: lotto5.double_special_number,
        gong_number: lotto5.gong_number
    })
    .executeTakeFirst();
}
  

// OCCURRENCE

    export async function findOccurence(ext: number, wheel: string) {    
   
        return await queryBuilder
        .selectFrom('occurrence')
        .select(['id', 'date', 'ext', 'wheel', 'hit'])
        .where('ext', '=', ext)
        .where('wheel', 'like', `${wheel}`)
        .executeTakeFirst();
    }

    export async function aggregateOccurrence(wheel?: string) {
        if (!!wheel) {
            return await queryBuilder
                .selectFrom('occurrence')
                .select(['date', 'ext', 'hit'])
                .where('wheel', 'like', `${wheel}`)
                .orderBy('ext')
                .execute();         
        }

        const occs = await queryBuilder
            .selectFrom('occurrence')
            .select(['date', 'ext', 'wheel', 'hit'])
            .orderBy('ext')
            .execute();     
        
        return occs.map(occ => ({
            date: occs.filter(({ext}) => ext === occ.ext).reduce((acc, cur) => acc + cur.date, ''),
            ext: occ.ext,
            occurrence: occs.filter(({ext}) => ext === occ.ext).reduce((acc, cur) => acc + cur.hit, 0)
        }));
    }

    export async function updateOccurrence(id: number | undefined, hit: number, date: string) {    
   
        return await queryBuilder
        .updateTable('occurrence')
        .set({
            hit,
            date
        })
        .where('id', '=', id)
        .executeTakeFirst()
    }

    export async function createOccurence(occ: Occurrence) {    
    
        return await queryBuilder
        .insertInto('occurrence')
        .values({
            ext: occ.ext,
            wheel: occ.wheel,
            date: occ.date,
            hit: occ.hit
        })
        .executeTakeFirst();
    }

    export async function setOccurence(wheel: string, ext: number, day: string) { 
        const occurrence = await findOccurence(ext, wheel);

        if (!occurrence) {
            return await createOccurence({
                wheel: wheel,
                ext,
                hit: 1,
                date: `["${day}"]`
            });
        } 

        if (occurrence.date.indexOf(day) !== -1) {
            return new Error('Estrazione già presente');
        }

        const addDate = new Set([ ...Array.from(occurrence.date), day]);

        return await updateOccurrence(
            occurrence.id, 
            (occurrence.hit ?? 0) + 1,
            JSON.stringify(Array.from(addDate))
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
            console.log(`${date} > ${city} - ${ext1}, ${ext2}, ${ext3}, ${ext4}, ${ext5}`);
            await setOccurence(city, ext1, date.toString());
            await setOccurence(city, ext2, date.toString());
            await setOccurence(city, ext3, date.toString());
            await setOccurence(city, ext4, date.toString());
            await setOccurence(city, ext5, date.toString());
        }
    }

    // export async function syncOccurenceByLotto5Id(lotto5Id: number) {    
    //     const extraction = await queryBuilder
    //         .selectFrom('lotto5')
    //         .innerJoin('lottodetail', 'parent_id', 'lotto.id')
    //         .select(['lotto.id as id', 'lotto.date as date', 'lotto.code as code', 
    //         'lottodetail.city as city', 'lottodetail.ext1 as ext1', 'lottodetail.ext2 as ext2', 
    //         'lottodetail.ext3 as ext3', 'lottodetail.ext4 as ext4', 'lottodetail.ext5 as ext5'])
    //         .where('lotto.id', '=', lottoId)
    //         .execute();
        
    //     for (let i = 0; i < extraction.length; i++) {
    //         const {city, date, ext1, ext2, ext3, ext4, ext5} = extraction[i];
    //         console.log(`${date} > ${city} - ${ext1}, ${ext2}, ${ext3}, ${ext4}, ${ext5}`);
    //         await setOccurence(city, ext1, date.toString());
    //         await setOccurence(city, ext2, date.toString());
    //         await setOccurence(city, ext3, date.toString());
    //         await setOccurence(city, ext4, date.toString());
    //         await setOccurence(city, ext5, date.toString());
    //     }
    // }