export default function Loading() {
  return (
    <div className="content animate-pulse">
      <div className="paper relative mt-24 flex flex-col items-center pt-20">
        <div className="bordered absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full shadow" />
        <div className="flex w-full max-w-xl flex-col items-center px-6">
          <div className="bg-grey h-3 w-16 rounded" />
          <div className="bg-grey mt-4 h-8 w-72 max-w-full rounded" />
          <div className="bg-grey mt-6 h-5 w-40 rounded" />
          <div className="bg-grey mt-3 h-4 w-48 rounded" />
          <div className="bg-grey mt-8 h-64 w-full rounded" />
          <div className="bg-grey mt-6 h-10 w-32 rounded" />
          <div className="mt-8 w-full border-t px-4 py-4">
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
        </div>
      </div>

      <div className="paper mt-8 p-6">
        <div className="bg-grey h-6 w-48 rounded" />
        <div className="bg-grey mt-6 h-20 w-full rounded" />
        <div className="bg-grey mt-4 h-20 w-full rounded" />
        <div className="bg-grey mt-4 h-20 w-full rounded" />
      </div>
    </div>
  );
}
