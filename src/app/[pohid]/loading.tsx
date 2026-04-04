import Image from "next/image";

export default function Loading() {
  return (
    <div className="content animate-pulse">
      <div className="paper relative mt-24 flex flex-col items-center pt-20">
        <div className="bordered absolute -top-16 left-1/2 -translate-x-1/2 rounded-full shadow">
          <div className="bg-whiteBackground h-32 w-32 rounded-full px-6 pt-5">
            <Image
              alt="poh id"
              src="/logo/pohid.svg"
              height={128}
              width={128}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-grey h-3 w-16 rounded" />
          <div className="bg-grey mb-12 mt-4 h-8 w-72 max-w-full rounded" />
        </div>
      </div>
    </div>
  );
}
