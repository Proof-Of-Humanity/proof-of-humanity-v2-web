const SKELETON_CARDS = 12;

function CardSkeleton() {
  return (
    <div className="border-stroke bg-whiteBackground relative aspect-[5/4] w-full animate-pulse overflow-hidden rounded-card border shadow-soft-inset">
      <div className="bg-grey absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="bg-grey h-8 w-32 rounded-full" />
        <div className="bg-grey h-8 w-8 rounded-full" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="bg-grey h-5 w-2/3 rounded" />
        <div className="bg-grey mt-2 h-4 w-28 rounded" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div aria-label="Loading profiles" className="animate-pulse">
      <div className="my-4 flex flex-col gap-2 py-2 sm:flex-row sm:gap-1 md:gap-2">
        <div className="border-stroke bg-whiteBackground h-12 w-full rounded-input border shadow-inset" />
        <div className="border-stroke bg-whiteBackground h-12 w-full rounded-input border shadow-inset sm:w-36" />
        <div className="border-stroke bg-whiteBackground h-12 w-full rounded-input border shadow-inset sm:w-32" />
      </div>

      <div className="request-grid">
        {Array.from({ length: SKELETON_CARDS }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
