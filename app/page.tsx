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
  const extractions = await queryBuilder
    .selectFrom('extractions')
    .select(['id', 'date', 'code', 'label'])
    .where('code', 'like', `%${search}%`)
    .execute();

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Lotto</Title>
      <Text>
        Estrazione del lotto.
      </Text>
      <Search />
      <Card className="mt-6">
        <ExtractionsTable extractions={extractions} />
      </Card>
    </main>
  );
}
