
import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Player, Tab, ShopItem, JackpotWinner, BonusGame, BeggarEncounter, FinaleGame } from '../types';
import BottomNav from './BottomNav';
import BankView from './BankView';
import ShopView from './ShopView';
import ScannerView from './ScannerView';
import { AdminIcon, AdminPanelIcon, itemIcons } from './icons/NavIcons';
import AdminPanel from './AdminPanel';
import GamblingView from './GamblingView';
import DiamondCardMapGame from './DiamondCardMapGame';
import BonusGameView from './BonusGameView';
import SuckersRoadCutscene from './SuckersRoadCutscene';
import FinaleGameView from './FinaleGameView';

const CONFETTI_COUNT = 200;

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) {
    return null;
  }

  const confetti = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 2 + 2}s`, // 2-4 seconds
      animationDelay: `${Math.random() * 0.5}s`,
      backgroundColor: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548'][Math.floor(Math.random() * 17)],
      transform: `rotate(${Math.random() * 360}deg)`,
    };
    return <div key={i} className="confetti-piece" style={style} />;
  });

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]">
        {confetti}
      </div>
      <style>{`
        @keyframes confetti-blast {
          0% {
            transform: translateY(110vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-20vh) rotate(720deg);
            opacity: 0;
          }
        }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 20px;
          opacity: 0;
          animation: confetti-blast cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </>
  );
};

const PurchaseAnimation: React.FC<{
  item: ShopItem;
  startRect: DOMRect;
  onAnimationEnd: () => void;
}> = ({ item, startRect, onAnimationEnd }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: startRect.top + startRect.height / 2,
    left: startRect.left + startRect.width / 2,
    transform: 'translate(-50%, -50%) scale(1)',
    transition: 'all 0.5s cubic-bezier(0.5, -0.5, 0.8, 0.5)',
    zIndex: 110,
    opacity: 1,
  });

  useEffect(() => {
    const bankIcon = document.querySelector('[data-testid="bank-nav-button"]');
    if (!bankIcon) {
      onAnimationEnd();
      return;
    }
    const endRect = bankIcon.getBoundingClientRect();

    const timeoutId = setTimeout(() => {
      setStyle(prevStyle => ({
        ...prevStyle,
        top: endRect.top + endRect.height / 2,
        left: endRect.left + endRect.width / 2,
        transform: 'translate(-50%, -50%) scale(0.1)',
        opacity: 0,
      }));
    }, 10);

    const animationEndTimeout = setTimeout(onAnimationEnd, 510);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(animationEndTimeout);
    };
  }, [onAnimationEnd]);

  const IconComponent = itemIcons[item.id] || (() => null);

  return (
    <div style={style} className="bg-neutral-800 p-3 rounded-md text-white border-2 border-white">
      <IconComponent className="w-8 h-8" />
    </div>
  );
};


const JackpotWinModal: React.FC<{
    winners: JackpotWinner[];
    currentPlayerId: string;
    onClose: () => void;
}> = ({ winners, currentPlayerId, onClose }) => {
    const myWinnings = winners.find(w => w.playerId === currentPlayerId);
    const otherWinners = winners.filter(w => w.playerId !== currentPlayerId);

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[101] p-4 animate-fade-in">
            <div className="bg-neutral-900 border-2 border-yellow-400 rounded-lg p-8 text-center shadow-2xl max-w-sm w-full">
                <h2 className="text-4xl font-bold text-yellow-400 mb-4">JACKPOT!</h2>
                {myWinnings && (
                    <div className="mb-6">
                        <p className="text-lg text-neutral-300">Du vant:</p>
                        <p className="text-5xl font-black text-white">{myWinnings.amount.toFixed(2)} BC</p>
                    </div>
                )}
                {otherWinners.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-neutral-300 mb-2 border-t border-neutral-700 pt-4">Andre vinnere:</h3>
                        <ul className="space-y-2 max-h-40 overflow-y-auto text-left pr-2">
                            {otherWinners.map((winner, index) => (
                                <li key={winner.playerId} className="flex items-center justify-between bg-neutral-800 p-2 rounded-md">
                                    <span className="flex items-center gap-2">
                                        <span className="font-bold text-neutral-400">{index + 1 + (myWinnings ? 1 : 0)}.</span>
                                        <span role="img" aria-label={`Flagg for ${winner.name}`}>{winner.flag}</span>
                                        <span className="text-white font-semibold truncate max-w-[100px]">{winner.name}</span>
                                    </span>
                                    <span className="font-bold text-yellow-500">{winner.amount.toFixed(2)} BC</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {!myWinnings && otherWinners.length === 0 && (
                    <p className="text-neutral-300 my-4">Ingen spillere hadde plassert innsats i denne runden. Jackpoten går videre!</p>
                )}
                <button
                    onClick={onClose}
                    className="mt-8 px-6 py-3 bg-white text-black font-bold rounded-md hover:bg-neutral-200 transition-all"
                >
                    Fantastisk!
                </button>
            </div>
        </div>
    );
};

const BeggarCutscene: React.FC<{
    encounter: BeggarEncounter;
    onChoice: (choice: 'give' | 'refuse') => void;
    onCloseEncounter: () => void;
}> = ({ encounter, onChoice, onCloseEncounter }) => {
    const [introPhase, setIntroPhase] = useState(true);
    const imageUrl = 'https://i.imgur.com/4OQwLtJ.png';

    const initialDialogues = useMemo(() => [
        `"Aaaa, vondt i huet mitt... kan jeg få <span class="font-bold">${encounter.demand} BC</span>?"`,
        `"Dere knullegutta... har ikke en liten en til meg? Trenger bare <span class="font-bold">${encounter.demand} BC</span>."`,
        `"Gutta... kan dere avse <span class="font-bold">${encounter.demand} BC</span> så jeg kan få kjøpt meg et snitt?"`
    ], [encounter.demand]);
    
    const [initialDialogue] = useState(() => initialDialogues[Math.floor(Math.random() * initialDialogues.length)]);
    const fullText = encounter.phase === 'demanding' ? initialDialogue : encounter.outcomeDialogue || '';

    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIntroPhase(false);
        }, 1800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!introPhase) {
            setDisplayText('');
            setIsTyping(true);
            let i = 0;
            const typingInterval = setInterval(() => {
                if (i >= fullText.length) {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                    return;
                }
                
                const char = fullText[i];
                if (char === '<') {
                    const closingTagIndex = fullText.indexOf('>', i);
                    if (closingTagIndex !== -1) {
                        const tag = fullText.substring(i, closingTagIndex + 1);
                        setDisplayText(prev => prev + tag);
                        i = closingTagIndex + 1;
                    } else {
                        setDisplayText(prev => prev + char);
                        i++;
                    }
                } else {
                    setDisplayText(prev => prev + char);
                    i++;
                }
            }, 30); // Typing speed

            return () => clearInterval(typingInterval);
        }
    }, [fullText, introPhase]);

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
             {introPhase ? (
                <div className="flex flex-col items-center animate-fade-in">
                    <style>{`
                        @keyframes blink {
                            0%, 100% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.3; transform: scale(0.95); }
                        }
                        .blinking-icon {
                            animation: blink 1.2s infinite ease-in-out;
                        }
                    `}</style>
                    <svg className="w-24 h-24 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] blinking-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <p className="mt-4 text-2xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', monospace", textShadow: '2px 2px #000' }}>
                        uh oh
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center pointer-events-auto w-full max-w-[456px] animate-fade-in">
                    {encounter.phase === 'responding' && encounter.outcomeDescription && (
                        <div className="mb-4 text-center animate-fade-in">
                            <svg className="w-16 h-16 mx-auto text-green-500 drop-shadow-[0_0_10px_rgba(74,222,128,0.7)] blinking-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                            </svg>
                            <p className="mt-2 text-xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', monospace", textShadow: '2px 2px #000' }}>
                                {encounter.outcomeDescription}
                            </p>
                        </div>
                    )}

                    <div
                        className="relative w-full drop-shadow-2xl"
                        style={{
                            aspectRatio: '456 / 256',
                        }}
                    >
                        <img 
                            src={imageUrl} 
                            alt="En gammel tigger" 
                            className="w-full h-full object-cover" 
                            style={{ imageRendering: 'pixelated' }} 
                        />
                        <div
                            className="absolute p-2"
                            style={{
                                fontFamily: "'Press Start 2P', monospace",
                                top: '8%',
                                left: '5%',
                                width: '65%',
                                height: '35%',
                            }}
                        >
                            <p 
                                className="text-black text-[10px] leading-tight" 
                                dangerouslySetInnerHTML={{ __html: displayText }}
                            />
                        </div>
                    </div>
                    
                    <div className={`flex gap-4 mt-2 transition-opacity duration-500 ${isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        {encounter.phase === 'demanding' && (
                          <>
                            <button
                                onClick={() => onChoice('give')}
                                className="px-5 py-2 bg-neutral-200 text-black border-2 border-t-white border-l-white border-r-black border-b-black hover:bg-white active:border-t-black active:border-l-black active:border-r-white active:border-b-white"
                                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}
                            >
                                Gi {encounter.demand} BC
                            </button>
                            <button
                                onClick={() => onChoice('refuse')}
                                className="px-5 py-2 bg-neutral-600 text-white border-2 border-t-neutral-500 border-l-neutral-500 border-r-neutral-800 border-b-neutral-800 hover:bg-neutral-500 active:border-t-neutral-800 active:border-l-neutral-800 active:border-r-neutral-500 active:border-b-neutral-500"
                                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}
                            >
                                Dra til helvete
                            </button>
                          </>
                        )}
                         {encounter.phase === 'responding' && (
                            <button
                                onClick={onCloseEncounter}
                                className="px-5 py-2 bg-neutral-200 text-black border-2 border-t-white border-l-white border-r-black border-b-black hover:bg-white active:border-t-black active:border-l-black active:border-r-white active:border-b-white"
                                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}
                            >
                                Lukk
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


interface GameProps {
  gameState: GameState;
  currentPlayer: Player;
  realPlayer: Player;
  onUpdatePlayerCoins: (playerId: string, value: number) => void;
  onBuyItem: (playerId: string, item: ShopItem) => void;
  onEndTurn: () => void;
  onUseItem: (sourcePlayerId: string, targetPlayerId: string | null, item: ShopItem) => void;
  onDismissAlert: () => void;
  onDismissJackpotAlert: () => void;
  onDismissJackpotWin: () => void;
  onForceSetTurn: (playerId: string) => void;
  onForceNextRound: () => void;
  onForceTripleGreenJackpot: () => void;
  onPlaceRouletteBet: (playerId: string, color: 'red' | 'black' | 'green', amount: number) => void;
  onClearRouletteBets: (playerId: string) => void;
  onFlipCard: (playerId: string, guess: 'red' | 'black', row: number, col: number) => void;
  onSetCurrentPlayer: (playerId: string) => void;
  onToggleForceRedCards: () => void;
  onToggleForceClubs3: () => void;
  onBonusGuess: (cardIndex: number, guess: 'red' | 'black') => void;
  onEndBonusGame: () => void;
  onPlaceMine: (row: number, col: number) => void;
  onCancelPlacingMine: () => void;
  onResolveBeggarChoice: (choice: 'give' | 'refuse') => void;
  onEndBeggarEncounter: () => void;
  onToggleForceBeggar: () => void;
  onFinalizeSuckersRoadUnlock: () => void;
  onFinaleGuess: (guess: 'red' | 'black') => void;
  onEndFinaleGame: () => void;
}

const Game: React.FC<GameProps> = (props) => {
  const { 
    gameState, currentPlayer, realPlayer, onBuyItem, onEndTurn, 
    onUseItem, onDismissAlert, onDismissJackpotAlert, onDismissJackpotWin, onForceSetTurn, 
    onForceNextRound, onForceTripleGreenJackpot, onPlaceRouletteBet, onClearRouletteBets, 
    onFlipCard, onSetCurrentPlayer, onToggleForceRedCards, onToggleForceClubs3, 
    onBonusGuess, onEndBonusGame, onPlaceMine, onCancelPlacingMine, onResolveBeggarChoice,
    onEndBeggarEncounter, onToggleForceBeggar, onUpdatePlayerCoins, onFinalizeSuckersRoadUnlock,
    onFinaleGuess, onEndFinaleGame
  } = props;
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Bank);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [purchasedItemAnimation, setPurchasedItemAnimation] = useState<{ item: ShopItem; startRect: DOMRect } | null>(null);

  const isMyTurn = currentPlayer.id === gameState.turnPlayerId;
  const isAdmin = realPlayer.id === gameState.adminId;
  
  const handleTakeMeToGambling = () => {
    setActiveTab(Tab.Gambling);
    onDismissJackpotAlert();
  };

  const handleUseItem = (sourcePlayerId: string, targetPlayerId: string | null, item: ShopItem) => {
    if (item.id === 'weapon-landmine') {
      setActiveTab(Tab.Spill);
    }
    onUseItem(sourcePlayerId, targetPlayerId, item);
  };
  
  const handleBuyItemWithAnimation = (playerId: string, item: ShopItem, startRect: DOMRect) => {
    onBuyItem(playerId, item);
    setPurchasedItemAnimation({ item, startRect });
  };


  const renderContent = () => {
    switch (activeTab) {
      case Tab.Bank:
        return <BankView player={currentPlayer} players={gameState.players} stocks={gameState.stocks} onUseItem={handleUseItem} />;
      case Tab.Shop:
        return <ShopView player={currentPlayer} onBuyItem={handleBuyItemWithAnimation} round={gameState.round} gameState={gameState} />;
      case Tab.Spill:
        return <DiamondCardMapGame 
                    gameState={gameState} 
                    currentPlayer={currentPlayer} 
                    onFlipCard={onFlipCard} 
                    onPlaceMine={onPlaceMine}
                    onCancelPlacingMine={onCancelPlacingMine}
                />;
      case Tab.Scanner:
        return <ScannerView player={currentPlayer} onScanCard={onUpdatePlayerCoins} />;
      case Tab.Gambling:
        return <GamblingView player={currentPlayer} onUpdatePlayerCoins={onUpdatePlayerCoins} gameState={gameState} onPlaceRouletteBet={onPlaceRouletteBet} onClearRouletteBets={onClearRouletteBets} />;
      default:
        return <BankView player={currentPlayer} players={gameState.players} stocks={gameState.stocks} onUseItem={handleUseItem}/>;
    }
  };
  
  const turnPlayer = gameState.players.find(p => p.id === gameState.turnPlayerId);
  const isAdminTurn = turnPlayer?.id === gameState.adminId;
  const isBonusGameActive = gameState.bonusGame?.isActive;
  const isBeggarEncounterActive = !!gameState.beggarEncounter;
  const isBonusGameForCurrentPlayer = isBonusGameActive && gameState.bonusGame!.playerId === currentPlayer.id;
  const bonusGamePlayerName = isBonusGameActive ? gameState.players.find(p => p.id === gameState.bonusGame!.playerId)?.name : null;


  return (
    <div className="flex flex-col h-full relative">
      <header className="relative p-4 bg-black/50 backdrop-blur-sm border-b border-neutral-800 text-center">
        {isAdmin && (
            <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="absolute top-1/2 -translate-y-1/2 left-4 text-neutral-500 hover:text-white transition-colors"
                aria-label="Åpne adminpanel"
            >
                <AdminPanelIcon className="w-6 h-6" />
            </button>
        )}
        <h1 className="text-xl font-bold text-white">Spillkode: {gameState.id}</h1>
        <div className="text-sm text-neutral-400 flex items-center justify-center gap-x-3 gap-y-1 flex-wrap">
            <span>Runde: <span className="font-bold text-white">{gameState.round}</span></span>
            <span className="text-neutral-600">|</span>
            <span className="flex items-center">På tur:
                <span className="font-bold text-white flex items-center gap-1.5 ml-1.5">
                  <span role="img" aria-label={`Flagg for ${turnPlayer?.name}`}>{turnPlayer?.flag}</span>
                  {turnPlayer?.name || 'Ukjent'}
                </span>
                {isAdminTurn && <AdminIcon className="w-4 h-4 text-red-500 ml-1.5" />}
            </span>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-4">
          {isMyTurn && !gameState.winnerId && !isBonusGameForCurrentPlayer && gameState.placingMineForPlayerId !== currentPlayer.id && (
              <button
                  onClick={onEndTurn}
                  disabled={isBeggarEncounterActive}
                  className="px-3 py-2 bg-red-600 text-white font-bold text-xs rounded-md hover:bg-red-700 transition-all duration-300 disabled:bg-neutral-700 disabled:cursor-not-allowed"
              >
                  Avslutt Tur
              </button>
          )}
        </div>
      </header>
      <main className="flex-grow overflow-y-auto p-4 bg-black">
        {renderContent()}
      </main>
      {!isMyTurn && turnPlayer && !gameState.winnerId && (
        <div className="p-3 text-center text-neutral-400 bg-black border-t border-neutral-800 animate-pulse">
          Venter på <span className="font-bold text-white flex items-center gap-1.5 justify-center">{turnPlayer.flag} {turnPlayer.name}</span>...
        </div>
      )}
      <footer className="sticky bottom-0">
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>
       {purchasedItemAnimation && (
        <PurchaseAnimation
          item={purchasedItemAnimation.item}
          startRect={purchasedItemAnimation.startRect}
          onAnimationEnd={() => setPurchasedItemAnimation(null)}
        />
      )}
      {gameState.activeAlert && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Hendelse!</h2>
                <p className="text-neutral-200 text-lg mb-6">{gameState.activeAlert}</p>
                <button
                    onClick={onDismissAlert}
                    className="px-6 py-2 bg-white text-black font-bold rounded-md hover:bg-neutral-200 transition-all"
                >
                    Lukk
                </button>
            </div>
        </div>
      )}
       {gameState.isJackpotImminent && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-neutral-900 border-2 border-green-500 rounded-lg p-8 text-center shadow-2xl">
                <h2 className="text-3xl font-bold text-green-400 mb-4 animate-pulse">JACKPOT-RUNDE!</h2>
                <p className="text-neutral-200 text-lg mb-6">Neste spinn kan utløse Triple Green Jackpot!</p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onDismissJackpotAlert}
                        className="px-6 py-3 bg-neutral-700 text-white font-bold rounded-md hover:bg-neutral-600 transition-all"
                    >
                        Lukk
                    </button>
                    <button
                        onClick={handleTakeMeToGambling}
                        className="px-6 py-3 bg-green-500 text-black font-bold rounded-md hover:bg-green-400 transition-all"
                    >
                        Ta meg dit!
                    </button>
                </div>
            </div>
        </div>
      )}
      <Confetti active={gameState.jackpotJustWon} />
      {gameState.jackpotJustWon && gameState.jackpotWinners && (
          <JackpotWinModal 
            winners={gameState.jackpotWinners}
            currentPlayerId={currentPlayer.id}
            onClose={onDismissJackpotWin}
          />
      )}
      {isAdminPanelOpen && (
        <AdminPanel
            players={gameState.players}
            currentTurnPlayerId={gameState.turnPlayerId}
            currentPlayerId={currentPlayer.id}
            onClose={() => setIsAdminPanelOpen(false)}
            onForceSetTurn={onForceSetTurn}
            onForceNextRound={onForceNextRound}
            onForceTripleGreenJackpot={onForceTripleGreenJackpot}
            isJackpotForcing={gameState.roulette.forcedResults.length > 0}
            onSetCurrentPlayer={onSetCurrentPlayer}
            onToggleForceRedCards={onToggleForceRedCards}
            isForcingRedCards={gameState.forceRedCards}
            onToggleForceClubs3={onToggleForceClubs3}
            isForcingClubs3={gameState.forceClubs3}
            onToggleForceBeggar={onToggleForceBeggar}
            isForcingBeggar={gameState.forceBeggar}
        />
      )}
      {isBonusGameActive && gameState.bonusGame && (
        <BonusGameView 
            bonusGame={gameState.bonusGame}
            currentPlayer={currentPlayer}
            bonusGamePlayerName={bonusGamePlayerName || 'Spilleren'}
            onGuess={onBonusGuess} 
            onEnd={onEndBonusGame}
        />
      )}
      {gameState.beggarEncounter && gameState.beggarEncounter.playerId === currentPlayer.id && (
        <BeggarCutscene
            encounter={gameState.beggarEncounter}
            onChoice={onResolveBeggarChoice}
            onCloseEncounter={onEndBeggarEncounter}
        />
      )}
      {gameState.justUnlockedSuckersRoad && (
        <SuckersRoadCutscene onFinished={onFinalizeSuckersRoadUnlock} />
      )}
      {gameState.finaleGame?.isActive && (
        <FinaleGameView
            finaleGame={gameState.finaleGame}
            currentPlayer={currentPlayer}
            onGuess={onFinaleGuess}
            onEnd={onEndFinaleGame}
        />
      )}
    </div>
  );
};

export default Game;