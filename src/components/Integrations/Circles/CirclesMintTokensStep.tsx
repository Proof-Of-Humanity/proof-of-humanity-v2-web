import React from "react";
import Image from "next/image";
import Accordion from "components/Accordion";
import StepCarousel from "components/Integrations/StepCarousel";
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
  return (
    <Accordion
      title="Step 3 - Join Our Group On the Gnosis App And Earn $CRC"
      className="w-full"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="flex w-full flex-col p-4 md:p-6">
        <StepCarousel slides={steps}>
          {({ slide, arrows }) => (
            <div className="flex flex-col rounded-[30px] border shadow">
              <div className="flex w-full flex-col items-center justify-center overflow-hidden rounded-t-[30px]">
                <Image
                  src={slide.image || ""}
                  alt={slide.title}
                  width={900}
                  height={521}
                  className="border-stroke mx-4 my-4 h-auto max-h-[200px] rounded-md border object-contain shadow sm:mx-0 sm:my-6 sm:max-h-[300px] md:mb-2 md:mt-8 md:h-auto md:max-h-[521px]"
                />
                <p className="text-secondaryText mb-4 px-4 text-sm sm:text-base md:px-6">
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
              <div className="bg-primaryBackground flex flex-1 flex-col rounded-[30px] p-4 md:p-6">
                <p className="text-primaryText text-xl font-semibold md:text-2xl">
                  {slide.title}
                </p>
                <p className="text-primaryText mt-4 flex-1 text-sm leading-relaxed md:text-base">
                  {addLinkToText(slide.description)}
                </p>
                <br />
                <p className="text-orange mb-4 text-base">
                  We have benefits incoming for the largest holders of our group
                  $CRC, soon!
                </p>
                {arrows}
              </div>
            </div>
          )}
        </StepCarousel>
      </div>
    </Accordion>
  );
}
