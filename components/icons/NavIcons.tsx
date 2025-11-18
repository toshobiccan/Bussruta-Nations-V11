

import React from 'react';

const iconProps = {
  className: "w-7 h-7",
  strokeWidth: 2,
};

export const BankIcon: React.FC = () => (
  <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

export const ShopIcon: React.FC = () => (
  <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

export const MapIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.25c-.317-.159-.69-.159-1.006 0L4.628 5.184c-.748.374-1.228 1.17-1.228 1.996v10.198c0 .826.48 1.622 1.228 1.996l3.869 1.934c.317.159.69.159 1.006 0l4.875-2.437c.381-.19.622-.58.622-1.006V10.318c0-.426-.24-.816-.622-1.006L15 8.25" />
    </svg>
);

export const ScannerIcon: React.FC = () => (
  <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h-1m-2-11h1M4 12H3m10 6v-1m6-5h-1M7 5H6M4 16v1m12-8v1m-6 6v1M6 9H5M3 3l3.5 3.5M17.5 17.5L21 21" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const GamblingIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M8.5 8.5a.1.1 0 1 0 0 .01zm7 0a.1.1 0 1 0 0 .01zm-3.5 3.5a.1.1 0 1 0 0 .01zm-3.5 3.5a.1.1 0 1 0 0 .01zm7 0a.1.1 0 1 0 0 .01z" />
    </svg>
);

export const AdminIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className || "w-5 h-5"}
    >
      <path
        fillRule="evenodd"
        d="M4.5 2.25a.75.75 0 000 1.5v1.5H3a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5H6v-1.5a.75.75 0 00-1.5 0zM19.5 2.25a.75.75 0 000 1.5v1.5h1.5a.75.75 0 000-1.5H21v-1.5a.75.75 0 00-1.5 0zM12 6.75a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5v-1.5zM12 12.75a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5v-1.5zM15 6.75a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5v-1.5zM9 12.75a.75.75 0 00-1.5 0v1.5H6a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5H9v-1.5z"
        clipRule="evenodd"
      />
      <path d="M6 18.75a.75.75 0 000 1.5h12a.75.75 0 000-1.5H6z" />
    </svg>
  );

export const AdminPanelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226l.554-.228c.642-.266 1.355.068 1.558.728l.255 1.021a.563.563 0 00.47.47l1.02.256c.66.164 1.006.876.742 1.528l-.228.554c-.22.548-.706.992-1.226 1.11l-.554.228c-.66.164-1.355-.068-1.558-.728l-.255-1.02a.563.563 0 00-.47-.47l-1.02-.256a1.563 1.563 0 01-1.528-.742L8.45 4.665c-.266-.642.068-1.355.728-1.558l.554-.228zM12 9.25a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Shop Icons
export const BillettkontrollIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-8 h-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const LandmineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-8 h-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563V9a3 3 0 013-3v.563m-3 0V9a3 3 0 003 3v-.563m-3 0a3 3 0 003 3V15m-3-5.437a3 3 0 013-3v5.874a3 3 0 01-3-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25V9.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12h-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75V14.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h1.5" />
  </svg>
);

export const NukeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-8 h-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.25 4.5a8.94 8.94 0 010 15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a8.94 8.94 0 010 15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 000-18h.5a9 9 0 000 18h-.5z" />
    </svg>
);

export const SuckersRoadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-8 h-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const RontgenbrillerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-8 h-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-5 h-5"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

export const SkullIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-8 h-8"} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.001 2C6.478 2 2 6.477 2 11.999c0 5.522 4.478 9.999 10.001 9.999 5.522 0 9.999-4.477 9.999-9.999C22 6.477 17.523 2 12.001 2zM8.5 8c.828 0 1.5.672 1.5 1.5S9.328 11 8.5 11s-1.5-.672-1.5-1.5S7.672 8 8.5 8zm7 0c.828 0 1.5.672 1.5 1.5S16.328 11 15.5 11s-1.5-.672-1.5-1.5S14.672 8 15.5 8zM12 14c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
    </svg>
);

export const PermanentSkullIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Bones */}
        <path d="M6.5 17.5L17.5 6.5" />
        <path d="M17.5 17.5L6.5 6.5" />
        <path d="M4 20l2.5-2.5" />
        <path d="M20 4l-2.5 2.5" />
        <path d="M4 4l2.5 2.5" />
        <path d="M20 20l-2.5-2.5" />

        {/* Skull */}
        <path d="M12 3a7 7 0 00-7 7v4a4 4 0 004 4h6a4 4 0 004-4v-4a7 7 0 00-7-7z" />
        {/* Eyes */}
        <path d="M9.5 9.5l2 2m-2 0l2-2" />
        <path d="M14.5 9.5l-2 2m2 0l-2-2" />
        {/* Teeth */}
        <rect x="9" y="14.5" width="1.5" height="2" rx="0.25" />
        <rect x="11.25" y="14.5" width="1.5" height="2" rx="0.25" />
        <rect x="13.5" y="14.5" width="1.5" height="2" rx="0.25" />
    </svg>
);

export const itemIcons: { [key: string]: React.FC<{ className?: string }> } = {
  'weapon-billettkontroll': BillettkontrollIcon,
  'weapon-nuke': NukeIcon,
  'weapon-suckers-road': SuckersRoadIcon,
  'powerup-rontgenbriller': RontgenbrillerIcon,
  'weapon-landmine': LandmineIcon,
};
