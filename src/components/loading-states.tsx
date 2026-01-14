import { Skeleton } from "@/components/ui/skeleton"

export function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-[400px]" />
        <Skeleton className="lg:col-span-3 h-[400px]" />
      </div>
    </div>
  )
}

export function CoursesLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="h-16 w-full border rounded-lg bg-card/50 flex items-center px-4 gap-4">
        <Skeleton className="h-8 w-[300px]" />
        <div className="flex-1" />
        <Skeleton className="h-10 w-[200px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-lg border overflow-hidden space-y-3">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

