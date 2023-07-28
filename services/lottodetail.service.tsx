'use server'

import { queryBuilder, LottoDetail } from '../lib/planetscale';

export async function findOccurenceByExt(ext: string, city?: string) {    
  const { ref } = queryBuilder.dynamic;

  type ExtPossibleColumns = 'ext1' | 'ext2' | 'ext3' | 'ext4' | 'ext5';

  const ext1 = await queryBuilder
  .selectFrom('lottodetail')
  .select([
      ref<ExtPossibleColumns>(ext), 
      ed => ed.fn.count(ref<ExtPossibleColumns>(ext)).as('occ')])
  .where('city', 'like', `${city}`)
  .execute();
}

export async function create(detail: LottoDetail) {    
    
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
