'use client';
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'


export function TaskCardSkeleton() {
    return (
        <Card className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-9 w-full" />
        </Card>
    )
}