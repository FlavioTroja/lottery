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
  details?: string;
}

// export interface ExtractionDetail {
//   id?: number;
//   code: string;
//   city: string;
//   ext1: string;
//   ext2: string;
//   ext3: string;
//   ext4: string;
//   ext5: string;
// }

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
