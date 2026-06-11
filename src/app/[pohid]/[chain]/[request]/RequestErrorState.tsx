import RetryButton from "app/[pohid]/RetryButton";

const CardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="content mx-auto flex w-[92vw] max-w-[1500px] flex-col justify-center font-semibold sm:w-[84vw] md:w-[76vw]">
    <div className="border-stroke bg-whiteBackground mb-6 flex flex-col items-center rounded border px-6 py-10 text-center shadow sm:px-8">
      {children}
    </div>
  </div>
);

export function ChainDataUnavailableCard({ chainName }: { chainName: string }) {
  return (
    <CardShell>
      <div className="border-orange bg-lightOrange text-orange mx-auto flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold">
        !
      </div>
      <div className="text-primaryText mt-4 text-2xl font-semibold">
        {chainName} data is temporarily unavailable
      </div>
      <div className="text-secondaryText mx-auto mt-3 max-w-xl text-sm font-normal leading-6 sm:text-base">
        We&apos;re having trouble reaching the {chainName} data service, so this
        request can&apos;t be displayed right now. {chainName} data shown
        elsewhere in the app may also be incomplete or out of date. Nothing
        on-chain is affected &mdash; please try again in a few minutes.
      </div>
      <RetryButton className="btn-main mt-6 px-4 py-2 normal-case" />
    </CardShell>
  );
}

export function RequestNotFoundCard({ chainName }: { chainName: string }) {
  return (
    <CardShell>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-lg font-semibold text-red-400">
        !
      </div>
      <div className="text-primaryText mt-4 text-2xl font-semibold">
        Request not found
      </div>
      <div className="text-secondaryText mx-auto mt-3 max-w-xl text-sm font-normal leading-6 sm:text-base">
        We couldn&apos;t find this request on {chainName}. It may have never
        existed, or the link may be pointing to the wrong network.
      </div>
    </CardShell>
  );
}
