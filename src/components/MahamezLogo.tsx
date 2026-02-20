import React from 'react';

const MahamezLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 24 24" fill="none" className={`${className} text-[#4B2C82]`}>
        <rect x="0" y="0" width="11" height="11" rx="2" fill="currentColor" />
        <rect x="13" y="0" width="11" height="11" rx="2" fill="currentColor" />
        <rect x="0" y="13" width="11" height="11" rx="2" fill="currentColor" />
        <rect x="13" y="13" width="11" height="11" rx="2" fill="currentColor" />
    </svg>
);

export default MahamezLogo;
