'use server'

import { queryBuilder, MillionDayDetail } from '../lib/planetscale';

export async function findOccurenceByExt(ext: string, type?: string) {    
  const { ref } = queryBuilder.dynamic;

  type ExtPossibleColumns = 'ext1' | 'ext2' | 'ext3' | 'ext4' | 'ext5';

  const ext1 = await queryBuilder
  .selectFrom('milliondaydetail')
  .select([
      ref<ExtPossibleColumns>(ext), 
      ed => ed.fn.count(ref<ExtPossibleColumns>(ext)).as('occ')])
  .where('type', 'like', `${type}`)
  .execute();
}

export async function create(detail: MillionDayDetail) {    
    
    return await queryBuilder
    .insertInto('milliondaydetail')
    .values({
        type: detail.type,
        ext1: detail.ext1,
        ext2: detail.ext2,
        ext3: detail.ext3,
        ext4: detail.ext4,
        ext5: detail.ext5,
        parent_id: detail.parent_id
      })
      .executeTakeFirst();
}
