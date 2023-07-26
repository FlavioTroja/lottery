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

export default async function ExtractionDetailsTable({ details }: { details: ExtractionDetail[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Città</TableHeaderCell>
          <TableHeaderCell>Primo Estratto</TableHeaderCell>
          <TableHeaderCell>Secondo Estratto</TableHeaderCell>
          <TableHeaderCell>Terzo Estratto</TableHeaderCell>
          <TableHeaderCell>Quarto Estratto</TableHeaderCell>
          <TableHeaderCell>Quinto Estratto</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
      {details.map((detail) => (
          <TableRow key={detail.id}>
            <TableCell>{detail.city}</TableCell>
            <TableCell>
              <Text>{detail.ext1}</Text>
            </TableCell>
            <TableCell>
              <Text>{detail.ext2}</Text>
            </TableCell>
            <TableCell>
              <Text>{detail.ext3}</Text>
            </TableCell>
            <TableCell>
              <Text>{detail.ext4}</Text>
            </TableCell>
            <TableCell>
              <Text>{detail.ext5}</Text>
            </TableCell>
         </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
