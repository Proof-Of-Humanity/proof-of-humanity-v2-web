import { ConnectionStep } from "types/integrations";
import Image from "next/image";
import RightArrowIcon from "icons/ArrowCircleRight.svg"
import LeftArrowIcon from "icons/ArrowCircleLeft.svg"
import { addLinkToText } from "components/addLinkToText";
function IntegrationInfoCard({ step, onPrevious, onNext , previousStep, nextStep}: { step: ConnectionStep, onPrevious: () => void, onNext: () => void, previousStep: boolean, nextStep: boolean }) {
    return (
        <div className="flex flex-col md:flex-row border rounded-[30px] overflow-hidden">
            {/* Left Column: Text content and navigation */}
            <div className="flex flex-col rounded-[30px] bg-primaryBackground w-full md:w-1/2 p-4 md:p-6 order-2 md:order-1">
             <div className="flex flex-col mt-4 md:mt-8 lg:mt-20 min-h-[150px] md:px-8 md:h-80">
                <p className="text-primaryText text-xl md:text-2xl font-semibold">{step.title}</p>
                <p className="text-primaryText mt-4 md:mt-6 text-sm md:text-base">{addLinkToText(step.description)}</p>
                {step.disclaimer && (
                    <div className="text-orange-400 text-sm md:text-base mt-4">{step.disclaimer}</div>
                )}
            </div> 
            <div className="flex flex-row justify-center md:justify-end mt-4 md:mr-8">
            <LeftArrowIcon 
                 width={32} 
                 height={32} 
                 className={`${previousStep ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed pointer-events-none'} mr-2 md:mr-0`}
                 onClick={onPrevious}
                 onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => previousStep && e.key === 'Enter' && onPrevious()}
                 aria-label="Previous step"
                 role="button"
                tabIndex={previousStep ? 0 : -1}
              />
              <RightArrowIcon 
                 width={32} 
                height={32} 
                className={`ml-2 ${nextStep ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
                onClick={onNext}
                onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => nextStep && e.key === 'Enter' && onNext()}
                 aria-label="Next step"
                 role="button"
                tabIndex={nextStep ? 0 : -1}
               />
            </div>
            </div>
            {/* Right Column: Image */}
            <div className="flex justify-center items-center w-full md:w-1/2 order-1 md:order-2">
                <Image src={step.image || ''} alt={step.title} width={300} height={541} className="my-4 w-full h-auto object-contain max-h-[250px] sm:max-h-[350px] md:max-h-[541px]"/>
            </div>
        </div>
    )
}

export default IntegrationInfoCard;