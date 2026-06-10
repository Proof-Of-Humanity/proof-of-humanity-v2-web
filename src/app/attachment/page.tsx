"use client";

import Loading from "components/Loading";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import FileViewer from "components/FileViewer";
import { isAllowedIpfsGatewayUrl } from "utils/ipfs";
import Header from "./Header";

const AttachmentDisplay: React.FC = () => {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url");
  const url = rawUrl && isAllowedIpfsGatewayUrl(rawUrl) ? rawUrl : null;

  return (
    <div className="bg-primaryBackground mx-auto w-[96vw] max-w-[1500px] px-6 py-8 md:w-[80vw]">
      <div className="flex flex-col gap-2">
        <Header />
        {rawUrl && !url ? (
          <p className="text-primaryText text-center">
            This attachment URL is not supported.
          </p>
        ) : url ? (
          <>
            <a
              href={url}
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-2 self-end text-blue-500"
            >
              Open in new tab
              <Image
                alt="Open in new tab"
                className="fill-primaryText"
                src="/logo/new-tab.svg"
                width={16}
                height={16}
              />
            </a>
            <Suspense
              fallback={
                <div className="flex w-full justify-center">
                  <Loading />
                </div>
              }
            >
              <FileViewer url={url} />
            </Suspense>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AttachmentDisplay;
