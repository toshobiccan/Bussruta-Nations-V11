
import React, { useState } from 'react';
import { GameState } from '../types';

interface PreGameLobbyProps {
  gameState: GameState;
  onAddPlayer: (playerName: string) => void;
  onStartGame: () => void;
}

const PreGameLobby: React.FC<PreGameLobbyProps> = ({ gameState, onAddPlayer, onStartGame }) => {
    const [newPlayerName, setNewPlayerName] = useState('');
    
    const handleAddPlayer = () => {
        if(newPlayerName.trim()) {
            onAddPlayer(newPlayerName);
            setNewPlayerName('');
        }
    }

    const canStart = gameState.players.length >= 2;

    return (
    <div className="flex flex-col items-center justify-center h-screen bg-black p-4 text-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-neutral-400 mb-2">Venterom</h1>
        <p className="text-lg text-white mb-4">Be andre joine med koden:</p>
        <div className="bg-neutral-900 border-2 border-neutral-700 rounded-lg py-4 px-6 mb-8">
            <p className="text-6xl font-mono font-black tracking-widest text-white">{gameState.id}</p>
        </div>
        
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <h2 className="text-xl font-bold text-white mb-4">Nasjoner klare:</h2>
          <div className="space-y-3 max-h-40 overflow-y-auto mb-6 pr-2">
            {gameState.players.map(player => (
                <div key={player.id} className="bg-neutral-800 p-3 rounded-md text-left flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={`Flagg for ${player.name}`}>{player.flag}</span>
                    <p className="font-semibold text-white">{player.name}</p>
                </div>
            ))}
          </div>
          
          {/* Admin controls for adding dummy players */}
          <div className="border-t border-neutral-700 pt-4">
              <p className="text-xs text-neutral-500 mb-2">Admin: Legg til spiller (for demo)</p>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Navn på nasjon..."
                  className="flex-grow p-3 bg-neutral-800 text-white placeholder-neutral-500 rounded-md border-2 border-neutral-700 focus:border-white focus:ring-white focus:outline-none transition"
                />
                <button 
                    onClick={handleAddPlayer}
                    className="p-3 bg-neutral-700 text-white font-bold rounded-md hover:bg-neutral-600 transition-all duration-300"
                >
                  Legg til
                </button>
              </div>
          </div>
          
          <button 
            onClick={onStartGame}
            disabled={!canStart}
            className="w-full mt-4 p-4 bg-white text-black font-bold rounded-md hover:bg-neutral-200 transition-all duration-300 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed"
          >
            {canStart ? 'Start Spill' : 'Venter på flere spillere...'}
          </button>
        </div>
      </div>
    </div>
    )
};

export default PreGameLobby;
