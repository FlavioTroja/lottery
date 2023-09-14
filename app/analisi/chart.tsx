'use client';

import { Card, AreaChart, Title, Text } from '@tremor/react';
import * as occurrence from '../../services/occurrence.service';

export default async function Example() {
    const data = await occurrence.aggregateOccurrence("NAZIONALE");       
     console.log("Data:", data);
  return (
    <Card className="mt-8">
      <Title>Frequenza</Title>
      <Text>Distribuzione estrazioni del lotto</Text>
      <AreaChart
        className="mt-4 h-80"
        data={data}
        categories={['occurrence']}
        index="ext"
        colors={['indigo', 'fuchsia']}
        valueFormatter={(number: number) =>
          `$ ${Intl.NumberFormat('it').format(number).toString()}`
        }
      />
    </Card>
  );
}
