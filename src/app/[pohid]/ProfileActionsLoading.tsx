export default function ProfileActionsLoading() {
  return (
    <div className="mt-8 w-full animate-pulse border-t px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="bg-grey h-3 w-20 rounded" />
          <div className="bg-grey h-5 w-32 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="bg-grey h-10 w-28 rounded" />
          <div className="bg-grey h-10 w-28 rounded" />
        </div>
      </div>
    </div>
  );
}
