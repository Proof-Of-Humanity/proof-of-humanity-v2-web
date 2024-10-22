import Field from "components/Field";
import { useState } from "react";
import { useAccount } from "wagmi";
import { SubmissionState } from "./Form";
import { ObservableObject } from "@legendapp/state";

interface InfoProps {
  advance: () => void;
  state$: ObservableObject<SubmissionState>;
}

function Info({ advance, state$ }: InfoProps) {
  const { address } = useAccount();
  const [tookNotice, setTookNotice] = useState(false);
  const name = state$.name.use();

  return (
    <>
      <div className="my-4 flex w-full flex-col text-2xl font-extralight">
        <span>Create your</span>
        <span>
          <strong className="font-semibold uppercase">Proof of Humanity</strong>{" "}
          Profile
        </span>
        <div className="divider mt-4 w-2/3" />
      </div>

      <span className="mb-6">
        Submitting your profile to Proof of Humanity takes 5-10 and requires an
        Ethereum wallet and a short video.
      </span>

      <Field label="Connected wallet" value={address} disabled />
      <Field
        label="Display Name"
        placeholder="name by which you are known"
        value={name}
        onChange={(e) => state$.name.set(e.target.value)}
      />

      <div className="mb-16 mt-8 flex cursor-pointer items-center">
        <input
          id="notice"
          type="checkbox"
          className="checkbox mx-2 cursor-pointer"
          checked={tookNotice}
          onChange={() => setTookNotice((c) => !c)}
        />
        <label className="cursor-pointer" htmlFor="notice">
          I understand this wallet will be irreversebly linked to my real world
          person and I will not use that wallet for any private or sensitive
          information.
        </label>
      </div>

      <button
        className="btn-main"
        disabled={!name || !tookNotice}
        onClick={advance}
      >
        NEXT
      </button>
    </>
  );
}

export default Info;
