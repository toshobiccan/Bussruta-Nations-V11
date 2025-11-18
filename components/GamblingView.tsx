

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Player, GameState, RouletteState } from '../types';
import { ROULETTE_POCKETS } from '../constants';
import { BusLogo } from './BusLogo';

interface GamblingGameProps {
  player: Player;
  onUpdatePlayerCoins: (playerId: string, amount: number) => void;
  onBack: () => void;
}

const CoinFlipGame: React.FC<GamblingGameProps> = ({ player, onUpdatePlayerCoins, onBack }) => {
    const [betAmount, setBetAmount] = useState(10);
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState<'Krone' | 'Mynt' | null>(null);
    const [message, setMessage] = useState('');

    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseInt(e.target.value, 10);
        if (isNaN(amount) || amount < 0) {
            setBetAmount(0);
        } else {
            setBetAmount(Math.min(amount, player.coins));
        }
    };
    
    const adjustBet = (amount: number) => {
        setBetAmount(prev => Math.max(0, Math.min(prev + amount, player.coins)));
    };

    const handleFlip = (choice: 'Krone' | 'Mynt') => {
        if (betAmount <= 0 || betAmount > player.coins || isFlipping) {
            return;
        }
        setIsFlipping(true);
        setMessage('');
        setResult(null);

        const outcome = Math.random() < 0.5 ? 'Krone' : 'Mynt';
        
        setTimeout(() => {
            setResult(outcome);
            if (outcome === choice) {
                setMessage(`Du vant ${betAmount} BC!`);
                onUpdatePlayerCoins(player.id, betAmount);
            } else {
                setMessage(`Du tapte ${betAmount} BC.`);
                onUpdatePlayerCoins(player.id, -betAmount);
            }
            setIsFlipping(false);
        }, 1500); // Duration of the flip animation
    };

    return (
        <div className="flex flex-col items-center justify-start h-full text-center p-4 animate-fade-in">
             <div className="w-full max-w-sm text-left mb-4">
                 <button onClick={onBack} className="text-neutral-400 hover:text-white transition p-2 -ml-2">&larr; Tilbake til spill</button>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Krone/Mynt</h2>
            <p className="text-neutral-400 mb-6">Sats dine BussCoins for en sjanse til å doble dem!</p>

            <div className="w-full max-w-xs space-y-4">
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                    <label className="text-sm font-bold uppercase tracking-widest text-neutral-500">Innsats</label>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={handleBetChange}
                        disabled={isFlipping}
                        className="w-full p-3 mt-2 text-center text-4xl font-bold bg-neutral-800 text-white placeholder-neutral-500 rounded-md border-2 border-neutral-700 focus:border-white focus:ring-white focus:outline-none transition"
                    />
                     <div className="grid grid-cols-4 gap-2 mt-3">
                        <button onClick={() => setBetAmount(0)} disabled={isFlipping} className="p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 font-bold disabled:opacity-50">Tøm</button>
                        <button onClick={() => adjustBet(5)} disabled={isFlipping} className="p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 font-bold disabled:opacity-50">+5</button>
                        <button onClick={() => adjustBet(10)} disabled={isFlipping} className="p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 font-bold disabled:opacity-50">+10</button>
                        <button onClick={() => adjustBet(50)} disabled={isFlipping} className="p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 font-bold disabled:opacity-50">+50</button>
                    </div>
                    <button onClick={() => setBetAmount(player.coins)} disabled={isFlipping} className="w-full mt-2 p-2 bg-red-600 rounded-md hover:bg-red-500 font-bold disabled:opacity-50">All In</button>
                </div>

                <div className="h-32 flex items-center justify-center">
                    <div className={`coin ${isFlipping ? 'flipping' : ''}`} data-result={result}>
                        <div className="side-a text-black">BC</div>
                        <div className="side-b text-white">BC</div>
                    </div>
                </div>

                {message && <p className="text-lg font-bold h-6">{message}</p>}

                {!isFlipping && !message && <p className="text-lg font-bold h-6">Velg din side...</p>}
                 {isFlipping && <p className="text-lg font-bold h-6 animate-pulse">Spinner...</p>}

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleFlip('Krone')} disabled={isFlipping || betAmount <= 0} className="p-4 bg-white text-black font-bold rounded-md hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500">
                        Krone
                    </button>
                    <button onClick={() => handleFlip('Mynt')} disabled={isFlipping || betAmount <= 0} className="p-4 bg-neutral-800 text-white font-bold rounded-md hover:bg-neutral-700 disabled:bg-neutral-700 disabled:text-neutral-500">
                        Mynt
                    </button>
                </div>
            </div>
            <style>{`
                .coin {
                    width: 80px;
                    height: 80px;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                }
                .coin.flipping {
                    transform: rotateY(1800deg);
                }
                .coin[data-result="Mynt"] {
                    transform: rotateY(180deg);
                }
                .coin[data-result="Krone"] {
                     transform: rotateY(0deg);
                }
                .side-a, .side-b {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: bold;
                    border-radius: 50%;
                    border: 4px solid #4b5563;
                }
                .side-a {
                    background: linear-gradient(45deg, #f9fafb, #e5e7eb);
                    transform: rotateY(0deg);
                }
                .side-b {
                    background: linear-gradient(45deg, #374151, #111827);
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
};

interface RouletteGameProps extends GamblingGameProps {
  players: Player[];
  rouletteState: RouletteState;
  jackpotAmount: number;
  onPlaceBet: (color: 'red' | 'black' | 'green', amount: number) => void;
  onClearBets: () => void;
}

const StandardBusIcon = () => (
    <BusLogo className="w-16 h-auto text-white/90" />
);

const SpectacularBusIcon = () => (
    <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Star background */}
        <svg className="absolute w-full h-full text-yellow-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        {/* Golden Bus on top */}
        <BusLogo className="w-16 h-auto text-yellow-500 relative drop-shadow-lg" />
    </div>
);

const JackpotTile: React.FC<{ filled: boolean }> = ({ filled }) => {
    if (filled) {
      return (
        <div className="w-10 h-10 bg-green-900 border-2 border-green-700 rounded-md flex items-center justify-center animate-fade-in">
          <BusLogo className="w-8 h-auto text-green-500" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-neutral-800/50 border border-neutral-700 rounded-md flex items-center justify-center text-neutral-600 font-bold text-2xl font-serif italic">
        R
      </div>
    );
};

const TripleGreenJackpot: React.FC<{ amount: number; history: ('red' | 'black' | 'green')[] }> = ({ amount, history }) => {
    let consecutiveGreens = 0;
    for (const color of history) {
        if (color === 'green') {
            consecutiveGreens++;
        } else {
            break;
        }
    }

    return (
      <div className="w-full max-w-sm bg-neutral-900 p-3 rounded-lg border border-neutral-800 my-4 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Triple Green Jackpot
            </h3>
            <div title="1% av alle innsatser går til potten. Treff 3x grønn på rad for å vinne. Potten deles mellom alle som satset i vinnerrunden.">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.134 0v-1.43zM11.567 7.151c.22.07.408.164.567.267v1.43a2.5 2.5 0 00-1.134 0V7.15z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3-5a3 3 0 006 0V7a3 3 0 10-6 0v6zm1.5-6.5a1.5 1.5 0 113 0v6a1.5 1.5 0 11-3 0v-6z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-400 text-3xl font-black">
                {amount.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <JackpotTile filled={consecutiveGreens >= 1} />
          <JackpotTile filled={consecutiveGreens >= 2} />
          <JackpotTile filled={consecutiveGreens >= 3} />
        </div>
      </div>
    );
  };


const RouletteGame: React.FC<RouletteGameProps> = ({ player, players, onBack, rouletteState, jackpotAmount, onPlaceBet, onClearBets }) => {
    const SPIN_ANIMATION_DURATION = 7000;
    const { phase, countdown, history, isSpecialRound, spinResultIndex, spinStartTime, restingIndex } = rouletteState;

    const [betAmount, setBetAmount] = useState(10);
    const totalBet = useMemo(() => player.rouletteBets.red + player.rouletteBets.black + player.rouletteBets.green, [player.rouletteBets]);
    const displayedCoins = player.coins - totalBet;

    const [message, setMessage] = useState('Plasser innsatsen din!');

    const wheelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tileWidth, setTileWidth] = useState(96);

    const NUMBER_OF_SETS = 20;
    const POCKETS_PER_SET = ROULETTE_POCKETS.length;
    const MIDDLE_SET_INDEX = Math.floor(NUMBER_OF_SETS / 2);

    const spinTiles = useMemo(() => {
        let list: ('red' | 'black' | 'green')[] = [];
        for (let i = 0; i < NUMBER_OF_SETS; i++) {
            list = list.concat(ROULETTE_POCKETS);
        }
        return list;
    }, []);

    const redBettors = players.filter(p => p.rouletteBets.red > 0);
    const totalRedBet = redBettors.reduce((sum, p) => sum + p.rouletteBets.red, 0);

    const blackBettors = players.filter(p => p.rouletteBets.black > 0);
    const totalBlackBet = blackBettors.reduce((sum, p) => sum + p.rouletteBets.black, 0);

    const greenBettors = players.filter(p => p.rouletteBets.green > 0);
    const totalGreenBet = greenBettors.reduce((sum, p) => sum + p.rouletteBets.green, 0);

    const adjustBetAmount = (amount: number) => {
        setBetAmount(prev => Math.max(0, prev + amount));
    };

    const handleClear = () => {
        setBetAmount(0);
        onClearBets();
    };

    // Effect to measure the tile width once the component is mounted
    useEffect(() => {
        if (wheelRef.current) {
            const firstChild = wheelRef.current.children[0] as HTMLElement;
            if (firstChild && firstChild.offsetWidth > 0 && firstChild.offsetWidth !== tileWidth) {
                setTileWidth(firstChild.offsetWidth);
            }
        }
    }, [wheelRef.current]);

    // Effect for handling the wheel animation logic
    useEffect(() => {
        const wheel = wheelRef.current;
        const container = containerRef.current;
        if (!wheel || !container || tileWidth === 0) return;

        const getTargetX = (index: number, cycles = 0) => {
            const containerWidth = container.offsetWidth;
            const offset = (containerWidth / 2) - (tileWidth / 2);
            const landingIndex = (MIDDLE_SET_INDEX + cycles) * POCKETS_PER_SET + index;
            return -(landingIndex * tileWidth) + offset;
        };

        if (phase === 'betting') {
            wheel.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            wheel.style.transform = `translateX(${getTargetX(restingIndex)}px)`;
        } else if (phase === 'spinning' && spinStartTime) {
            const elapsedTime = Date.now() - spinStartTime;
            
            if (elapsedTime >= SPIN_ANIMATION_DURATION) {
                wheel.style.transition = 'none';
                wheel.style.transform = `translateX(${getTargetX(spinResultIndex)}px)`;
                return;
            }
            
            const startX = getTargetX(restingIndex);
            const endX = getTargetX(spinResultIndex, 4);
            
            // Set start position instantly
            wheel.style.transition = 'none';
            wheel.style.transform = `translateX(${startX}px)`;

            // Force browser to apply the start position before animating
            void wheel.offsetHeight;

            // Start the animation with a negative delay to "catch up"
            wheel.style.transition = `transform ${SPIN_ANIMATION_DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
            wheel.style.transitionDelay = `-${elapsedTime}ms`;
            wheel.style.transform = `translateX(${endX}px)`;
        }

    }, [phase, spinStartTime, restingIndex, spinResultIndex, tileWidth]);

    // Effect for updating UI messages
    useEffect(() => {
        if (phase === 'betting') {
            const lastWinner = history[0];
            const netResult = player.lastRouletteNetResult;

            if (lastWinner && netResult !== null && netResult !== 0) {
                 if (netResult > 0) setMessage(`Gevinst! Du vant ${netResult.toLocaleString('nb-NO')} BC på ${lastWinner}.`);
                 else if (netResult < 0) setMessage(`Tap. Du tapte ${(-netResult).toLocaleString('nb-NO')} BC. Vinner: ${lastWinner}.`);
            } else if (countdown > 0 && countdown <= 3) {
                 setMessage(`Innsats stenger om ${countdown}...`);
            } else {
                 setMessage('Plasser innsatsen din!');
            }
        } else if (phase === 'spinning') {
            setMessage('Hjulet spinner...');
        }
    }, [phase, countdown, history, player.lastRouletteNetResult]);

    const handlePlaceBet = (color: 'red' | 'black' | 'green') => {
        if (phase !== 'betting' || betAmount <= 0) return;
        if (totalBet + betAmount > player.coins) {
            setMessage('Ikke nok BussCoins!');
            setTimeout(() => { if(phase === 'betting') setMessage('Plasser innsatsen din!') }, 2000);
            return;
        }
        onPlaceBet(color, betAmount);
    };

    const tileClasses = { red: 'bg-red-700', black: 'bg-neutral-800', green: 'bg-green-700' };

    return (
        <div className="flex flex-col items-center w-full animate-fade-in p-4">
            <div className="w-full max-w-sm text-left relative mb-2">
                <button onClick={onBack} className="text-neutral-400 hover:text-white transition p-2 -ml-2">&larr; Tilbake</button>
                <div className="absolute top-1/2 -translate-y-1/2 right-0 bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800 text-right">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 block leading-tight">Saldo</span>
                    <span className="text-xl font-extrabold text-white leading-tight">{displayedCoins}<span className="text-base ml-1 text-neutral-400">BC</span></span>
                </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Roulette</h2>
            <TripleGreenJackpot amount={jackpotAmount} history={history} />
             {isSpecialRound && <div className="w-full max-w-sm text-center bg-yellow-400 text-black font-bold p-2 rounded-md my-2 text-sm">⚠️ DOBBEL GRØNN! Neste er jackpot-runde!</div>}

            <div ref={containerRef} className="relative w-full h-24 overflow-hidden bg-neutral-950 rounded-xl shadow-inner select-none my-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-white z-10 opacity-75 pointer-events-none"></div>
                <div ref={wheelRef} className="flex h-full">
                    {spinTiles.map((color, i) => (
                        <div 
                           key={i} 
                           className={`flex-shrink-0 w-24 h-full flex items-center justify-center p-2 text-white border-r-4 border-black/20 ${tileClasses[color]}`}>
                          {color === 'green' ? <SpectacularBusIcon /> : <StandardBusIcon />}
                        </div>
                    ))}
                </div>
                 {phase === 'betting' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full w-24 h-24 flex flex-col items-center justify-center border-2 border-white/20">
                            <span className="text-5xl font-mono font-bold text-white leading-none">{countdown}</span>
                            <span className="text-xs uppercase tracking-widest text-neutral-400">Neste spinn</span>
                        </div>
                    </div>
                 )}
            </div>

            <div className="flex justify-center items-center gap-2 mb-4 h-6">
                <span className="text-xs uppercase text-neutral-500 mr-2">Siste:</span>
                {history.map((c, i) => <div key={i} className={`w-5 h-5 rounded-full ${tileClasses[c]}`}/>)}
            </div>

            <p className="text-lg font-bold h-6 mb-4">{message}</p>

            <div className="w-full max-w-xs space-y-3">
                 <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                    <label className="text-sm font-bold uppercase tracking-widest text-neutral-500">Innsatsbeløp</label>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        disabled={phase !== 'betting'}
                        className="w-full p-2 mt-2 text-center text-3xl font-bold bg-neutral-800 text-white placeholder-neutral-500 rounded-md border-2 border-neutral-700 focus:border-white focus:ring-white focus:outline-none transition"
                    />
                    <div className="grid grid-cols-4 gap-2 mt-3">
                        <button onClick={handleClear} disabled={phase !== 'betting'} className="p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 font-bold disabled:opacity-50">Tøm</button>
                        <button onClick={() => adjustBetAmount(1)} disabled={phase !== 'betting'} className="p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 font-bold disabled:opacity-50">+1</button>
                        <button onClick={() => adjustBetAmount(5)} disabled={phase !== 'betting'} className="p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 font-bold disabled:opacity-50">+5</button>
                        <button onClick={() => adjustBetAmount(10)} disabled={phase !== 'betting'} className="p-2 bg-neutral-700 rounded-md hover:bg-neutral-600 font-bold disabled:opacity-50">+10</button>
                    </div>
                    <button onClick={() => setBetAmount(displayedCoins)} disabled={phase !== 'betting'} className="w-full mt-2 p-2 bg-red-600 rounded-md hover:bg-red-500 font-bold disabled:opacity-50">All In</button>
                </div>
                
                <div className="grid grid-cols-3 gap-3 items-start">
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handlePlaceBet('red')} disabled={phase !== 'betting'} className="p-3 h-20 bg-red-600 rounded-md flex flex-col items-center justify-center disabled:opacity-50">
                            <span className="font-bold">Rød x2</span>
                            <span className="text-xs">{player.rouletteBets.red > 0 ? `${player.rouletteBets.red} BC` : '-'}</span>
                        </button>
                        <div className="bg-neutral-900 rounded-md p-2 text-center border border-neutral-800">
                            <p className="text-xs text-neutral-500 uppercase font-bold">Total</p>
                            <p className="font-bold text-white text-sm">{totalRedBet} BC</p>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {redBettors.map(p => (
                                <div key={p.id} className="bg-neutral-800 p-1.5 rounded text-xs flex justify-between items-center">
                                    <span className="flex items-center gap-1.5">
                                        <span role="img" aria-label={`Flagg for ${p.name}`}>{p.flag}</span>
                                        <span className="truncate max-w-[50px]">{p.name}</span>
                                    </span>
                                    <span className="font-bold">{p.rouletteBets.red}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handlePlaceBet('black')} disabled={phase !== 'betting'} className="p-3 h-20 bg-neutral-700 rounded-md flex flex-col items-center justify-center disabled:opacity-50">
                            <span className="font-bold">Svart x2</span>
                            <span className="text-xs">{player.rouletteBets.black > 0 ? `${player.rouletteBets.black} BC` : '-'}</span>
                        </button>
                         <div className="bg-neutral-900 rounded-md p-2 text-center border border-neutral-800">
                            <p className="text-xs text-neutral-500 uppercase font-bold">Total</p>
                            <p className="font-bold text-white text-sm">{totalBlackBet} BC</p>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {blackBettors.map(p => (
                                <div key={p.id} className="bg-neutral-800 p-1.5 rounded text-xs flex justify-between items-center">
                                    <span className="flex items-center gap-1.5">
                                        <span role="img" aria-label={`Flagg for ${p.name}`}>{p.flag}</span>
                                        <span className="truncate max-w-[50px]">{p.name}</span>
                                    </span>
                                    <span className="font-bold">{p.rouletteBets.black}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handlePlaceBet('green')} disabled={phase !== 'betting'} className="p-3 h-20 bg-green-600 rounded-md flex flex-col items-center justify-center disabled:opacity-50">
                            <span className="font-bold">Grønn x14</span>
                            <span className="text-xs">{player.rouletteBets.green > 0 ? `${player.rouletteBets.green} BC` : '-'}</span>
                        </button>
                        <div className="bg-neutral-900 rounded-md p-2 text-center border border-neutral-800">
                            <p className="text-xs text-neutral-500 uppercase font-bold">Total</p>
                            <p className="font-bold text-white text-sm">{totalGreenBet} BC</p>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {greenBettors.map(p => (
                                <div key={p.id} className="bg-neutral-800 p-1.5 rounded text-xs flex justify-between items-center">
                                    <span className="flex items-center gap-1.5">
                                        <span role="img" aria-label={`Flagg for ${p.name}`}>{p.flag}</span>
                                        <span className="truncate max-w-[50px]">{p.name}</span>
                                    </span>
                                    <span className="font-bold">{p.rouletteBets.green}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const GamblingView: React.FC<{
  player: Player;
  onUpdatePlayerCoins: (playerId: string, amount: number) => void;
  gameState: GameState;
  onPlaceRouletteBet: (playerId: string, color: 'red' | 'black' | 'green', amount: number) => void;
  onClearRouletteBets: (playerId: string) => void;
}> = ({ player, onUpdatePlayerCoins, gameState, onPlaceRouletteBet, onClearRouletteBets }) => {
    const [activeGame, setActiveGame] = useState<'selection' | 'coinflip' | 'roulette'>('selection');

    if (activeGame === 'coinflip') {
        return <CoinFlipGame player={player} onUpdatePlayerCoins={onUpdatePlayerCoins} onBack={() => setActiveGame('selection')} />;
    }

    if (activeGame === 'roulette') {
        return <RouletteGame 
                    player={player} 
                    players={gameState.players}
                    onUpdatePlayerCoins={onUpdatePlayerCoins} 
                    onBack={() => setActiveGame('selection')}
                    rouletteState={gameState.roulette}
                    jackpotAmount={gameState.tripleGreenJackpot}
                    onPlaceBet={(color, amount) => onPlaceRouletteBet(player.id, color, amount)}
                    onClearBets={() => onClearRouletteBets(player.id)}
                />;
    }

    return (
        <div className="animate-fade-in p-4">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Gambling</h2>
            <div className="space-y-4">
                <div 
                    onClick={() => setActiveGame('coinflip')}
                    className="bg-neutral-900 p-6 rounded-lg border border-neutral-800 cursor-pointer hover:border-white transition group"
                >
                    <h3 className="text-2xl font-bold text-white mb-1">Krone/Mynt</h3>
                    <p className="text-neutral-400">Enkel 50/50 sjanse. Doble innsatsen eller tap alt.</p>
                </div>
                 <div 
                    onClick={() => setActiveGame('roulette')}
                    className="bg-neutral-900 p-6 rounded-lg border border-neutral-800 cursor-pointer hover:border-white transition group"
                >
                    <h3 className="text-2xl font-bold text-white mb-1">Roulette</h3>
                    <p className="text-neutral-400">Sats på farge. Gå for trygg dobling eller sikt mot stjernene med x14 gevinst.</p>
                </div>
            </div>
        </div>
    );
};

export default GamblingView;