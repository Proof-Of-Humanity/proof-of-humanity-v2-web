"use client";

import ReferredUserRow from "./ReferredUserRow";
import { REFERRAL_REWARD_PNK } from "data/referralPresentation";
import { ReferredUser } from "types/referral";

interface ReferredListProps {
  users: ReferredUser[];
}

// "Your Referrals" section. The whole section (heading, subtitle,
// rows) is omitted while the user hasn't referred anyone yet.
const ReferredList: React.FC<ReferredListProps> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col">
      <h3 className="text-primaryText font-semibold">Your Invitees</h3>
      <p className="text-secondaryText mt-1 text-sm">
        Earn {REFERRAL_REWARD_PNK} PNK when someone you invite becomes verified
        on PoH.
      </p>
      <div className="mt-2 flex flex-col">
        {users.map((user) => (
          <ReferredUserRow key={user.refereeHumanityId} user={user} />
        ))}
      </div>
    </div>
  );
};

export default ReferredList;
