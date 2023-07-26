'use server'

import { queryBuilder, ExtractionDetail } from '../lib/planetscale';


export async function create(detail: ExtractionDetail) {    
    
    const result = await queryBuilder
    .insertInto('extractionDetails')
    .values({
        code: detail.code,
        city: detail.city,
        ext1: detail.ext1,
        ext2: detail.ext2,
        ext3: detail.ext3,
        ext4: detail.ext4,
        ext5: detail.ext5,
        extraction_id: detail.extraction_id
      })
      .executeTakeFirst();

      return result;
}
