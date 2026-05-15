import { Fragment } from "react";

const bone = "bg-grey";

const steps = 4;

export default function FormSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading registration form"
      className="pointer-events-none flex animate-pulse flex-col gap-6"
    >
      <div aria-hidden className="flex w-full items-center gap-1">
        <div className={`${bone} h-6 w-20 shrink-0 rounded-full`} />
        {Array.from({ length: steps - 1 }, (_, i) => (
          <Fragment key={i}>
            <div className={`${bone} h-px min-w-4 flex-1 rounded-full`} />
            <div className={`${bone} h-6 w-6 shrink-0 rounded-full`} />
          </Fragment>
        ))}
      </div>

      <div aria-hidden className="flex flex-col gap-2">
        <div className={`${bone} h-7 w-40 rounded-md`} />
        <div className={`${bone} h-7 w-64 rounded-md`} />
        <div className={`${bone} mt-2 h-px w-2/3 rounded-full`} />
      </div>

      <div aria-hidden className="flex flex-col gap-2">
        <div className={`${bone} h-4 w-full max-w-lg rounded-md`} />
        <div className={`${bone} h-4 w-5/6 max-w-md rounded-md`} />
      </div>

      <div aria-hidden className="flex flex-col gap-2">
        <div className={`${bone} h-4 w-32 rounded-md`} />
        <div className={`${bone} h-10 w-full rounded-sm`} />
      </div>

      <div aria-hidden className="flex flex-col gap-2">
        <div className={`${bone} h-4 w-36 rounded-md`} />
        <div className={`${bone} h-10 w-full rounded-sm`} />
      </div>

      <div aria-hidden className="flex items-start gap-3">
        <div className={`${bone} mt-0.5 h-4 w-4 shrink-0 rounded`} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className={`${bone} h-3.5 w-full rounded-md`} />
          <div className={`${bone} h-3.5 w-11/12 rounded-md`} />
          <div className={`${bone} h-3.5 w-4/5 rounded-md`} />
        </div>
      </div>

      <div aria-hidden className="flex items-start gap-3">
        <div className={`${bone} mt-0.5 h-4 w-4 shrink-0 rounded`} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className={`${bone} h-3.5 w-full rounded-md`} />
          <div className={`${bone} h-3.5 w-10/12 rounded-md`} />
        </div>
      </div>

      <div aria-hidden className={`${bone} h-11 w-full rounded-sm`} />
    </div>
  );
}
