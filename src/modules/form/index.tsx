import { BigNumber } from "@ethersproject/bignumber/lib/bignumber";
import { TransactionReceipt, isBytesLike } from "ethers";
import React, { useEffect, useReducer, useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Steps from "components/Steps";
import useWeb3 from "hooks/useWeb3";
import { machinifyId, prettifyId } from "utils/identifier";
import Finalized from "./Finalized";
import InfoStep from "./Info";
import PhotoStep from "./Photo";
import ReviewStep from "./Review";
import VideoStep from "./Video";
import FormContext from "./context";
import { emptySubmission, submissionReducer } from "./reducer";

const STEPS_LIST = ["Info", "Photo", "Video", "Review"];

const StepToIndex = {
  info: 0,
  photo: 1,
  video: 2,
  review: 3,
  finalized: 4,
} as const;

const Form: React.FC = () => {
  const { humanity } = useParams();
  const { account } = useWeb3();
  const navigate = useNavigate();

  const [tookNotice, setTookNotice] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [state, dispatch] = useReducer(submissionReducer, emptySubmission);

  const [params] = useSearchParams();
  const step = params.get("step")?.toLowerCase();

  useEffect(() => {
    if (humanity && BigNumber.from(machinifyId(humanity)).isZero())
      navigate("/claim?step=info");
  }, []);

  if (humanity && !isBytesLike(machinifyId(humanity)))
    return (
      <div className="m-auto flex flex-col text-center">
        <span className="font-semibold">Invalid humanity ID:</span>
        <span className="text-6xl font-light text-theme">{humanity}</span>
      </div>
    );

  if (!account || !step || typeof StepToIndex[step] === "undefined")
    return <Navigate to="?step=info" replace={true} />;

  return (
    <>
      {step !== "finalized" && (
        <Steps
          list={STEPS_LIST}
          current={StepToIndex[step]}
          setCurrent={(i: number) => navigate(`?step=${STEPS_LIST[i]}`)}
        />
      )}

      <FormContext.Provider
        value={{
          dispatch,
          tookNotice,
          setTookNotice,
          receipt,
          setReceipt,
          state: {
            ...state,
            humanityId: humanity ?? prettifyId(account!),
          },
        }}
      >
        {step === "info" && <InfoStep />}
        {step === "photo" && <PhotoStep />}
        {step === "video" && <VideoStep />}
        {step === "review" && <ReviewStep />}
        {step === "finalized" && <Finalized />}
      </FormContext.Provider>
    </>
  );
};

export default Form;
