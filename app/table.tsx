import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';

interface Extraction {
  id: number;
  date: string;
  code: string;
  //details: ExtractionDetail[];
}

interface ExtractionDetail {
  id: number;
  city: string;
  ext1: string;
  ext2: string;
  ext3: string;
  ext4: string;
  ext5: string;
}

export default async function ExtractionsTable({ extractions }: { extractions: Extraction[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Data</TableHeaderCell>
          <TableHeaderCell>Concorso</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {extractions.map((extraction) => (
          <TableRow key={extraction.id}>
            <TableCell>
              <Text>{extraction.date}</Text>
            </TableCell>
            <TableCell>
              <Text>{extraction.code}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
