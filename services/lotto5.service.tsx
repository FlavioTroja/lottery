'use server'

import { queryBuilder, Lotto5 } from '../lib/planetscale';
import { setOccurence } from './occurrence.service';

export async function findByCode(code: string) {    
    
    return await queryBuilder
    .selectFrom('lotto5')
    .selectAll('lotto5')
    .where('code', 'like', code)
    .executeTakeFirst();
}

export async function findLast() {    
    
    return await queryBuilder
    .selectFrom('lotto5')
    .selectAll('lotto5')
    .orderBy('date', 'desc')
    .executeTakeFirst();
}

export async function count() {    
    
    return await queryBuilder
    .selectFrom('lotto5')
    .select([e => e.fn.count<number>('id').as('num')])
    .executeTakeFirst();
}

export async function create(lotto5: Lotto5) {    
    
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

export async function syncOccurence5(nums: string, date: Date) {    
        const numbers = Array.from(nums);
        for(let i = 0; i < numbers.length; i++ ) {
            await setOccurence("LOTTO5", Number(numbers[i]), date);
        }
    }
