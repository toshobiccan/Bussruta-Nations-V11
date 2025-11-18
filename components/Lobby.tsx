import React, { useState } from 'react';
import { BusLogo } from './BusLogo';

interface LobbyProps {
  onCreateGame: (playerName: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onCreateGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreate = () => {
    if (isCreating) return; // Prevent double clicks
    if (playerName.trim()) {
        setIsCreating(true);
        onCreateGame(playerName);
    } else {
        alert('Du må velge et navn for din nasjon!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black p-4">
      <div className="w-full max-w-sm text-center">
        <BusLogo className="w-48 h-auto mx-auto mb-6 text-white" />
        <h1 className="text-6xl font-black text-white mb-2">Bussruta</h1>
        <h2 className="text-3xl font-bold text-neutral-400 mb-10">Nations</h2>
        
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Navn på din nasjon..."
            className="w-full p-3 mb-4 bg-neutral-800 text-white placeholder-neutral-500 rounded-md border-2 border-neutral-700 focus:border-white focus:ring-white focus:outline-none transition"
          />
          
          <button 
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full p-4 bg-white text-black font-bold rounded-md hover:bg-neutral-200 transition-all duration-300 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-wait"
          >
            {isCreating ? 'Starter...' : 'Start Nytt Spill'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
