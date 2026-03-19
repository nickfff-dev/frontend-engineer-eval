import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"



export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function RowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  )
}
