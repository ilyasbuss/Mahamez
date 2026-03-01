import React from 'react';

const MahamezLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        {/* Ebene 1: Unterste Fläche (#5920c0) - x=2 bis x=22 (Breite 20) */}
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#5920C0" />
        
        {/* Ebene 2: Orangener Kreis (#ff3300) */}
        {/* r=7 mit strokeWidth=2 ergibt einen Außenradius von 8 (reicht bis x=4/20) */}
        <circle cx="12" cy="12" r="7" stroke="#FF3300" strokeWidth="2" fill="none" />
        
        {/* Ebene 3: Vier symmetrische, offene Quadrate (#1d0b40) */}
        {/* d=7 (visuelle Größe), g=2 (Abstand). 3*2 + 2*7 = 20. */}
        {/* rect x=5, w=5, stroke=2 -> Visuell von x=4 bis x=11 */}
        <rect x="5" y="5" width="5" height="5" rx="1" stroke="#1D0B40" strokeWidth="2" fill="none" />
        <rect x="14" y="5" width="5" height="5" rx="1" stroke="#1D0B40" strokeWidth="2" fill="none" />
        <rect x="5" y="15" width="5" height="5" rx="1" stroke="#1D0B40" strokeWidth="2" fill="none" />
        <rect x="14" y="15" width="5" height="5" rx="1" stroke="#1D0B40" strokeWidth="2" fill="none" />
    </svg>
);

export default MahamezLogo;
