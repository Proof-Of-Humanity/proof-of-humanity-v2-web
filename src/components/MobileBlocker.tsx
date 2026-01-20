import React from 'react';

const MobileBlocker: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFF5F0] p-6 text-center md:hidden text-[#333333]">
      <div className="bg-white/80 p-8 rounded-2xl shadow-lg border border-[#FF9966]/10 backdrop-blur-sm max-w-sm w-full flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-[#333333]">
          Humanity Deserves
          <br />
          <span className="text-[#FF9966]">a Larger Screen.</span>
        </h1>
        
        <p className="text-[#333333] leading-relaxed text-sm opacity-80">
          We are currently perfecting the mobile experience to ensure your identity is always protected. For now, join us on a desktop to launch your journey.
        </p>

        <div className="space-y-1">
          <p className="text-[#999999] text-xs">
            Find us on a desktop near you at:
          </p>
          <p className="text-[#FF9966] font-semibold text-lg">
            v2.proofofhumanity.id
          </p>
        </div>

        <a
          href="https://t.me/proofhumanity"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-md bg-[#2AABEE] py-3 text-white font-semibold shadow hover:bg-[#229ED9] transition-colors flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
             <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Join Our Telegram
        </a>
      </div>
    </div>
  );
};

export default MobileBlocker;
