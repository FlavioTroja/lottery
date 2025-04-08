'use server'

import { Lotto10, Lotto10Detail, Lotto10Occurrence, queryBuilder } from '../lib/postgres';
import { formattedDate } from './utils.service';

export async function findByCode(code: string, type: 'LOTTO10' | 'LOTTO5') {    
    
    return await queryBuilder
    .selectFrom('lotto10')
    .select(['id', 'date', 'code', 'label'])
    .where('code', 'like', code)
    .where('type', 'like', type)
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
        type: lotto.type,
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

// OCCURRENCE

export async function findOccurrence10(ext: number, type: 'PRIMARY' | 'NUMERO ORO' | 'DOPPIO ORO' | 'EXTRA') {    
  return await queryBuilder
    .selectFrom('lotto10occurrence')
    .select(['id', 'date', 'ext', 'type', 'occurrence'])
    .where('ext', '=', ext)
    .where('type', '=', type)
    .executeTakeFirst();
}

export async function updateOccurrence10(
  id: number | undefined, 
  occurrence: number, 
  date: string[]
) {    
  return await queryBuilder
    .updateTable('lotto10occurrence')
    .set({
      occurrence,
      date
    })
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function createOccurrence10(occ: Lotto10Occurrence) {    
  return await queryBuilder
    .insertInto('lotto10occurrence')
    .values({
      ext: occ.ext,
      type: occ.type,
      date: occ.date,
      occurrence: occ.occurrence
    })
    .executeTakeFirst();
}

export async function setOccurrence10(
  type: 'PRIMARY' | 'NUMERO ORO' | 'DOPPIO ORO' | 'EXTRA', 
  ext: number, 
  day: string
) { 
  const occ10 = await findOccurrence10(ext, type);

  if (!occ10) {
    return await createOccurrence10({
      ext,
      type,
      occurrence: 1,
      date: [day]
    });
  }

  if (occ10.date.includes(day)) {
    return new Error('Estrazione già presente');
  }
  
  const newDates = [...occ10.date, day];

  return await updateOccurrence10(
    occ10.id, 
    (occ10.occurrence ?? 0) + 1,
    newDates
  );
}

export async function syncOccurrence10ByLottoId(lotto10Id: number) {    
  const extraction = await queryBuilder
    .selectFrom('lotto10')
    .innerJoin('lotto10detail', 'lotto10detail.parent_id', 'lotto10.id')
    .select([
      'lotto10.id as id', 
      'lotto10.date as date', 
      'lotto10.code as code', 
      'lotto10detail.type as type', 
      'lotto10detail.numbers as numbers'
    ])
    .where('lotto10.id', '=', lotto10Id)
    .execute();

  for (const record of extraction) {
    const { date, numbers, type } = record;
    // Converte la data nel formato desiderato (ad es. yyyy-MM-dd)
    const dayStr = formattedDate(date);
    // Per ogni numero in questo blocco, aggiorna l'occorrenza per quel tipo
    for (let j = 0; j < numbers.length; j++) {
      await setOccurrence10(type, numbers[j], dayStr);
    }
  }
}
