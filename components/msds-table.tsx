"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MSDSItem } from "@/types/msds"

export interface MsdsTableProps {
  msdsItems: MSDSItem[]
}

export default function MsdsTable({ msdsItems = [] }: MsdsTableProps) {
  return (
    <div className="w-full overflow-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Name</TableHead>
            <TableHead className="min-w-[120px]">CAS No.</TableHead>
            <TableHead className="min-w-[140px]">Usage</TableHead>
            <TableHead className="min-w-[140px]">Hazards</TableHead>
            <TableHead className="min-w-[120px] text-right">PDF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {msdsItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No data&nbsp;found
              </TableCell>
            </TableRow>
          ) : (
            msdsItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.casNo ?? "-"}</TableCell>
                <TableCell>{item.usage}</TableCell>
                <TableCell>
                  {item.warningSymbolsData?.length ? item.warningSymbolsData.map((s) => s.name).join(", ") : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    View
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
