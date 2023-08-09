'use client';

import { Card, AreaChart, Title, Text } from '@tremor/react';

const data = [
  {
    Month: '1',
    Sales: 289,
    Profit: 24
  },
  {
    Month: '2',
    Sales: 189,
    Profit: 13
  },
  {
    Month: '3',
    Sales: 389,
    Profit: 49
  },
  {
    Month: '4',
    Sales: 180,
    Profit: 22
  },
  {
    Month: '5',
    Sales: 30,
    Profit: 2
  },
  {
    Month: '6',
    Sales: 189,
    Profit: 19
  },
  {
    Month: '7',
    Sales: 89,
    Profit: 12
  },
  {
    Month: '8',
    Sales: 109,
    Profit: 20
  },
  {
    Month: '9',
    Sales: 160,
    Profit: 21
  },
  {
    Month: '10',
    Sales: 165,
    Profit: 22
  }  
];

export default function Example() {
  return (
    <Card className="mt-8">
      <Title>Performance</Title>
      <Text>Comparison between Sales and Profit</Text>
      <AreaChart
        className="mt-4 h-80"
        data={data}
        categories={['Sales', 'Profit']}
        index="Month"
        colors={['indigo', 'fuchsia']}
        valueFormatter={(number: number) =>
          `$ ${Intl.NumberFormat('it').format(number).toString()}`
        }
      />
    </Card>
  );
}
