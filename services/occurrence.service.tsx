import { Occurrence, queryBuilder } from "../lib/planetscale";

export async function findOccurence(ext: number, wheel: string) {    
   
    return await queryBuilder
    .selectFrom('occurrence')
    .select(['id', 'ext', 'wheel', 'hit'])
    .where('ext', '=', ext)
    .where('wheel', 'like', `${wheel}`)
    .executeTakeFirst();
}

export async function findOccurenceDate(parentId: number, date: Date) {    
   
    return await queryBuilder
    .selectFrom('occurrencedate')
    .select(['id', 'date', 'parent_id'])
    .where('parent_id', '=', parentId)
    .where('date', '=', date)
    .executeTakeFirst();
}

export async function aggregateOccurrence(wheel?: string) {
    if (!!wheel) {
        return await queryBuilder
            .selectFrom('occurrence')
            .select(['ext', 'hit'])
            .where('wheel', 'like', `${wheel}`)
            .orderBy('ext')
            .execute();         
    }

    const occs = await queryBuilder
        .selectFrom('occurrence')
        .select(['ext', 'wheel', 'hit'])
        .orderBy('ext')
        .execute();     
    
    return occs.map(occ => ({
        ext: occ.ext,
        occurrence: occs.filter(({ext}) => ext === occ.ext).reduce((acc, cur) => acc + cur.hit, 0)
    }));
}

export async function updateOccurrence(id: number, hit: number, date: Date) {    
    
    const occurrence = await queryBuilder
    .updateTable('occurrence')
    .set({
        hit
    })
    .where('id', '=', id)
    .executeTakeFirst();

    await queryBuilder
    .insertInto('occurrencedate')
    .values({
        date,
        parent_id: id
    })
    .executeTakeFirst();
    
    return occurrence;
}

export async function createOccurence(occ: {
    wheel: string,
    ext: number,
    hit: number,
    date: Date
}) {    

    const occurrence = await queryBuilder
    .insertInto('occurrence')
    .values({
        ext: occ.ext,
        wheel: occ.wheel,
        hit: occ.hit
    })
    .executeTakeFirst();

    await queryBuilder
    .insertInto('occurrencedate')
    .values({
        date: occ.date,
        parent_id: Number(occurrence.insertId)
    })
    .executeTakeFirst();

    return occurrence;
}

export async function setOccurence(wheel: string, ext: number, date: Date) { 
    const occurrence = await findOccurence(ext, wheel);

    if (!occurrence) {
        return await createOccurence({
            wheel,
            ext,
            hit: 1,
            date
        });
    } 

    if (await findOccurenceDate(Number(occurrence.id), date)) {
        return new Error('Estrazione già presente');
    }

    return await updateOccurrence(
        Number(occurrence.id), 
        (occurrence.hit ?? 0) + 1,
        date
    ); 
}