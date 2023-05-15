import { TransactionReceipt } from "ethers";
import { SetStateAction } from "jotai";
import { Dispatch, createContext, useContext } from "react";
import { SubmissionAction, SubmissionInfo, emptySubmission } from "./reducer";

interface FormContextValues {
  state: SubmissionInfo;
  dispatch: Dispatch<SubmissionAction>;
  tookNotice: boolean;
  setTookNotice: Dispatch<SetStateAction<boolean>>;
  receipt?: TransactionReceipt;
  setReceipt: Dispatch<SetStateAction<TransactionReceipt>>;
}

const FormContext = createContext<FormContextValues>({
  state: emptySubmission,
  dispatch: () => {},
  tookNotice: false,
  setTookNotice: () => {},
  setReceipt: () => {},
});

export const useFormContext = () => useContext(FormContext);
export default FormContext;
