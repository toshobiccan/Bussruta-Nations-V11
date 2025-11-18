import React, { useState, useEffect } from 'react';
import { FinaleGame, Player } from '../types';

const CONFETTI_COUNT = 200;

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) {
    return null;
  }

  const confetti = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 2 + 3}s`, // 3-5 seconds
      animationDelay: `${Math.random() * 0.8}s`,
      backgroundColor: ['#fef08a', '#fde047', '#eab308', '#f59e0b', '#d97706', '#ffffff'][Math.floor(Math.random() * 6)],
      transform: `rotate(${Math.random() * 360}deg)`,
    };
    return <div key={i} className="confetti-piece" style={style} />;
  });

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[110]">
        {confetti}
      </div>
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 1;
          }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 16px;
          opacity: 0;
          animation: confetti-fall cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
      `}</style>
    </>
  );
};

interface FinaleGameViewProps {
  finaleGame: FinaleGame;
  currentPlayer: Player;
  onGuess: (guess: 'red' | 'black') => void;
  onEnd: () => void;
}

const GoldCard: React.FC<{
  card: FinaleGame['card'];
  isRevealed: boolean;
  isCorrect?: boolean;
}> = ({ card, isRevealed, isCorrect }) => {
  const isRed = card.color === 'red';

  return (
    <div className="w-48 h-64" style={{ perspective: '1000px' }}>
      <div
        className={`relative w-full h-full transition-transform duration-1000 ${isRevealed ? 'card-flipped' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden rounded-lg flex flex-col items-center justify-center shadow-lg border-2 border-yellow-300/50 shiny-gold-tile p-1">
            {/* Back content if any */}
        </div>
        {/* Card Front */}
        <div className={`absolute w-full h-full backface-hidden rounded-lg bg-white border-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`} style={{ transform: 'rotateY(180deg)' }}>
             <div className={`w-full h-full rounded-md flex flex-col items-center justify-between p-2 shadow-inner ${isRed ? 'text-red-600' : 'text-black'}`}>
                <div className="text-left w-full">
                    <span className="font-bold text-4xl">{card.rank}</span>
                    <span className="text-2xl">{card.suit}</span>
                </div>
                <div className="text-6xl opacity-20">{card.suit}</div>
                <div className="text-right w-full transform rotate-180">
                    <span className="font-bold text-4xl">{card.rank}</span>
                    <span className="text-2xl">{card.suit}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


const FinaleGameView: React.FC<FinaleGameViewProps> = ({ finaleGame, currentPlayer, onGuess, onEnd }) => {
    const [viewPhase, setViewPhase] = useState<'entering' | 'active' | 'exiting'>('entering');
    const finalePlayer = finaleGame.playerId === currentPlayer.id;

    useEffect(() => {
        const enterTimer = setTimeout(() => setViewPhase('active'), 100);
        return () => clearTimeout(enterTimer);
    }, []);

    const handleEnd = () => {
        setViewPhase('exiting');
        setTimeout(onEnd, 1000);
    };
    
    let content;
    switch(finaleGame.phase) {
        case 'intro':
            content = (
                <div className="text-center animate-fade-in" style={{animationDelay: '0.5s'}}>
                    <h2 className="text-2xl font-bold text-neutral-300">Det er tid for...</h2>
                    <h1 className="text-7xl font-black text-yellow-400 my-2" style={{textShadow: '0 0 20px rgba(250, 204, 21, 0.7)'}}>FINALE</h1>
                </div>
            );
            break;
        
        case 'guessing':
             content = (
                <div className="flex flex-col items-center animate-fade-in w-full max-w-sm">
                    <h2 className="text-3xl font-bold text-white mb-4">Det siste kortet</h2>
                    <GoldCard card={finaleGame.card} isRevealed={false} />
                    <p className="text-neutral-300 my-6 text-center">
                        {finalePlayer ? "Gjett fargen for å vinne alt!" : `Venter på at ${currentPlayer.name} skal gjette...`}
                    </p>
                    {finalePlayer && (
                         <div className="grid grid-cols-2 gap-4 w-full">
                            <button onClick={() => onGuess('red')} className="p-4 font-bold rounded-md transition text-2xl bg-red-800/80 text-red-200 hover:bg-red-700/80 hover:text-white">
                                Rød
                            </button>
                            <button onClick={() => onGuess('black')} className="p-4 font-bold rounded-md transition text-2xl bg-neutral-700/80 text-neutral-200 hover:bg-neutral-600/80 hover:text-white">
                                Svart
                            </button>
                        </div>
                    )}
                </div>
            );
            break;

        case 'revealing':
             content = (
                <div className="flex flex-col items-center animate-fade-in w-full max-w-sm">
                    <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">Kortet er...</h2>
                    <GoldCard card={finaleGame.card} isRevealed={true} isCorrect={finaleGame.isCorrect} />
                </div>
            );
            break;
        
        case 'won':
            content = (
                 <div className="flex flex-col items-center animate-fade-in w-full max-w-sm">
                    <Confetti active={true} />
                    <h2 className="text-6xl font-black text-green-400 mb-4 text-center">SEIER!</h2>
                    <GoldCard card={finaleGame.card} isRevealed={true} isCorrect={finaleGame.isCorrect} />
                    <p className="text-2xl text-white mt-6 text-center">
                        <span className="font-bold">{currentPlayer.name}</span> har vunnet spillet!
                    </p>
                    {finalePlayer && (
                        <button onClick={handleEnd} className="mt-8 px-8 py-4 bg-white text-black font-bold text-lg rounded-md hover:bg-neutral-200 transition-all">
                           Avslutt spillet
                        </button>
                    )}
                 </div>
            );
            break;

        case 'lost':
              content = (
                 <div className="flex flex-col items-center animate-fade-in w-full max-w-sm">
                    <h2 className="text-5xl font-black text-red-500 mb-4 text-center">FEIL</h2>
                    <GoldCard card={finaleGame.card} isRevealed={true} isCorrect={finaleGame.isCorrect} />
                    <p className="text-xl text-white mt-6 text-center">
                        Bedre lykke neste gang!
                    </p>
                     {finalePlayer && (
                        <button onClick={handleEnd} className="mt-8 px-8 py-4 bg-white text-black font-bold text-lg rounded-md hover:bg-neutral-200 transition-all">
                           Tilbake til kartet
                        </button>
                    )}
                 </div>
            );
            break;

        default:
            content = null;
    }

    return (
        <div className={`absolute inset-0 bg-neutral-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-[102] transition-opacity duration-500 ${viewPhase === 'active' ? 'opacity-100' : 'opacity-0'}`}>
             <style>{`
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                .card-flipped { transform: rotateY(180deg); }
                @keyframes shiny-gold-key {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shiny-gold-tile {
                    background: linear-gradient(110deg, #b48b03 8%, #fef08a 18%, #b48b03 33%);
                    background-size: 200% 100%;
                    animation: shiny-gold-key 2.5s linear infinite;
                }
            `}</style>
            {content}
        </div>
    );
}

export default FinaleGameView;
