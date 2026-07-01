"use client";

import ReferredUserRow from "./ReferredUserRow";
import { ReferredUser } from "types/referral";

interface ReferredListProps {
  users: ReferredUser[];
}

const ReferredList: React.FC<ReferredListProps> = ({ users }) => {
  if (users.length === 0) {
    return (
      <div className="border-stroke text-secondaryText mt-2 rounded-input border border-dashed px-4 py-8 text-center text-sm">
        You haven&apos;t referred anyone yet. Share your referral link to start
        inviting humans and earning rewards.
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col">
      <h3 className="text-primaryText mb-1 font-semibold">Referred to</h3>
      {users.map((user) => (
        <ReferredUserRow key={user.refereeHumanityId} user={user} />
      ))}
    </div>
  );
};

export default ReferredList;
