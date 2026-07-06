import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <SkeletonCard lines={1} />
      <SkeletonCard lines={3} />
      <SkeletonCard lines={3} />
      <SkeletonCard lines={2} />
      <SkeletonCard lines={1} />
      <SkeletonCard lines={2} />
      <SkeletonCard lines={1} />
      <SkeletonCard lines={2} />
      <SkeletonCard lines={1} />

      <Skeleton className="h-9 w-full" />
    </main>
  );
}
