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

export default async function ExtractionDetailsTable({ extractionDetail }: { extractionDetail?: ExtractionDetail }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{extractionDetail?.city}</TableHeaderCell>
          <TableHeaderCell>{extractionDetail?.ext1}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
          <TableRow key={extractionDetail?.id}>
            <TableCell>
              <Text>{extractionDetail?.city}</Text>
            </TableCell>
          </TableRow>
          <TableRow key={extractionDetail?.id}>
            <TableCell>
              <Text>{extractionDetail?.ext1}</Text>
            </TableCell>
          </TableRow>
      </TableBody>
    </Table>
  );
}
