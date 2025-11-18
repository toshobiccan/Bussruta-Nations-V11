
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Stock, ShopItem, GameStatus, JackpotWinner, Card, BonusCard, Landmine, BonusGame, BeggarEncounter, FinaleGame } from './types';
import { INITIAL_STOCKS, INITIAL_SHOP_ITEMS, GAME_CODE_LENGTH, FLAGS, ROULETTE_POCKETS, createDeck, MAP_LAYOUT_DIAMOND, MAP_LAYOUT_LOCKED, MAP_LAYOUT_SUCKERS_ROAD } from './constants';
import Lobby from './components/Lobby';
import Game from './components/Game';
import PreGameLobby from './components/PreGameLobby';

const ROULETTE_ROUND_DURATION = 11;
const ROULETTE_SPECIAL_ROUND_DURATION = 60;
const ROULETTE_SPIN_DURATION_MS = 7000;
const ROULETTE_POST_SPIN_DELAY_MS = 3000;
const JACKPOT_INITIAL_AMOUNT = 0;
const JACKPOT_CONTRIBUTION_RATE = 0.01;
const BEGGAR_ENCOUNTER_CHANCE = 0.05;

const updateBoardForSuckersRoad = (deck: Card[], boardCards: (Card | null)[][], boardFlipped: boolean[][]) => {
    const newDeck = [...deck];
    const newBoardCards = boardCards.map(r => [...r]);
    const newBoardFlipped = boardFlipped.map(r => [...r]);
    
    const oldBoard = MAP_LAYOUT_LOCKED.board;
    const newBoard = MAP_LAYOUT_SUCKERS_ROAD.board;

    for (let r = 0; r < newBoard.length; r++) {
        for (let c = 0; c < newBoard[r].length; c++) {
            const oldTile = oldBoard[r]?.[c];
            const newTile = newBoard[r]?.[c];
            
            // If a tile changed from non-path to path (e.g., skog -> N)
            if (newTile && (newTile.startsWith('N') || newTile === 'X') && (!oldTile || (!oldTile.startsWith('N') && oldTile !== 'X'))) {
                if (newDeck.length === 0) {
                    newDeck.push(...createDeck());
                }
                newBoardCards[r][c] = newDeck.pop()!;
                newBoardFlipped[r][c] = false;
            }
        }
    }
    return { deck: newDeck, boardCards: newBoardCards, boardFlipped: newBoardFlipped };
};

const resetPlayerPathTiles = (
    player: Player,
    state: GameState,
    itemUsed: 'billettkontroll' | 'nuke'
): Pick<GameState, 'deck' | 'boardCards' | 'boardFlipped'> => {
    const { deck, boardCards, boardFlipped, suckersRoadUnlocked } = state;
    
    const oldPosition = player.position;
    const newPosition = itemUsed === 'nuke' ? 0 : Math.max(0, oldPosition - 1);

    if (oldPosition <= newPosition) {
        return { deck, boardCards, boardFlipped };
    }

    const coordsToReset: { row: number, col: number }[] = [];
    
    let playerPath: {row: number, col: number}[] | undefined;
    if (player.isOnSuckersRoad) {
        playerPath = MAP_LAYOUT_SUCKERS_ROAD.paths.suckers;
    } else if (player.startDirection) {
        playerPath = MAP_LAYOUT_SUCKERS_ROAD.paths[player.startDirection];
    }

    if (!playerPath) {
        return { deck, boardCards, boardFlipped };
    }

    const isNorthSouth = !player.isOnSuckersRoad && (player.startDirection === 'north' || player.startDirection === 'south');
    const boardLayout = suckersRoadUnlocked ? MAP_LAYOUT_SUCKERS_ROAD.board : MAP_LAYOUT_LOCKED.board;

    // Iterate through the path indices that the player is vacating
    for (let i = newPosition; i < oldPosition; i++) {
        const levelPathCoord = playerPath[i];
        if (!levelPathCoord) continue;

        if (player.isOnSuckersRoad) {
            // Suckers Road is a linear path, just check the specific card at this position
            if (boardFlipped[levelPathCoord.row][levelPathCoord.col]) {
                coordsToReset.push(levelPathCoord);
            }
        } else {
            // Main board paths are level-based (all cards on a row/col are selectable)
            const targetLevel = isNorthSouth ? levelPathCoord.row : levelPathCoord.col;

            // Find any flipped card on that level
            for (let r = 0; r < boardLayout.length; r++) {
                for (let c = 0; c < boardLayout[r].length; c++) {
                    const currentCardLevel = isNorthSouth ? r : c;
                    if (currentCardLevel === targetLevel && boardFlipped[r][c]) {
                        // Ensure it's a path tile before resetting
                        const tileType = boardLayout[r][c];
                        if (tileType && (tileType.startsWith('N') || tileType === 'X')) {
                            coordsToReset.push({ row: r, col: c });
                        }
                    }
                }
            }
        }
    }

    if (coordsToReset.length === 0) {
        return { deck, boardCards, boardFlipped };
    }

    const newDeck = [...deck];
    const newBoardCards = boardCards.map(r => [...r]);
    const newBoardFlipped = boardFlipped.map(r => [...r]);
    const collectedOldCards: Card[] = [];

    // Use a Set to avoid resetting the same card multiple times if logic overlaps
    const uniqueCoords = Array.from(new Set(coordsToReset.map(c => `${c.row},${c.col}`)))
        .map(s => {
            const [row, col] = s.split(',').map(Number);
            return { row, col };
        });

    uniqueCoords.forEach(({ row, col }) => {
        const oldCard = newBoardCards[row][col];
        if (oldCard) {
            collectedOldCards.push(oldCard);
        }
        newBoardFlipped[row][col] = false;
    });

    newDeck.push(...collectedOldCards);
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    uniqueCoords.forEach(({ row, col }) => {
        if (newDeck.length === 0) {
            newDeck.push(...createDeck());
        }
        const newCardForBoard = newDeck.pop()!;
        newBoardCards[row][col] = newCardForBoard;
    });
    
    return {
        deck: newDeck,
        boardCards: newBoardCards,
        boardFlipped: newBoardFlipped,
    };
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [realPlayerId, setRealPlayerId] = useState<string | null>(null);

  const createGame = useCallback((playerName: string) => {
    const newPlayerId = `player-${Date.now()}`;
    const randomFlag = FLAGS[Math.floor(Math.random() * FLAGS.length)];
    const newPlayer: Player = {
      id: newPlayerId,
      name: playerName,
      coins: 50,
      stocks: {},
      inventory: {},
      flag: randomFlag,
      rouletteBets: { red: 0, black: 0, green: 0 },
      lastRouletteNetResult: null,
      position: 0,
      isOnSuckersRoad: false,
    };

    const gameId = Math.random().toString(36).substring(2, 2 + GAME_CODE_LENGTH).toUpperCase();
    const newGameState: GameState = {
      id: gameId,
      players: [newPlayer],
      stocks: INITIAL_STOCKS.map(s => ({...s})),
      turnPlayerId: newPlayerId,
      adminId: newPlayerId,
      activeAlert: null,
      status: GameStatus.WAITING,
      round: 0,
      roulette: {
        phase: 'betting',
        countdown: ROULETTE_ROUND_DURATION,
        history: [],
        isSpecialRound: false,
        lastWinningColor: null,
        spinResultIndex: 0,
        spinStartTime: null,
        restingIndex: 0,
        forcedResults: [],
      },
      tripleGreenJackpot: JACKPOT_INITIAL_AMOUNT,
      isJackpotImminent: false,
      jackpotJustWon: false,
      jackpotWinners: null,
      deck: [],
      boardCards: [],
      boardFlipped: [],
      currentCard: null,
      lastCardFlipResult: null,
      lastFlippedCardCoords: null,
      winnerId: null,
      trolley: { position: 0, playerIds: [] },
      suckersRoadUnlocked: false,
      suckersRoadItemAvailable: true,
      forceRedCards: false,
      forceClubs3: false,
      bonusGame: null,
      landmines: [],
      placingMineForPlayerId: null,
      explodedMines: [],
      beggarEncounter: null,
      forceBeggar: false,
      justUnlockedSuckersRoad: false,
      suckersRoadCutsceneInfo: null,
      finaleGame: null,
    };
    setGameState(newGameState);
    setCurrentPlayerId(newPlayerId);
    setRealPlayerId(newPlayerId);
  }, []);
  
  const addPlayer = useCallback((playerName: string) => {
    setGameState(prev => {
        if (!prev || prev.status !== GameStatus.WAITING) return prev;
        
        const usedFlags = prev.players.map(p => p.flag);
        const availableFlags = FLAGS.filter(f => !usedFlags.includes(f));
        const flagPool = availableFlags.length > 0 ? availableFlags : FLAGS;
        const randomFlag = flagPool[Math.floor(Math.random() * flagPool.length)];

        const newPlayer: Player = {
          id: `player-${Date.now()}`,
          name: playerName,
          coins: 50,
          stocks: {},
          inventory: {},
          flag: randomFlag,
          rouletteBets: { red: 0, black: 0, green: 0 },
          lastRouletteNetResult: null,
          position: 0,
          isOnSuckersRoad: false,
        };
        
        return {
            ...prev,
            players: [...prev.players, newPlayer]
        };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => {
        if (!prev) return prev;
        
        if (prev.players.length !== 4) {
            alert("Spillet krever nøyaktig 4 nasjoner for å starte kart-modusen.");
            return prev;
        }

        const directions: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        const updatedPlayers = prev.players.map((player, index) => ({
            ...player,
            startDirection: directions[index],
        }));

        const shuffledDeck = createDeck();
        const initialBoard = MAP_LAYOUT_LOCKED.board;
        const boardCards: (Card | null)[][] = initialBoard.map(row => row.map(() => null));
        const boardFlipped: boolean[][] = initialBoard.map(row => row.map(() => false));

        initialBoard.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell && (cell.startsWith('N') || cell === 'X' || cell === 'BONUS' || cell === 'MEGABONUS')) { // If it's a valid tile
                    if (shuffledDeck.length === 0) {
                        shuffledDeck.push(...createDeck());
                    }
                    boardCards[r][c] = shuffledDeck.pop()!;
                }
            });
        });
        
        return {
            ...prev,
            status: GameStatus.ACTIVE,
            round: 1,
            players: updatedPlayers,
            deck: shuffledDeck,
            boardCards,
            boardFlipped,
        }
    });
  }, []);


  const updatePlayerCoins = useCallback((playerId: string, amount: number) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        players: prev.players.map(p => p.id === playerId ? {...p, coins: p.coins + amount} : p)
      };
    });
  }, []);

  const buyShopItem = useCallback((playerId: string, item: ShopItem) => {
    setGameState(prev => {
      if (!prev) return null;
      const player = prev.players.find(p => p.id === playerId);
      if (!player || player.coins < item.price) {
        alert("Ikke nok BussCoins!");
        return prev;
      }
      
      const updatedPlayers = prev.players.map(p => {
        if (p.id === playerId) {
          const newInventory = {...p.inventory};
          newInventory[item.id] = (newInventory[item.id] || 0) + 1;
          return {...p, coins: p.coins - item.price, inventory: newInventory};
        }
        return p;
      });

      const finalState: GameState = {
        ...prev,
        players: updatedPlayers,
      };

      if (item.id === 'weapon-suckers-road') {
        finalState.suckersRoadItemAvailable = false;
      }

      return finalState;
    });
  }, []);
  
  const useItem = useCallback((sourcePlayerId: string, targetPlayerId: string | null, item: ShopItem) => {
    setGameState(prev => {
        if (!prev) return null;
        
        const sourcePlayer = prev.players.find(p => p.id === sourcePlayerId);
        if (!sourcePlayer || (sourcePlayer.inventory[item.id] || 0) < 1) {
            return prev;
        }

        const targetPlayer = prev.players.find(p => p.id === targetPlayerId);

        if (item.requiresTarget && !targetPlayer) {
            return prev;
        }
        
        if (item.id === 'weapon-landmine') {
            return {
                ...prev,
                placingMineForPlayerId: sourcePlayerId,
            };
        }

        let alertMessage = '';
        let playersAfterEffect = [...prev.players];
        let boardUpdates: Partial<Pick<GameState, 'deck' | 'boardCards' | 'boardFlipped'>> = {};

        switch (item.id) {
            case 'weapon-billettkontroll':
                if (targetPlayer) {
                     if (targetPlayer.position > 0 && (targetPlayer.startDirection || targetPlayer.isOnSuckersRoad)) {
                        alertMessage = `${sourcePlayer.name} brukte Billettkontroll på ${targetPlayer.name}! ${targetPlayer.name} må ta 1 steg bakover.`;
                        boardUpdates = resetPlayerPathTiles(targetPlayer, prev, 'billettkontroll');
                        playersAfterEffect = playersAfterEffect.map(p => 
                            p.id === targetPlayerId ? { ...p, position: p.position - 1 } : p
                        );
                    } else {
                        alertMessage = `${targetPlayer.name} er ved start og kan ikke flyttes. Billettkontrollen ble ikke brukt.`;
                        return { ...prev, activeAlert: alertMessage };
                    }
                }
                break;
            case 'weapon-nuke':
                 if (targetPlayer) {
                    alertMessage = `${sourcePlayer.name} brukte Nuke på ${targetPlayer.name}! ${targetPlayer.name} sendes tilbake til start.`;
                    if (targetPlayer.position > 0 && (targetPlayer.startDirection || targetPlayer.isOnSuckersRoad)) {
                        boardUpdates = resetPlayerPathTiles(targetPlayer, prev, 'nuke');
                    }
                     playersAfterEffect = playersAfterEffect.map(p => 
                        p.id === targetPlayerId ? { ...p, position: 0 } : p
                    );
                }
                break;
            case 'weapon-suckers-road':
                if (targetPlayer) {
                    // This is now a two-step process. First, trigger the cutscene.
                    playersAfterEffect = playersAfterEffect.map(p => {
                        if (p.id === targetPlayerId) {
                            const originalDirection = p.isOnSuckersRoad ? p.originalStartDirection : p.startDirection;
                            return {
                                ...p,
                                isOnSuckersRoad: true,
                                position: 0,
                                originalStartDirection: originalDirection,
                                startDirection: undefined,
                            };
                        }
                        return p;
                    });

                    const finalPlayers = playersAfterEffect.map(p => {
                        if (p.id === sourcePlayerId) {
                            const newInventory = { ...p.inventory };
                            newInventory[item.id] -= 1;
                            if (newInventory[item.id] === 0) delete newInventory[item.id];
                            return { ...p, inventory: newInventory };
                        }
                        return p;
                    });
                    
                    return {
                        ...prev,
                        players: finalPlayers,
                        justUnlockedSuckersRoad: true,
                        suckersRoadItemAvailable: false,
                        suckersRoadCutsceneInfo: {
                            sourcePlayerName: sourcePlayer.name,
                            targetPlayerName: targetPlayer.name,
                        },
                    };
                }
                break;
            case 'powerup-rontgenbriller':
                alertMessage = `${sourcePlayer.name} aktiverte Røntgenbriller! Effekten skjer i den virkelige verden...`;
                break;
            default:
                console.warn(`Attempted to use unhandled item: ${item.id}`);
                return prev;
        }
        
        if (!alertMessage) {
            return prev;
        }

        const finalPlayers = playersAfterEffect.map(p => {
            if (p.id === sourcePlayerId) {
                const newInventory = { ...p.inventory };
                newInventory[item.id] -= 1;
                if (newInventory[item.id] === 0) {
                    delete newInventory[item.id];
                }
                return { ...p, inventory: newInventory };
            }
            return p;
        });
        
        const finalState: Partial<GameState> = {
            ...boardUpdates,
            players: finalPlayers,
            activeAlert: alertMessage,
        };
        
        return { ...prev, ...finalState };
    });
  }, []);

  const finalizeSuckersRoadUnlock = useCallback(() => {
    setGameState(prev => {
        if (!prev || !prev.suckersRoadCutsceneInfo) return { ...prev, justUnlockedSuckersRoad: false, suckersRoadCutsceneInfo: null };

        const { sourcePlayerName, targetPlayerName } = prev.suckersRoadCutsceneInfo;
        
        let deckAfterReset = [...prev.deck];
        let boardCardsAfterReset = prev.boardCards.map(r => [...r]);
        let boardFlippedAfterReset = prev.boardFlipped.map(r => [...r]);
        
        const targetPlayer = prev.players.find(p => p.name === targetPlayerName);
        if (targetPlayer) {
            const cardsToResetCoords: {row: number, col: number}[] = [];
            const pathIdentifier = targetPlayer.originalStartDirection;

            // Find all cards on their original path to reset them.
            if (pathIdentifier && targetPlayer.position > 0) {
                 const playerPath = MAP_LAYOUT_SUCKERS_ROAD.paths[pathIdentifier];
                 for (let i = 0; i < playerPath.length; i++) {
                     const tileCoords = playerPath[i];
                     if (tileCoords) {
                         cardsToResetCoords.push(tileCoords);
                     }
                 }
            }
            
            if (cardsToResetCoords.length > 0) {
                const oldCards: Card[] = [];
                cardsToResetCoords.forEach(({ row, col }) => {
                    if (boardFlippedAfterReset[row][col]) {
                        boardFlippedAfterReset[row][col] = false;
                        const oldCard = boardCardsAfterReset[row][col];
                        if (oldCard) oldCards.push(oldCard);
                    }
                });

                deckAfterReset.push(...oldCards);
                for (let i = deckAfterReset.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [deckAfterReset[i], deckAfterReset[j]] = [deckAfterReset[j], deckAfterReset[i]];
                }
                
                cardsToResetCoords.forEach(({ row, col }) => {
                     const oldCard = boardCardsAfterReset[row][col];
                     if (oldCards.includes(oldCard!)) {
                        if (deckAfterReset.length === 0) deckAfterReset.push(...createDeck());
                        const newCard = deckAfterReset.pop()!;
                        boardCardsAfterReset[row][col] = newCard;
                     }
                });
            }
        }
        
        const { deck, boardCards, boardFlipped } = updateBoardForSuckersRoad(deckAfterReset, boardCardsAfterReset, boardFlippedAfterReset);
        const alertMessage = `${sourcePlayerName} sendte ${targetPlayerName} til Suckers Road®! All progresjon på den gamle veien er nullstilt.`;
        
        return {
            ...prev,
            deck,
            boardCards,
            boardFlipped,
            suckersRoadUnlocked: true,
            justUnlockedSuckersRoad: false,
            suckersRoadCutsceneInfo: null,
            activeAlert: alertMessage,
        };
    });
  }, []);

const placeMine = useCallback((row: number, col: number) => {
    setGameState(prev => {
        if (!prev || !prev.placingMineForPlayerId) return prev;
        
        const placerId = prev.placingMineForPlayerId;
        const player = prev.players.find(p => p.id === placerId);
        if (!player) return prev;

        const newLandmine: Landmine = { row, col, ownerId: placerId };

        const newInventory = { ...player.inventory };
        newInventory['weapon-landmine'] = (newInventory['weapon-landmine'] || 1) - 1;
        if (newInventory['weapon-landmine'] <= 0) {
            delete newInventory['weapon-landmine'];
        }

        return {
            ...prev,
            landmines: [...prev.landmines, newLandmine],
            placingMineForPlayerId: null,
            players: prev.players.map(p => p.id === placerId ? { ...p, inventory: newInventory } : p),
        };
    });
}, []);

const cancelPlacingMine = useCallback(() => {
    setGameState(prev => {
        if (!prev || !prev.placingMineForPlayerId) return prev;
        return {
            ...prev,
            placingMineForPlayerId: null,
            activeAlert: 'Plassering av landmine avbrutt.',
        };
    });
}, []);
  
  const dismissAlert = useCallback(() => {
      setGameState(prev => {
        if (!prev) return null;
        return {...prev, activeAlert: null };
      });
  }, []);
  
  const dismissJackpotAlert = useCallback(() => {
      setGameState(prev => prev ? {...prev, isJackpotImminent: false} : null);
  }, []);

  const dismissJackpotWin = useCallback(() => {
    setGameState(prev => prev ? { ...prev, jackpotJustWon: false, jackpotWinners: null } : null);
  }, []);

  const flipCard = useCallback((playerId: string, guess: 'red' | 'black', row: number, col: number) => {
    setGameState(prev => {
        if (!prev || prev.turnPlayerId !== playerId || prev.winnerId || prev.currentCard) return prev;

        const player = prev.players.find(p => p.id === playerId);
        if (!player || (!player.startDirection && !player.isOnSuckersRoad)) return prev;

        // Fix: Changed cardToFlip to let to allow reassignment for forced cards.
        let cardToFlip = prev.boardCards[row][col];
        const isAlreadyFlipped = prev.boardFlipped[row][col];

        if (!cardToFlip || isAlreadyFlipped) return prev;
        
        const boardLayout = prev.suckersRoadUnlocked ? MAP_LAYOUT_SUCKERS_ROAD.board : MAP_LAYOUT_LOCKED.board;
        const isWinningTile = boardLayout[row][col] === 'X';

        // --- WINNING TILE: TRIGGER FINALE ---
        if (isWinningTile) {
            const newBoardFlipped = prev.boardFlipped.map(r => [...r]);
            newBoardFlipped[row][col] = true;

            // Player gets coins just for reaching the finale
            const coinValue = cardToFlip.value;
            const updatedPlayers = prev.players.map(p =>
                p.id === playerId ? { ...p, coins: p.coins + coinValue } : p
            );
            
            const newFinaleGame: FinaleGame = {
                isActive: true,
                playerId: player.id,
                card: cardToFlip,
                phase: 'intro',
            };

            setTimeout(() => {
                setGameState(current => {
                    if (!current || !current.finaleGame || current.finaleGame.phase !== 'intro') return current;
                    return { ...current, finaleGame: { ...current.finaleGame, phase: 'guessing' }};
                });
            }, 3000); // 3 seconds for intro animation

            return {
                ...prev,
                players: updatedPlayers,
                boardFlipped: newBoardFlipped,
                finaleGame: newFinaleGame,
                currentCard: null,
                lastCardFlipResult: null,
                lastFlippedCardCoords: { row, col },
            };
        }

        // --- BEGGAR ENCOUNTER CHECK ---
        const triggerBeggar = prev.forceBeggar || (!prev.winnerId && !prev.bonusGame && !prev.activeAlert && Math.random() < BEGGAR_ENCOUNTER_CHANCE);
        if (triggerBeggar) {
            const demand = Math.floor(Math.random() * 11) + 5; // Demands 5-15 BC
            return {
                ...prev,
                beggarEncounter: {
                    playerId: playerId,
                    demand: demand,
                    phase: 'demanding',
                },
                forceBeggar: false,
                currentCard: null,
                lastCardFlipResult: null,
                lastFlippedCardCoords: null,
            };
        }
        
        // --- Landmine Check ---
        const mineIndex = prev.landmines.findIndex(m => m.row === row && m.col === col);
        if (mineIndex !== -1) {
            const victimPlayer = prev.players.find(p => p.id === playerId);
            let playersAfterEffect = [...prev.players];
            let boardUpdates: Partial<Pick<GameState, 'deck' | 'boardCards' | 'boardFlipped'>> = {};

            if (victimPlayer) {
                if (victimPlayer.position > 0) {
                     boardUpdates = resetPlayerPathTiles(victimPlayer, prev, 'billettkontroll');
                     playersAfterEffect = playersAfterEffect.map(p =>
                        p.id === playerId ? { ...p, position: p.position - 1 } : p
                    );
                }
                // If position is 0, they don't move back, but the turn ends.
                // The card they flipped (with the mine) will be shown, but on next turn it should be playable again.
                // We need to ensure the card is NOT permanently flipped.
            }
            
            const newBoardFlipped = (boardUpdates.boardFlipped || prev.boardFlipped).map(r => [...r]);
            newBoardFlipped[row][col] = true;
            boardUpdates.boardFlipped = newBoardFlipped;
            
            const newExplodedMines = [...prev.explodedMines, { row, col }];

            return {
                ...prev,
                ...boardUpdates,
                players: playersAfterEffect,
                landmines: prev.landmines.filter((_, i) => i !== mineIndex),
                explodedMines: newExplodedMines,
                currentCard: cardToFlip,
                lastCardFlipResult: { correct: false, stepsMoved: 0, coinValue: 0, explosion: true },
                lastFlippedCardCoords: { row, col },
                activeAlert: null,
            };
        }
        
        let wasForced = false;
        if(prev.forceClubs3) {
            cardToFlip = { suit: '♣', rank: '3', value: 3, color: 'black' };
            wasForced = true;
        }
        
        let baseNextState: Partial<GameState> = {};
        if (wasForced) {
            baseNextState.forceClubs3 = false;
        }
        
        if (cardToFlip.rank === '3' && cardToFlip.suit === '♣') {
            const newBoardFlipped = prev.boardFlipped.map(r => [...r]);
            newBoardFlipped[row][col] = true;

            let newWinnerId: string | null = prev.winnerId;
            let bonusAlert: string | null = null;
            
            const playerPath = player.isOnSuckersRoad
                ? MAP_LAYOUT_SUCKERS_ROAD.paths.suckers
                : player.startDirection
                ? MAP_LAYOUT_SUCKERS_ROAD.paths[player.startDirection]
                : [];

            const updatedPlayers = prev.players.map(p => {
                if (p.id === playerId) {
                    const newCoins = p.coins + cardToFlip.value; // +3 coins
                    const newPosition = p.position + 1;
                    
                    let updatedPlayerState: Partial<Player> = { coins: newCoins };

                    if (p.isOnSuckersRoad) {
                        if (newPosition >= playerPath.length) {
                            Object.assign(updatedPlayerState, {
                                isOnSuckersRoad: false,
                                startDirection: p.originalStartDirection,
                                position: 0,
                                originalStartDirection: undefined,
                            });
                            bonusAlert = " og er tilbake fra Suckers Road!";
                        } else {
                            Object.assign(updatedPlayerState, { position: newPosition });
                        }
                    } else {
                         Object.assign(updatedPlayerState, { position: newPosition });
                    }
                    
                    return { ...p, ...updatedPlayerState };
                }
                return p;
            });

            const intermediateState = {
                ...prev,
                ...baseNextState,
                players: updatedPlayers,
                boardFlipped: newBoardFlipped,
                currentCard: cardToFlip,
                lastCardFlipResult: null,
                winnerId: newWinnerId,
                activeAlert: `${player.name} trakk kløver 3, flytter 1 steg frem${bonusAlert || ''}. BONUS GAME STARTER..`,
            };

            setTimeout(() => {
                setGameState(currentState => {
                    if (!currentState) return null;
                    
                    const bonusTiles: {row: number, col: number, type: 'BONUS' | 'MEGABONUS'}[] = [];
                    MAP_LAYOUT_LOCKED.board.forEach((row, r) => {
                        row.forEach((cell, c) => {
                            if (cell === 'BONUS' || cell === 'MEGABONUS') {
                                bonusTiles.push({ row: r, col: c, type: cell });
                            }
                        });
                    });

                    const bonusCardsData: BonusCard[] = bonusTiles.map(tile => {
                        const card = currentState.boardCards[tile.row][tile.col];
                        if (!card) {
                            throw new Error(`No card found at bonus tile ${tile.row},${tile.col}`);
                        }
                        return {
                            type: tile.type,
                            card: card,
                            isRevealed: false,
                            multiplier: null,
                        };
                    });
                    
                    for (let i = bonusCardsData.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [bonusCardsData[i], bonusCardsData[j]] = [bonusCardsData[j], bonusCardsData[i]];
                    }
                    
                    setTimeout(() => {
                        setGameState(revealState => {
                            if (!revealState || !revealState.bonusGame || revealState.bonusGame.phase !== 'initializing') {
                                return revealState;
                            }

                            const finalBonusCards = revealState.bonusGame.cards.map(card => {
                                let multiplier = 0;
                                if (card.type === 'MEGABONUS') {
                                    multiplier = Math.floor(Math.random() * (7 - 4 + 1)) + 4;
                                } else {
                                    multiplier = Math.floor(Math.random() * (3 - 2 + 1)) + 2;
                                }
                                return { ...card, multiplier };
                            });
                            
                            const stateAfterSpin = {
                                ...revealState,
                                bonusGame: {
                                    ...revealState.bonusGame,
                                    cards: finalBonusCards,
                                    phase: 'revealing_multipliers' as BonusGame['phase'],
                                }
                            };

                            setTimeout(() => {
                                setGameState(playingState => {
                                    if (!playingState || !playingState.bonusGame || playingState.bonusGame.phase !== 'revealing_multipliers') {
                                        return playingState;
                                    }
                                    return {
                                        ...playingState,
                                        bonusGame: {
                                            ...playingState.bonusGame,
                                            phase: 'playing' as BonusGame['phase'],
                                        }
                                    };
                                });
                            }, 1200);

                            return stateAfterSpin;
                        });
                    }, 5000);

                    return {
                        ...currentState,
                        activeAlert: null,
                        bonusGame: {
                            isActive: true,
                            playerId: playerId,
                            cards: bonusCardsData,
                            winnings: 0,
                            phase: 'initializing',
                        },
                    };
                });
            }, 4500);
            
            return intermediateState;

        } else {
            const playerPath = player.isOnSuckersRoad
                ? MAP_LAYOUT_SUCKERS_ROAD.paths.suckers
                : MAP_LAYOUT_SUCKERS_ROAD.paths[player.startDirection!];

            if (player.position < playerPath.length) {
                const targetCardCoords = playerPath[player.position];
                if (!targetCardCoords) return prev;
                
                const isLinearPath = player.isOnSuckersRoad;

                if (isLinearPath) {
                    if (targetCardCoords.row !== row || targetCardCoords.col !== col) return prev;
                } else {
                    const isNorthSouth = player.startDirection === 'north' || player.startDirection === 'south';
                    const targetLevel = isNorthSouth ? targetCardCoords.row : targetCardCoords.col;
                    const selectedLevel = isNorthSouth ? row : col;

                    if (targetLevel !== selectedLevel) return prev;

                    const suckersPathCoords = MAP_LAYOUT_SUCKERS_ROAD.paths.suckers;
                    const isFlippingSuckersRoadTile = suckersPathCoords.some(coord => coord.row === row && coord.col === col);
                    if (isFlippingSuckersRoadTile) {
                        return prev;
                    }
                }
            }


            const effectiveColor = prev.forceRedCards ? 'red' : cardToFlip.color;
            const isCorrect = effectiveColor === guess;
            const coinValue = cardToFlip.value;

            if (isCorrect) {
                const coinGain = player.coins + coinValue;

                // --- Special rapid-fire logic for Suckers Road ---
                if (player.isOnSuckersRoad) {
                    const newPosition = player.position + 1;
                    
                    if (newPosition < playerPath.length) {
                        // Continue the streak
                        const updatedPlayer = { ...player, coins: coinGain, position: newPosition };
                        const updatedPlayers = prev.players.map(p => p.id === playerId ? updatedPlayer : p);
                        const newBoardFlipped = prev.boardFlipped.map(r => [...r]);
                        newBoardFlipped[row][col] = true;
                        
                        return {
                            ...prev,
                            ...baseNextState,
                            players: updatedPlayers,
                            boardFlipped: newBoardFlipped,
                            currentCard: null,
                            lastCardFlipResult: null,
                            lastFlippedCardCoords: null,
                        };
                    }
                }

                // --- Normal correct guess logic (and for finishing Suckers Road) ---
                let stepsMoved = 1;
                let newAlert: string | null = null; 

                const updatedPlayers = prev.players.map(p => {
                    if (p.id === playerId) {
                        const newPosition = p.position + 1;
                        let updatedPlayerState: Partial<Player> = { coins: coinGain };

                        if (p.isOnSuckersRoad) { // This now only triggers on the LAST card
                            Object.assign(updatedPlayerState, {
                                isOnSuckersRoad: false,
                                startDirection: p.originalStartDirection,
                                position: 0,
                                originalStartDirection: undefined,
                            });
                            newAlert = `${p.name} er tilbake fra Suckers Road!`;
                        } else {
                            Object.assign(updatedPlayerState, { position: newPosition });
                        }
                        return { ...p, ...updatedPlayerState };
                    }
                    return p;
                });
                
                const newBoardFlipped = prev.boardFlipped.map(r => [...r]);
                newBoardFlipped[row][col] = true;

                return {
                    ...prev,
                    ...baseNextState,
                    players: updatedPlayers,
                    boardFlipped: newBoardFlipped,
                    currentCard: cardToFlip,
                    lastCardFlipResult: { correct: true, stepsMoved, coinValue },
                    lastFlippedCardCoords: { row, col },
                    winnerId: prev.winnerId,
                    activeAlert: newAlert,
                };
            } else {
                const updatedPlayers = prev.players.map(p => 
                    p.id === playerId ? { ...p, coins: p.coins + coinValue } : p
                );

                let newDeck = [...prev.deck];
                newDeck.push(cardToFlip);

                for (let i = newDeck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
                }
                
                if (newDeck.length === 0) newDeck.push(...createDeck());

                const newCardForBoard = newDeck.pop()!;
                
                const newBoardCards = prev.boardCards.map(r => r.map(c => c ? {...c} : null));
                newBoardCards[row][col] = newCardForBoard;

                return {
                    ...prev,
                    ...baseNextState,
                    players: updatedPlayers,
                    deck: newDeck,
                    boardCards: newBoardCards,
                    currentCard: cardToFlip,
                    lastCardFlipResult: { correct: false, stepsMoved: 0, coinValue: coinValue },
                    lastFlippedCardCoords: { row, col },
                };
            }
        }
    });
}, []);

const handleBonusGuess = useCallback((cardIndex: number, guess: 'red' | 'black') => {
    setGameState(prev => {
        if (!prev || !prev.bonusGame || prev.bonusGame.phase !== 'playing') return prev;

        const newCards = [...prev.bonusGame.cards];
        const cardToUpdate = newCards[cardIndex];

        if (cardToUpdate.isRevealed || cardToUpdate.multiplier === null) return prev;

        const isCorrect = cardToUpdate.card.color === guess;
        const cardWinnings = isCorrect ? cardToUpdate.card.value * cardToUpdate.multiplier : 0;
        
        newCards[cardIndex] = {
            ...cardToUpdate,
            isRevealed: true,
            guess: guess,
            isCorrect: isCorrect,
        };
        
        const newTotalWinnings = prev.bonusGame.winnings + cardWinnings;
        const allRevealed = newCards.every(c => c.isRevealed);
        
        return {
            ...prev,
            bonusGame: {
                ...prev.bonusGame,
                cards: newCards,
                winnings: newTotalWinnings,
                phase: allRevealed ? 'finished' : 'playing',
            }
        };
    });
}, []);

const endBonusGame = useCallback(() => {
    setGameState(prev => {
        if (!prev || !prev.bonusGame) return prev;

        const bonusPlayer = prev.players.find(p => p.id === prev.bonusGame!.playerId);
        if (!bonusPlayer) return prev;

        const winnings = prev.bonusGame.winnings;
        const playersWithWinnings = prev.players.map(p =>
            p.id === bonusPlayer.id ? { ...p, coins: p.coins + winnings } : p
        );

        return {
            ...prev,
            players: playersWithWinnings,
            bonusGame: null,
            activeAlert: `${bonusPlayer.name} vant ${winnings} BC! Avslutt turen din.`,
            lastCardFlipResult: { correct: true, stepsMoved: 0, coinValue: winnings },
        };
    });
}, []);

const handleFinaleGuess = useCallback((guess: 'red' | 'black') => {
    setGameState(prev => {
        if (!prev || !prev.finaleGame || prev.finaleGame.phase !== 'guessing') return prev;

        const { card } = prev.finaleGame;
        const isCorrect = card.color === guess;

        const stateAfterReveal: GameState = {
            ...prev,
            finaleGame: {
                ...prev.finaleGame,
                phase: 'revealing',
                guess,
                isCorrect,
            },
        };

        setTimeout(() => {
            setGameState(current => {
                if (!current || !current.finaleGame || current.finaleGame.phase !== 'revealing') return current;
                return {
                    ...current,
                    finaleGame: {
                        ...current.finaleGame,
                        phase: isCorrect ? 'won' : 'lost',
                    }
                }
            });
        }, 2500); // 2.5s for reveal animation

        return stateAfterReveal;
    });
}, []);

const endFinaleGame = useCallback(() => {
    setGameState(prev => {
        if (!prev || !prev.finaleGame) return prev;

        if (prev.finaleGame.isCorrect) {
            // Player won
            return {
                ...prev,
                winnerId: prev.finaleGame.playerId,
                finaleGame: null,
            };
        } else {
            // Player lost, reset card and end turn
            const finaleCard = prev.finaleGame.card;
            
            const boardLayout = prev.suckersRoadUnlocked ? MAP_LAYOUT_SUCKERS_ROAD.board : MAP_LAYOUT_LOCKED.board;
            let win_r = -1, win_c = -1;
            boardLayout.forEach((row, r) => row.forEach((cell, c) => {
                if (cell === 'X') {
                    win_r = r;
                    win_c = c;
                }
            }));

            if (win_r === -1) {
                return { ...prev, finaleGame: null };
            }

            let newDeck = [...prev.deck];
            newDeck.push(finaleCard);
            for (let i = newDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
            }
            if (newDeck.length === 0) newDeck.push(...createDeck());
            const newCardForBoard = newDeck.pop()!;

            const newBoardCards = prev.boardCards.map(r => [...r]);
            newBoardCards[win_r][win_c] = newCardForBoard;

            const newBoardFlipped = prev.boardFlipped.map(r => [...r]);
            newBoardFlipped[win_r][win_c] = false;

            const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.turnPlayerId);
            const nextPlayerIndex = (currentPlayerIndex + 1) % prev.players.length;
            const nextPlayerId = prev.players[nextPlayerIndex].id;
            const newRound = (nextPlayerIndex < currentPlayerIndex) ? prev.round + 1 : prev.round;
            
            return {
                ...prev,
                deck: newDeck,
                boardCards: newBoardCards,
                boardFlipped: newBoardFlipped,
                finaleGame: null,
                turnPlayerId: nextPlayerId,
                round: newRound,
                currentCard: null,
                lastCardFlipResult: null,
                lastFlippedCardCoords: null,
                activeAlert: `Feil gjett! ${prev.players.find(p => p.id === nextPlayerId)?.name} sin tur.`,
            };
        }
    });
}, []);

const resolveBeggarChoice = useCallback((choice: 'give' | 'refuse') => {
    setGameState(prev => {
        if (!prev || !prev.beggarEncounter || prev.beggarEncounter.phase !== 'demanding') return prev;

        const { beggarEncounter } = prev;
        const player = prev.players.find(p => p.id === beggarEncounter.playerId);
        if (!player) return prev;

        let outcomeDialogue = '';
        let outcomeDescription = '';
        let coinChange = 0;
        
        if (choice === 'give') {
            const cost = beggarEncounter.demand;
            coinChange -= cost; // Initial cost

            const outcomeRoll = Math.random();
            if (outcomeRoll < 0.7) { // 70% chance of nothing
                outcomeDialogue = `"Takk... takk..."`;
                outcomeDescription = `Han mumler og forsvinner inn i en mørk bakgate.`;
            } else if (outcomeRoll < 0.95) { // 25% chance of 2x reward
                const reward = cost * 2;
                coinChange += reward;
                outcomeDialogue = `"En gave skal belønnes!"`;
                outcomeDescription = `Tiggeren gir deg en slitt pung. Du finner ${reward} BC inni!`;
            } else { // 5% chance of 5x reward
                const reward = cost * 5;
                coinChange += reward;
                outcomeDialogue = `"Ditt hjerte er rent!"`;
                outcomeDescription = `Tiggerens øyne lyser opp. Han gir deg en liten skinnende kiste med ${reward} BC!`;
            }
        } else { // 'refuse'
            const outcomeRoll = Math.random();
            if (outcomeRoll < 0.7) { // 70% chance of nothing
                outcomeDialogue = `"Dra til helvete selv!"`;
                outcomeDescription = `Han freser og spytter på bakken foran deg.`;
            } else if (outcomeRoll < 0.95) { // 25% chance of losing money
                const loss = beggarEncounter.demand;
                coinChange -= loss;
                outcomeDialogue = ``; // No dialogue, just action
                outcomeDescription = `I det du snur deg, napper han til seg ${loss} BC fra lommen din og stikker av!`;
            } else { // 5% chance of bigger money loss
                const loss = beggarEncounter.demand * 3;
                coinChange -= loss;
                outcomeDialogue = `"En forbannelse over deg og din nasjon!"`;
                outcomeDescription = `En mørk skygge omgir deg! Du føler deg ${loss} BC fattigere.`;
            }
        }
        
        return {
            ...prev,
            beggarEncounter: {
                ...beggarEncounter,
                phase: 'responding',
                outcomeDialogue: outcomeDialogue,
                outcomeDescription: outcomeDescription,
                coinChange: coinChange,
            },
        };
    });
}, []);

const endBeggarEncounter = useCallback(() => {
    setGameState(prev => {
        if (!prev || !prev.beggarEncounter || prev.beggarEncounter.phase !== 'responding') return prev;

        const { beggarEncounter } = prev;
        const { coinChange } = beggarEncounter;

        // Apply coin change, ensuring coins don't go below zero.
        const playersAfterBeggar = prev.players.map(p => 
            p.id === beggarEncounter.playerId 
            ? { ...p, coins: Math.max(0, p.coins + (coinChange || 0)) } 
            : p
        );

        const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.turnPlayerId);
        if (currentPlayerIndex === -1) {
            // This should not happen, but as a fallback...
            return {
                ...prev,
                players: playersAfterBeggar,
                beggarEncounter: null,
                turnPlayerId: prev.players[0].id,
            };
        }

        const nextPlayerIndex = (currentPlayerIndex + 1) % prev.players.length;
        const nextPlayerId = prev.players[nextPlayerIndex].id;
        const newRound = (nextPlayerIndex < currentPlayerIndex) ? prev.round + 1 : prev.round;
        
        return {
            ...prev,
            players: playersAfterBeggar,
            beggarEncounter: null,
            activeAlert: null,
            turnPlayerId: nextPlayerId,
            round: newRound,
            currentCard: null,
            lastCardFlipResult: null,
            lastFlippedCardCoords: null,
        };
    });
}, []);


  const endTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.winnerId) return prev;
      
      const currentPlayerIndex = prev.players.findIndex(p => p.id === prev.turnPlayerId);
      if (currentPlayerIndex === -1) {
          return { ...prev, turnPlayerId: prev.players[0].id };
      }

      const nextPlayerIndex = (currentPlayerIndex + 1) % prev.players.length;
      const nextPlayerId = prev.players[nextPlayerIndex].id;

      const newRound = (nextPlayerIndex < currentPlayerIndex) ? prev.round + 1 : prev.round;

      return {
        ...prev,
        turnPlayerId: nextPlayerId,
        round: newRound,
        currentCard: null,
        lastCardFlipResult: null,
        lastFlippedCardCoords: null,
        justUnlockedSuckersRoad: false,
      };
    });
  }, []);
  
  const forceSetTurn = useCallback((playerId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      if (!prev.players.some(p => p.id === playerId)) {
        console.warn("Admin forsøkte å gi tur til en spiller som ikke finnes.");
        return prev;
      }
      return {
        ...prev,
        turnPlayerId: playerId,
      };
    });
  }, []);

  const forceNextRound = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        round: prev.round + 1,
      };
    });
  }, []);

  const forceTripleGreenJackpot = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        return {
            ...prev,
            roulette: {
                ...prev.roulette,
                forcedResults: ['green', 'green', 'green'],
            },
        };
    });
  }, []);

  const toggleForceRedCards = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const isNowActive = !prev.forceRedCards;
        return {
            ...prev,
            forceRedCards: isNowActive,
            activeAlert: `Admin: Tving røde kort er nå ${isNowActive ? 'AKTIVERT' : 'DEAKTIVERT'}.`,
        };
    });
  }, []);
  
  const toggleForceClubs3 = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const isNowActive = !prev.forceClubs3;
        return {
            ...prev,
            forceClubs3: isNowActive,
            activeAlert: `Admin: Tving neste kort Kløver 3 er nå ${isNowActive ? 'AKTIVERT' : 'DEAKTIVERT'}.`,
        };
    });
  }, []);

  const toggleForceBeggar = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const isNowActive = !prev.forceBeggar;
        return {
            ...prev,
            forceBeggar: isNowActive,
            activeAlert: `Admin: Tving Tigger-møte er nå ${isNowActive ? 'AKTIVERT' : 'DEAKTIVERT'}.`,
        };
    });
  }, []);
  
  const placeRouletteBet = useCallback((playerId: string, color: 'red' | 'black' | 'green', amount: number) => {
    setGameState(prev => {
        if (!prev || prev.roulette.phase !== 'betting') return null;
        
        const player = prev.players.find(p => p.id === playerId);
        if (!player) return prev;
        
        const totalBet = (player.rouletteBets.red || 0) + (player.rouletteBets.black || 0) + (player.rouletteBets.green || 0);

        if (amount <= 0 || (totalBet + amount) > player.coins) {
            return prev;
        }

        const jackpotContribution = amount * JACKPOT_CONTRIBUTION_RATE;

        const updatedPlayers = prev.players.map(p => {
            if (p.id === playerId) {
                const newBets = { ...p.rouletteBets, [color]: (p.rouletteBets[color] || 0) + amount };
                return { ...p, rouletteBets: newBets, lastRouletteNetResult: null };
            }
            return p;
        });
        
        return { 
            ...prev, 
            players: updatedPlayers,
            tripleGreenJackpot: prev.tripleGreenJackpot + jackpotContribution,
        };
    });
  }, []);
  
  const clearRouletteBets = useCallback((playerId: string) => {
      setGameState(prev => {
          if (!prev) return null;
          
          const updatedPlayers = prev.players.map(p => {
              if (p.id === playerId) {
                  return { ...p, rouletteBets: { red: 0, black: 0, green: 0 }, lastRouletteNetResult: null };
              }
              return p;
          });

          return { ...prev, players: updatedPlayers };
      });
  }, []);

  const handleSetCurrentPlayer = useCallback((playerId: string) => {
    if (gameState?.players.find(p => p.id === playerId)) {
        setCurrentPlayerId(playerId);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState?.status !== GameStatus.ACTIVE) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.status !== GameStatus.ACTIVE) return prev;

        const { roulette } = prev;

        if (roulette.phase === 'betting') {
          if (roulette.countdown > 1) {
            return {
              ...prev,
              roulette: { ...roulette, countdown: roulette.countdown - 1 }
            };
          } else { // Countdown is over, start spinning
            let winningColor: 'red' | 'black' | 'green';
            let remainingForcedResults = [...roulette.forcedResults];
            let winningPocketIndex: number;

            if (remainingForcedResults.length > 0) {
                winningColor = remainingForcedResults.shift()!;
                const firstIndex = ROULETTE_POCKETS.indexOf(winningColor);
                winningPocketIndex = firstIndex !== -1 ? firstIndex : 0;
            } else {
                winningPocketIndex = Math.floor(Math.random() * ROULETTE_POCKETS.length);
                winningColor = ROULETTE_POCKETS[winningPocketIndex];
            }
            
            setTimeout(() => {
              setGameState(current => {
                if (!current || current.roulette.phase !== 'spinning') return current;
                const winner = current.roulette.lastWinningColor;
                if (!winner) return current;

                const newHistory = [winner, ...current.roulette.history].slice(0, 10);
                const isTripleGreenWin = winner === 'green' && newHistory.length >= 3 && newHistory[1] === 'green' && newHistory[2] === 'green';

                let jackpotPayouts = new Map<string, number>();
                let calculatedJackpotWinners: JackpotWinner[] = [];

                if (isTripleGreenWin) {
                    const jackpotAmount = current.tripleGreenJackpot;
                    const totalBetThisRound = current.players.reduce((sum, p) => sum + p.rouletteBets.red + p.rouletteBets.black + p.rouletteBets.green, 0);

                    if (totalBetThisRound > 0) {
                        current.players.forEach(p => {
                            const playerTotalBet = p.rouletteBets.red + p.rouletteBets.black + p.rouletteBets.green;
                            if (playerTotalBet > 0) {
                                const playerShare = playerTotalBet / totalBetThisRound;
                                const winnings = jackpotAmount * playerShare;
                                jackpotPayouts.set(p.id, winnings);
                                calculatedJackpotWinners.push({
                                    playerId: p.id,
                                    name: p.name,
                                    flag: p.flag,
                                    amount: winnings
                                });
                            }
                        });
                        calculatedJackpotWinners.sort((a, b) => b.amount - a.amount);
                    }
                }
                
                // Regular payout logic
                const updatedPlayers = current.players.map(p => {
                    const playerBets = p.rouletteBets;
                    const totalBet = playerBets.red + playerBets.black + playerBets.green;
                    
                    if (totalBet === 0) {
                      return { ...p, rouletteBets: { red: 0, black: 0, green: 0 }, lastRouletteNetResult: 0 };
                    }

                    const multiplier = winner === 'green' ? 14 : 2;
                    const winningsOnColor = (playerBets[winner] || 0) * multiplier;
                    const netResult = winningsOnColor - totalBet;
                    
                    const jackpotWinnings = jackpotPayouts.get(p.id) || 0;
                    const finalNetResult = netResult + jackpotWinnings;

                    return {
                        ...p,
                        coins: p.coins + finalNetResult,
                        rouletteBets: { red: 0, black: 0, green: 0 },
                        lastRouletteNetResult: finalNetResult,
                    };
                });
                
                // Set special round states
                const isSecondGreenInARow = winner === 'green' && newHistory[1] === 'green';

                return {
                  ...current,
                  players: updatedPlayers,
                  tripleGreenJackpot: isTripleGreenWin ? JACKPOT_INITIAL_AMOUNT : current.tripleGreenJackpot,
                  jackpotJustWon: isTripleGreenWin,
                  jackpotWinners: isTripleGreenWin ? calculatedJackpotWinners : null,
                  isJackpotImminent: isSecondGreenInARow && !isTripleGreenWin,
                  roulette: {
                    ...current.roulette,
                    phase: 'betting',
                    countdown: (isSecondGreenInARow && !isTripleGreenWin) ? ROULETTE_SPECIAL_ROUND_DURATION : ROULETTE_ROUND_DURATION,
                    isSpecialRound: isSecondGreenInARow && !isTripleGreenWin,
                    history: newHistory,
                    spinStartTime: null,
                    restingIndex: current.roulette.spinResultIndex,
                  }
                }
              });
            }, ROULETTE_SPIN_DURATION_MS + ROULETTE_POST_SPIN_DELAY_MS);

            return {
              ...prev,
              players: prev.players.map(p => ({...p, lastRouletteNetResult: null })),
              roulette: {
                ...roulette,
                phase: 'spinning',
                countdown: 0,
                lastWinningColor: winningColor,
                spinResultIndex: winningPocketIndex,
                spinStartTime: Date.now(),
                forcedResults: remainingForcedResults,
              }
            };
          }
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.status]);


  if (!gameState || !currentPlayerId || !realPlayerId) {
    return <Lobby onCreateGame={createGame} />;
  }

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const realPlayer = gameState.players.find(p => p.id === realPlayerId);

  if(!currentPlayer || !realPlayer) {
    setGameState(null);
    setCurrentPlayerId(null);
    setRealPlayerId(null);
    return <Lobby onCreateGame={createGame} />;
  }
  
  if (gameState.status === GameStatus.WAITING) {
      return (
        <PreGameLobby
          gameState={gameState}
          onAddPlayer={addPlayer}
          onStartGame={startGame}
        />
      )
  }

  return (
    <div className="max-w-md mx-auto h-screen bg-black flex flex-col">
      <Game 
        gameState={gameState}
        currentPlayer={currentPlayer}
        realPlayer={realPlayer}
        onUpdatePlayerCoins={updatePlayerCoins}
        onBuyItem={buyShopItem}
        onEndTurn={endTurn}
        onUseItem={useItem}
        onDismissAlert={dismissAlert}
        onDismissJackpotAlert={dismissJackpotAlert}
        onDismissJackpotWin={dismissJackpotWin}
        onForceSetTurn={forceSetTurn}
        onForceNextRound={forceNextRound}
        onForceTripleGreenJackpot={forceTripleGreenJackpot}
        onPlaceRouletteBet={placeRouletteBet}
        onClearRouletteBets={clearRouletteBets}
        onFlipCard={flipCard}
        onSetCurrentPlayer={handleSetCurrentPlayer}
        onToggleForceRedCards={toggleForceRedCards}
        onToggleForceClubs3={toggleForceClubs3}
        onBonusGuess={handleBonusGuess}
        onEndBonusGame={endBonusGame}
        onPlaceMine={placeMine}
        onCancelPlacingMine={cancelPlacingMine}
        onResolveBeggarChoice={resolveBeggarChoice}
        onEndBeggarEncounter={endBeggarEncounter}
        onToggleForceBeggar={toggleForceBeggar}
        onFinalizeSuckersRoadUnlock={finalizeSuckersRoadUnlock}
        onFinaleGuess={handleFinaleGuess}
        onEndFinaleGame={endFinaleGame}
      />
    </div>
  );
};

export default App;