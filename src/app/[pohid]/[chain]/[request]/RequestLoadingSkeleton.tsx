export default function RequestLoadingSkeleton() {
  return (
    <>
      <div className="content mx-auto !mb-4 flex max-w-[1156px] flex-col justify-center gap-4 font-semibold">
        {/* Action bar */}
        <div className="border-stroke bg-whiteBackground flex min-h-20 animate-pulse flex-col items-center justify-between gap-4 rounded-card border p-4 shadow-soft-inset md:flex-row md:px-6">
          <div className="flex shrink-0 items-center gap-4">
            <div className="bg-grey h-4 w-12 rounded" />
            <div className="bg-grey h-9 w-32 rounded-full" />
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-4 md:w-auto md:justify-end">
            <div className="bg-grey h-5 w-48 max-w-full rounded" />
            <div className="bg-grey h-12 w-40 rounded-btn" />
          </div>
        </div>

        {/* Identity card */}
        <div className="border-stroke bg-whiteBackground mb-1 overflow-hidden rounded-card border shadow-soft-inset">
          <div className="flex flex-col md:flex-row">
            {/* Profile aside */}
            <div className="border-stroke flex animate-pulse flex-col items-center gap-4 border-b px-6 py-6 md:w-[26%] md:min-w-[16rem] md:shrink-0 md:border-b-0 md:border-r">
              <div className="bg-grey h-32 w-32 rounded-full" />
              <div className="bg-grey h-7 w-40 rounded" />
              <div className="bg-grey h-4 w-52 max-w-full rounded" />
              <div className="bg-grey h-4 w-44 max-w-full rounded" />
              <div className="border-stroke mt-4 flex w-full flex-col items-center gap-3 border-y py-4">
                <div className="bg-grey h-3 w-20 rounded" />
                <div className="flex gap-2">
                  <div className="bg-grey h-8 w-8 rounded-full" />
                  <div className="bg-grey h-8 w-8 rounded-full" />
                  <div className="bg-grey h-8 w-8 rounded-full" />
                </div>
              </div>
              <div className="bg-grey mt-2 h-3 w-28 rounded" />
            </div>

            {/* Request details */}
            <div className="flex w-full min-w-0 animate-pulse flex-col gap-4 p-6 lg:p-8">
              <div className="bg-grey h-[8.25rem] w-full rounded-input md:h-12" />
              <div className="bg-grey h-12 w-full rounded-input" />
              <div className="flex justify-center">
                <div className="bg-grey h-4 w-32 rounded" />
              </div>
              <div className="bg-grey aspect-[1.8] w-full rounded-2xl" />
              <div className="flex justify-center md:justify-end">
                <div className="bg-grey h-4 w-28 rounded" />
              </div>
              <div className="border-stroke border-t pt-6">
                <div className="bg-grey h-5 w-24 rounded" />
                <div className="mt-6 flex flex-col gap-6">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex w-6 shrink-0 flex-col items-center">
                        <div className="bg-grey h-5 w-5 rounded-full" />
                        {index < 2 && (
                          <div className="bg-grey mt-2 h-10 w-px" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="bg-grey h-4 w-40 max-w-full rounded" />
                        <div className="bg-grey mt-2 h-3 w-24 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence accordion */}
      <div className="content mx-auto !mt-0 flex max-w-[1156px] flex-col justify-center font-semibold">
        <div className="bg-grey h-[62px] w-full animate-pulse rounded-[22px]" />
      </div>
    </>
  );
}
