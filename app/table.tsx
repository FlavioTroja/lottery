import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';

export interface Extraction {
  id?: number;
  date: Date;
  code: string;
  label: string;
}

export interface ExtractionDetail {
  id?: number;
  code: string;
  city: string;
  ext1: number;
  ext2: number;
  ext3: number;
  ext4: number;
  ext5: number;
  extraction_id: number;
}

export default async function ExtractionsTable({ extraction }: { extraction?: Extraction }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{extraction?.label}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
          <TableRow key={extraction?.id}>
            <TableCell>
              <Text>{extraction?.label}</Text>
            </TableCell>
          </TableRow>
      </TableBody>
    </Table>
  );
}
