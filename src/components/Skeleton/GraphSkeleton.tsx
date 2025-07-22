import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
}

const GraphChunkSkeleton = ({ rows = 4, columns = 3, showHeader = true }: TableSkeletonProps) => (
  <div className="w-full max-w-[1200px] mx-auto mt-1 flex flex-col gap-2 items-center">
    <div className="mb-1 mr-1 self-end">
    <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#004CE6] border-t-transparent"/>
    </div>  
    <Table className="w-full bg-white rounded border-1 border-[#eaf0f6]">
      <TableHeader className="bg-gray-50">
        <TableRow className="border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={`header-${i}`} className="border-r last:border-r-0 p-2">
              <div className="h-4 w-full max-w-[120px] rounded-[2px] bg-gray-200 animate-pulse" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`} className="border-b last:border-b-0 hover:bg-[#f7f9fe]">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={`cell-${rowIndex}-${colIndex}`} className="border-r last:border-r-0">
                <div
                  className="h-4 w-full rounded-[2px] bg-gray-200 animate-pulse"
                  style={{
                    animationDelay: `${rowIndex * 0.1 + colIndex * 0.05}s`,
                    maxWidth: colIndex === 0 ? "80px" : "80px",
                  }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default GraphChunkSkeleton;
