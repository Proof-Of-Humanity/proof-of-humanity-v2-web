import Field from "components/Field";
import useWeb3 from "hooks/useWeb3";
import { useFormContext } from "./context";

const Info: React.FC = () => {
  const { account } = useWeb3(false);
  const {
    advance,
    tookNotice,
    setTookNotice,
    state: { humanityId, name, bio },
    dispatch,
  } = useFormContext();

  if (!account) return null;

  return (
    <>
      <div className="w-full my-4 flex flex-col text-2xl font-extralight">
        <span>Create your</span>
        <span>
          <strong className="font-semibold uppercase">Proof of Humanity</strong>{" "}
          Profile
        </span>
        <div className="divider mt-4 w-2/3" />
      </div>

      <span className="mb-6 txt">
        Submitting your profile to Proof of Humanity takes an average of 5-10
        minutes, an existing Ethereum account and requires you to record a video
        of yourself talking.
      </span>

      <Field label="Connected wallet" value={account} disabled />
      <Field
        disabled
        label="Humanity you claim"
        placeholder="ID of the humanity you want to claim"
        value={humanityId}
        onChange={(e) => dispatch({ type: "SOUL_ID", payload: e.target.value })}
      />
      <Field
        label="Display Name"
        placeholder="name by which you are known"
        value={name}
        onChange={(e) => dispatch({ type: "NAME", payload: e.target.value })}
      />
      <Field
        label="Short bio"
        placeholder="short bio (ex: cypherpunk, smart contract developer)"
        value={bio}
        onChange={(e) => dispatch({ type: "BIO", payload: e.target.value })}
      />

      <div className="mt-8 mb-16 flex items-center cursor-pointer">
        <input
          id="notice"
          type="checkbox"
          className="checkbox mx-2 cursor-pointer"
          checked={tookNotice}
          onChange={() => setTookNotice((c) => !c)}
        />
        <label className="txt cursor-pointer" htmlFor="notice">
          I understand this wallet will be irreversebly linked to my real world
          person and I will not use that wallet for any private or sensitive
          information.
        </label>
      </div>

      <button
        className="btn-main"
        disabled={!humanityId || !name || !tookNotice}
        onClick={advance}
      >
        NEXT
      </button>
    </>
  );
};

export default Info;
