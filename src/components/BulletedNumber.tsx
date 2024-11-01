"use client";

interface BulletedNumberProps {
  number: number;
  current?: boolean;
}

const BulletedNumber: React.FC<BulletedNumberProps> = ({
  number,
  current = false,
}) =>
  current ? (
    <div className="relative mt-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-black opacity-50">
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="py-0.25 rounded-full bg-white px-0.5 text-sm leading-none text-black">
          {number}
        </span>
      </span>
    </div>
  ) : (
    <div className="relative mt-2 flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#FF9966] to-[#FF8CA9]">
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="py-0.25 rounded-full px-0.5 text-sm leading-none text-white">
          {number}
        </span>
      </span>
    </div>
  );

export default BulletedNumber;
