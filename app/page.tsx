import { Card, Title, Text } from '@tremor/react';
import { queryBuilder } from '../lib/planetscale';
import Search from './search';
import ExtractionDetailsTable from './table';

export const dynamic = 'force-dynamic';

export default async function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  const search = searchParams.q ?? '';
  const extraction = await queryBuilder
    .selectFrom('extractions')
    .select(['id', 'date', 'code', 'label'])
    .orderBy('date', 'desc')
    .executeTakeFirstOrThrow();

  const extractionDetail = await queryBuilder
    .selectFrom('extractionDetails')
    .select(['id', 'city', 'ext1', 'ext2', 'ext3', 'ext4', 'ext5', 'extraction_id'])
    .where('extraction_id', '=', extraction.id)
    .where('city', 'like', `%${search}%`)
    .execute();

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Lotto</Title>
      <Text>
        {extraction?.label}
      </Text>
      <Search />
      <Card className="mt-6">
        <ExtractionDetailsTable extractionDetail={extractionDetail} />
      </Card>
    </main>
  );
}
