import { Card, Title, Text } from '@tremor/react';
import { queryBuilder } from '../lib/postgres';
import Search from './search';
import LottoDetailTable from './table';

export default async function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  const search = searchParams.q ?? '';
  const lotto = await queryBuilder
    .selectFrom('lotto')
    .select(['id', 'date', 'code', 'label'])
    .orderBy('date', 'desc')
    .executeTakeFirstOrThrow();

  const details = await queryBuilder
    .selectFrom('lottodetail')
    .select(['id', 'code', 'city', 'ext1', 'ext2', 'ext3', 'ext4', 'ext5', 'parent_id'])
    .where('parent_id', '=', lotto?.id ?? 0)
    .where('city', 'like', `%${search}%`)
    .execute();

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Lotto</Title>
      <Text>
        {lotto?.label}
      </Text>
      <Search />
      <Card className="mt-6">
        <LottoDetailTable details={details} />
      </Card>
    </main>
  );
}
