import React from 'react';

const MahamezLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${className} text-[#9F7AEA]`}>
        <circle cx="12" cy="12" r="8" stroke="#f97316" opacity="0.8" />
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </svg>
);

export default MahamezLogo;
