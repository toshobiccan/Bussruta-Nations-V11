import React from 'react';

export const BusLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className} 
        viewBox="0 0 58 36"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        role="img"
        aria-label="Bussruta Logo"
    >
        <path d="M49.93,4.13c-1.33-1.07-3-1.63-4.75-1.63h-22.9c-2.48,0-4.75,1.2-6.19,3.16L3.9,23.37 c-2.12,2.9-1.8,7.02,0.76,9.56l-0.01-0.01c1.23,1.2,2.89,1.87,4.64,1.87h0.52c4.49,0,8.13-3.64,8.13-8.13 c0-3.32-2-6.19-4.81-7.44l11.41-15.08h15.5l-6.81,9h12.55c3.55,0,6.62-2.31,7.74-5.63L53.7,7.85 C53.23,6.27,51.83,4.93,49.93,4.13z M22.28,29.81c-2.21,0-4-1.79-4-4s1.79-4,4-4s4,1.79,4,4S24.49,29.81,22.28,29.81z"/>
    </svg>
);
