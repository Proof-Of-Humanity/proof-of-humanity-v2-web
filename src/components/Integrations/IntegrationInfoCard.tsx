import { ConnectionStep } from "types/integrations";
import Image from "next/image";
import RightArrowIcon from "icons/ArrowCircleRight.svg"
import LeftArrowIcon from "icons/ArrowCircleLeft.svg"
import { addLinkToText } from "components/addLinkToText";
function IntegrationInfoCard({ step, onPrevious, onNext , previousStep, nextStep}: { step: ConnectionStep, onPrevious: () => void, onNext: () => void, previousStep: boolean, nextStep: boolean }) {
    return (
        <div className="flex flex-row border rounded-[30px]">
            <div className="flex flex-col rounded-[30px] bg-primaryBackground w-1/2">
             <div className="flex flex-col mt-20 px-8 h-80">
                <p className="text-primaryText text-2xl font-semibold">{step.title}</p>
                <p className="text-primaryText mt-6">{addLinkToText(step.description)}</p>
            </div> 
            <div className="flex flex-row justify-end mr-8">
               <LeftArrowIcon width={32} height={32} style= {{
                opacity : previousStep ? "100%" : "50%",
                cursor : previousStep ? "pointer" : "not-allowed",
                pointerEvents : previousStep ? "auto" : "none"
               }}  onClick={onPrevious}/>
               <RightArrowIcon width={32} height={32} className="ml-2" style= {{
                opacity : nextStep ? "100%" : "50%",
                cursor : nextStep ? "pointer" : "not-allowed",
                pointerEvents : nextStep ? "auto" : "none"
               }} onClick={onNext}/>
            </div>
            </div>
            <div className="flex justify-center items-center w-1/2">
                <Image src={step.image || ''} alt={step.title} width={300} height={541} className="my-4"/>
            </div>
        </div>
    )
}

export default IntegrationInfoCard;