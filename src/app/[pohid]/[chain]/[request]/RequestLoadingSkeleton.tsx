export default function RequestLoadingSkeleton() {
  return (
    <div className="content flex flex-col justify-center font-semibold">
      <div className="mb-4 flex animate-pulse flex-wrap items-center justify-center gap-3 md:justify-end">
        <div className="bg-grey h-10 w-28 rounded" />
        <div className="bg-grey h-10 w-32 rounded" />
      </div>

      <div className="border-stroke bg-whiteBackground mb-6 overflow-hidden rounded-card border shadow-soft-inset">
        <div className="flex animate-pulse flex-col md:flex-row">
          <div className="background border-stroke hidden w-2/5 flex-col items-center border-r px-8 pt-8 md:flex">
            <div className="bg-grey h-32 w-32 rounded-full" />
            <div className="bg-grey mb-12 mt-4 h-7 w-40 rounded" />
            <div className="bg-grey h-4 w-full rounded" />
            <div className="bg-grey mt-3 h-4 w-5/6 rounded" />
            <div className="bg-grey mb-8 mt-auto h-5 w-32 rounded" />
          </div>

          <div className="flex w-full flex-col p-6 lg:p-8">
            <div className="mb-8 flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
              <div className="flex w-full items-center justify-center gap-2 md:justify-start">
                <div className="bg-grey h-6 w-6 rounded-full" />
                <div className="bg-grey h-5 w-56 max-w-full rounded" />
              </div>
              <div className="bg-grey h-5 w-24 rounded" />
            </div>

            <div className="mb-4 h-1 w-full border-b" />

            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="bg-grey h-16 rounded" />
              <div className="bg-grey h-16 rounded" />
              <div className="bg-grey h-16 rounded" />
            </div>

            <div className="mb-8 flex justify-center md:hidden">
              <div className="bg-grey h-32 w-32 rounded-full" />
            </div>

            <div className="bg-grey aspect-video w-full rounded" />
            <div className="bg-grey mt-3 h-4 w-52 rounded" />

            <div className="mt-8 flex flex-wrap gap-2">
              <div className="bg-grey h-9 w-28 rounded" />
              <div className="bg-grey h-9 w-28 rounded" />
              <div className="bg-grey h-9 w-28 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-stroke bg-whiteBackground animate-pulse rounded-card border p-6 shadow-soft-inset">
        <div className="bg-grey h-6 w-32 rounded" />
        <div className="bg-grey mt-4 h-20 w-full rounded" />
      </div>
    </div>
  );
}
