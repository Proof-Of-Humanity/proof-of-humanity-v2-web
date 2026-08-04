import React from "react";
import Image from "next/image";
import Accordion from "components/Accordion";
import { addLinkToText } from "components/addLinkToText";
import { InfoSlide } from "types/integrations";

interface CirclesMintTokensStepProps {
  steps: InfoSlide[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function CirclesMintTokensStep({
  steps,
  isOpen,
  onToggle,
}: CirclesMintTokensStepProps) {
  const slide = steps[0];
  if (!slide) return null;

  return (
    <Accordion
      title="Step 3 - Join Our Group On the Gnosis App And Earn $CRC"
      className="w-full [&>button:focus-visible]:!shadow-[0_0_0_1px_#3A3E48] [&>button:focus-visible]:!ring-0 [&>button:focus]:!outline-none [&>button]:min-h-20 [&>button]:rounded-[28px] [&>button]:px-8 [&>button]:hover:!border-[#3A3E48]"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="mx-auto flex w-[calc(100%-60px)] max-w-[1095px] flex-col pt-3 md:pt-4">
        <div className="border-stroke bg-whiteBackground flex flex-col rounded-[16px] border p-6 md:min-h-[816px] md:pb-12">
          <div className="flex w-full flex-col items-center justify-center overflow-hidden rounded-t-[30px]">
            <Image
              src={slide.image || ""}
              alt={slide.title}
              width={900}
              height={521}
              className="border-stroke h-auto max-h-[200px] rounded-[12px] border object-contain shadow sm:max-h-[300px] md:h-[521px] md:max-h-[521px] md:w-[900px]"
            />
            <p className="text-secondaryText mb-4 px-4 text-sm md:px-6">
              If you&apos;re on desktop,
              <a
                href="https://app.gnosis.io/transfer/0x9a450CF5AAFa348A3d4857CbDD49e23819F08A0e/crc?data=0xf3f5858942140fd2894eeb8b74cd0ed72d24fc6675d352a2884b1be2f32256fe"
                className="text-orange hover:text-orange/80 font-medium hover:cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                click here{" "}
              </a>
              to mint our group $CRC
            </p>
          </div>
          <div className="border-stroke flex flex-1 flex-col border-t pt-6">
            <p className="text-primaryText text-xl font-semibold md:text-2xl">
              {slide.title}
            </p>
            <p className="text-secondaryText mt-4 flex-1 text-sm leading-relaxed">
              {addLinkToText(slide.description)}
            </p>
            <br />
            <p className="text-orange mb-4 text-sm">
              We have benefits incoming for the largest holders of our group
              $CRC, soon!
            </p>
          </div>
        </div>
      </div>
    </Accordion>
  );
}
