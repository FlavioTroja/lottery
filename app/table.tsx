import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';

export interface Lotto {
  id?: number;
  date: Date;
  code: string;
  label: string;
}

export interface LottoDetail {
  id?: number;
  code: string;
  city: string;
  ext1: number;
  ext2: number;
  ext3: number;
  ext4: number;
  ext5: number;
  parent_id: number;
}

export default async function LottoDetailTable({ details }: { details: LottoDetail[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Ruota</TableHeaderCell>
          <TableHeaderCell>1° Estratto</TableHeaderCell>
          <TableHeaderCell>2° Estratto</TableHeaderCell>
          <TableHeaderCell>3° Estratto</TableHeaderCell>
          <TableHeaderCell>4° Estratto</TableHeaderCell>
          <TableHeaderCell>5° Estratto</TableHeaderCell>
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
