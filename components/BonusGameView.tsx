import React, { useState, useEffect, useRef } from 'react';
import { BonusGame, BonusCard as BonusCardType, Player } from '../types';
import { BusLogo } from './BusLogo';

interface BonusGameViewProps {
  bonusGame: BonusGame;
  currentPlayer: Player;
  bonusGamePlayerName: string;
  onGuess: (cardIndex: number, guess: 'red' | 'black') => void;
  onEnd: () => void;
}

const MultiplierSpinner: React.FC<{ finalMultiplier: number | null }> = ({ finalMultiplier }) => {
  const [displayValue, setDisplayValue] = useState(1);
  const [isSettled, setIsSettled] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (finalMultiplier === null) {
      setIsSettled(false);
      intervalRef.current = window.setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 9) + 1);
      }, 65);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeout(() => {
        setDisplayValue(finalMultiplier);
        setIsSettled(true);
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [finalMultiplier]);

  return (
    <span className={`font-black text-lg transition-transform duration-200 ${isSettled ? 'scale-125' : 'scale-100'}`}>
      {displayValue}x
    </span>
  );
};


const BonusCard: React.FC<{
  cardData: BonusCardType;
  index: number;
  isSelected: boolean;
  onClick: (index: number) => void;
  shouldPulse: boolean;
}> = ({ cardData, index, isSelected, onClick, shouldPulse }) => {
  const { card, isRevealed, isCorrect, type, multiplier } = cardData;
  const isRed = card.color === 'red';
  const winnings = isCorrect && multiplier ? card.value * multiplier : 0;

  const backBorderClasses = isSelected
    ? 'ring-4 ring-offset-2 ring-offset-black ring-yellow-400 border-yellow-400'
    : 'border-neutral-700';
    
  const backBgClass = type === 'MEGABONUS' ? 'bg-pink-900/80' : 'bg-yellow-800/80';
  const backIconColor = type === 'MEGABONUS' ? 'text-pink-500' : 'text-yellow-500';

  return (
    <div
      className={`w-20 h-28 cursor-pointer ${shouldPulse ? 'pulse-green-once' : ''}`}
      style={{ perspective: '1000px' }}
      onClick={() => onClick(index)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ${isRevealed ? 'card-flipped' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back */}
        <div className={`absolute w-full h-full backface-hidden rounded-md flex flex-col items-center justify-center shadow-lg border-2 ${backBorderClasses} ${backBgClass} p-1`}>
            <span className={`font-black text-xs ${backIconColor}`}>{type}</span>
             <BusLogo className={`w-8 h-auto ${backIconColor}`} />
             <div className={`mt-1 ${backIconColor}`}>
                <MultiplierSpinner finalMultiplier={multiplier} />
             </div>
        </div>
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden rounded-md" style={{ transform: 'rotateY(180deg)' }}>
            <div className={`w-full h-full bg-white rounded-md border-2 ${isCorrect ? 'border-green-500' : 'border-red-500'} flex flex-col items-center justify-between text-xs shadow-md p-1 ${isRed ? 'text-red-600' : 'text-black'}`}>
                <div className="text-left w-full">
                    <span className="font-bold text-lg">{card.rank}</span>
                    <span>{card.suit}</span>
                </div>
                 <div className={`w-full text-center font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? `+${winnings}` : '+0'}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const BonusGameView: React.FC<BonusGameViewProps> = ({ bonusGame, currentPlayer, bonusGamePlayerName, onGuess, onEnd }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [animationClass, setAnimationClass] = useState('opacity-0 scale-75');
  const isPlayerTurn = bonusGame.playerId === currentPlayer.id;
  const { phase } = bonusGame;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('opacity-100 scale-100');
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const handleEndGame = () => {
    setAnimationClass('opacity-0 scale-75');
    setTimeout(onEnd, 1000);
  };
  
  const handleCardClick = (index: number) => {
    if (bonusGame.cards[index].isRevealed || phase !== 'playing' || !isPlayerTurn) return;
    setSelectedIndex(index);
  };

  const handleGuess = (guess: 'red' | 'black') => {
    if (selectedIndex !== null) {
      onGuess(selectedIndex, guess);
      setSelectedIndex(null);
    }
  };

  return (
    <div className={`absolute inset-0 bg-neutral-950/95 backdrop-blur-lg flex flex-col items-center justify-center z-[100] p-4 transition-all duration-1000 ease-out ${animationClass}`}>
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-yellow-400 mb-2" style={{textShadow: '0 0 15px rgba(250, 204, 21, 0.5)'}}>BONUS GAME</h1>
        <p className="text-neutral-300">
          {phase === 'initializing' && 'Bestemmer multiplikatorer...'}
          {phase === 'revealing_multipliers' && 'Multiplikatorer låst! Gjør deg klar...'}
          {phase === 'playing' && (isPlayerTurn ? "Gjett fargen på kort med unike multiplikatorer!" : `${bonusGamePlayerName} spiller bonusspillet.`)}
          {phase === 'finished' && 'Spillet er ferdig!'}
        </p>
      </div>
      
      <div className="flex justify-center gap-2 mb-6">
        {bonusGame.cards.map((cardData, index) => (
          <BonusCard
            key={index}
            cardData={cardData}
            index={index}
            isSelected={selectedIndex === index}
            onClick={handleCardClick}
            shouldPulse={phase === 'revealing_multipliers'}
          />
        ))}
      </div>

      <div className="h-28 flex flex-col items-center justify-center">
        {isPlayerTurn && selectedIndex !== null && phase === 'playing' && (
           <div className="w-full max-w-xs text-center animate-fade-in">
                <h3 className="text-lg font-bold mb-3 text-white">Gjett farge:</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleGuess('red')} className="p-4 font-bold rounded-md transition bg-red-800/50 text-red-300 hover:bg-red-700/50 hover:text-white">
                        Rød
                    </button>
                    <button onClick={() => handleGuess('black')} className="p-4 font-bold rounded-md transition bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 hover:text-white">
                        Svart
                    </button>
                </div>
            </div>
        )}
        {!isPlayerTurn && phase === 'playing' && (
            <div className="text-center animate-fade-in">
                <p className="text-neutral-400 animate-pulse">Venter på at {bonusGamePlayerName} skal gjette...</p>
            </div>
        )}
        {phase === 'initializing' && (
            <div className="text-center animate-pulse text-lg text-neutral-400">
                Lykke til...
            </div>
        )}
        {phase === 'revealing_multipliers' && (
            <div className="text-center animate-pulse text-lg text-green-400">
                Klar... ferdig...
            </div>
        )}
      </div>

      <div className="bg-neutral-900/80 rounded-lg p-4 text-center">
        <p className="text-xl text-neutral-300">Total Gevinst:</p>
        <p className="text-4xl font-bold text-yellow-400">{bonusGame.winnings} BC</p>
      </div>

      {isPlayerTurn && phase === 'finished' && (
        <button 
            onClick={handleEndGame} 
            className="mt-8 px-8 py-4 bg-white text-black font-bold text-lg rounded-md hover:bg-neutral-200 transition-all animate-fade-in"
        >
          Hent Gevinst
        </button>
      )}

      <style>{`
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .card-flipped { transform: rotateY(180deg); }
        @keyframes pulse-green {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
            }
            70% {
                transform: scale(1.05);
                box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
            }
        }
        .pulse-green-once {
            animation: pulse-green 1.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BonusGameView;