
import React from 'react';
import { Player } from '../types';

interface AdminPanelProps {
  players: Player[];
  currentTurnPlayerId: string;
  currentPlayerId: string;
  onClose: () => void;
  onForceSetTurn: (playerId: string) => void;
  onForceNextRound: () => void;
  onForceTripleGreenJackpot: () => void;
  onSetCurrentPlayer: (playerId: string) => void;
  isJackpotForcing: boolean;
  onToggleForceRedCards: () => void;
  isForcingRedCards: boolean;
  onToggleForceClubs3: () => void;
  isForcingClubs3: boolean;
  onToggleForceBeggar: () => void;
  isForcingBeggar: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ players, currentTurnPlayerId, currentPlayerId, onClose, onForceSetTurn, onForceNextRound, onForceTripleGreenJackpot, onSetCurrentPlayer, isJackpotForcing, onToggleForceRedCards, isForcingRedCards, onToggleForceClubs3, isForcingClubs3, onToggleForceBeggar, isForcingBeggar }) => {

  const handleSetTurn = (playerId: string) => {
    onForceSetTurn(playerId);
    onClose();
  }

  const handleForceNextRound = () => {
    onForceNextRound();
    onClose();
  }
  
  const handleForceTripleGreen = () => {
    onForceTripleGreenJackpot();
    onClose();
  }

  const handleToggleForceRed = () => {
    onToggleForceRedCards();
    onClose();
  }

  const handleToggleForceClubs3 = () => {
    onToggleForceClubs3();
    onClose();
  };

  const handleToggleForceBeggar = () => {
    onToggleForceBeggar();
    onClose();
  };

  const handleSetCurrentPlayer = (playerId: string) => {
    onSetCurrentPlayer(playerId);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-neutral-900 border-2 border-red-500/50 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-500">Adminpanel</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-300 border-b border-neutral-700 pb-2 mb-3">Nasjonsoversikt</h3>
          <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
            {players.map(player => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-md">
                <span className={`font-medium flex items-center gap-2 ${player.id === currentTurnPlayerId ? 'text-white font-bold' : 'text-neutral-300'}`}>
                  <span role="img" aria-label={`Flagg for ${player.name}`}>{player.flag}</span>
                  {player.name}
                </span>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-300">{player.coins}<span className="text-xs text-neutral-500"> BC</span></span>
                    <button
                      onClick={() => handleSetTurn(player.id)}
                      disabled={player.id === currentTurnPlayerId}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition"
                    >
                      Gi tur
                    </button>
                    <button
                      onClick={() => handleSetCurrentPlayer(player.id)}
                      disabled={player.id === currentPlayerId}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition"
                    >
                      Spill som
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-neutral-300 border-b border-neutral-700 pb-2 mb-3">Spillhandlinger</h3>
            <button
                onClick={handleForceNextRound}
                className="w-full p-3 bg-amber-600 text-white font-bold rounded hover:bg-amber-500 transition"
            >
                Tving Neste Runde
            </button>
            <button
                onClick={handleForceTripleGreen}
                disabled={isJackpotForcing}
                className="w-full p-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-wait"
            >
                {isJackpotForcing ? 'Rigger jackpot...' : 'Tving Triple Green Jackpot'}
            </button>
            <button
                onClick={handleToggleForceRed}
                className={`w-full p-3 text-white font-bold rounded transition ${
                    isForcingRedCards 
                    ? 'bg-red-800 hover:bg-red-700' 
                    : 'bg-red-600 hover:bg-red-500'
                }`}
            >
                {isForcingRedCards ? 'Deaktiver Tving Røde Kort' : 'Tving Røde Kort'}
            </button>
             <button
                onClick={handleToggleForceClubs3}
                className={`w-full p-3 text-white font-bold rounded transition ${
                    isForcingClubs3 
                    ? 'bg-blue-800 hover:bg-blue-700' 
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
            >
                {isForcingClubs3 ? 'Deaktiver Tving Kløver 3' : 'Tving Neste Kort Kløver 3'}
            </button>
            <button
                onClick={handleToggleForceBeggar}
                className={`w-full p-3 text-white font-bold rounded transition ${
                    isForcingBeggar 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
            >
                {isForcingBeggar ? 'Deaktiver Tving Tigger' : 'Tving Neste Kort Tigger'}
            </button>
        </div>

        <button
            onClick={onClose}
            className="w-full mt-6 p-3 bg-neutral-700 text-neutral-300 font-bold rounded-md hover:bg-neutral-600 transition"
        >
            Lukk
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
