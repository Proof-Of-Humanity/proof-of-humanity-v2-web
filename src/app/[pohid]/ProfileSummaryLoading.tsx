export default function ProfileSummaryLoading() {
  return (
    <div className="flex w-full max-w-xl animate-pulse flex-col items-center px-6">
      <div className="bg-grey mb-2 h-5 w-40 rounded" />
      <div className="bg-grey mb-2 h-4 w-48 rounded" />
      <div className="bg-grey mt-4 h-64 w-full rounded" />
      <div className="bg-grey mb-6 mt-6 h-10 w-32 rounded" />
    </div>
  );
}
