import { Card, Title, Text } from '@tremor/react';
import { queryBuilder } from '../lib/planetscale';
import Search from './search';
import ExtractionsTable from './table';

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
    .where('code', 'like', `%${search}%`)
    .orderBy('date', 'desc')
    .executeTakeFirst();

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Lotto</Title>
      <Text>
        {extraction?.label}
      </Text>
      <Search />
      <Card className="mt-6">
        <ExtractionsTable extraction={extraction} />
      </Card>
    </main>
  );
}
