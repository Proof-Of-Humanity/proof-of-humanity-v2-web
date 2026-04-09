import RetryButton from "./RetryButton";

type ProfileSectionErrorCardProps = {
  section: string;
  title: string;
  description: string;
  retryLabel?: string;
};

export default function ProfileSectionErrorCard({
  section,
  title,
  description,
  retryLabel = "Try again",
}: ProfileSectionErrorCardProps) {
  return (
    <div className="mb-5 w-full">
      <div className="text-secondaryText text-xs font-semibold uppercase tracking-[0.08em]">
        {section}
      </div>
      <div className="border-stroke bg-whiteBackground mt-3 w-full rounded-lg border px-5 py-6 text-center sm:px-6">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-base font-semibold text-red-400">
          !
        </div>
        <div className="text-primaryText mt-3 text-lg font-semibold">
          {title}
        </div>
        <div className="text-secondaryText mt-2 text-sm leading-6">
          {description}
        </div>
        <RetryButton
          label={retryLabel}
          className="border-stroke bg-whiteBackground text-primaryText mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold"
        />
      </div>
    </div>
  );
}
