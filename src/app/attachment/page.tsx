"use client";

import Loading from "app/[pohid]/loading";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import FileViewer from "components/FileViewer";
import Header from "./Header";

const AttachmentDisplay: React.FC = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  return (
    <div className="bg-primaryBackground mx-auto w-[96vw] max-w-[1500px] px-6 py-8 md:w-[80vw]">
      <div className="flex flex-col gap-2">
        <Header />
        {url ? (
          <>
            <a
              href={url as string}
              rel="noreferrer"
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
              <FileViewer url={url as string} />
            </Suspense>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AttachmentDisplay;
