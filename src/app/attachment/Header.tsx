import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

const Header: React.FC = () => {
  const router = useRouter();

  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Image
          src="/logo/paperclip.svg"
          alt="Paperclip Icon"
          className="h-6 w-6"
          width={24}
          height={24}
        />
        <h1 className="text-primaryText text-lg font-semibold md:text-xl">File</h1>
      </div>
      <button onClick={() => router.back()} className="flex items-center text-blue-500">
        <Image
          src="/logo/arrow-left.svg"
          alt="Arrow Icon"
          className="mr-2 h-4 w-4"
          width={16}
          height={16}
        />
        Return
      </button>
    </div>
  );
};

export default Header;
