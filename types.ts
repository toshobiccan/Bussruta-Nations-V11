
export enum Tab {
  Bank = 'BANK',
  Shop = 'SHOP',
  Spill = 'SPILL',
  Scanner = 'SCANNER',
  Gambling = 'GAMBLING',
}

export enum GameStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
}

export interface RouletteState {
  phase: 'betting' | 'spinning';
  countdown: number;
  history: ('red' | 'black' | 'green')[];
  isSpecialRound: boolean;
  lastWinningColor: ('red' | 'black' | 'green') | null;
  spinResultIndex: number;
  spinStartTime: number | null;
  restingIndex: number;
  forcedResults: ('red' | 'black' | 'green')[];
}

export type CardSuit = '♥' | '♦' | '♣' | '♠';
export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: CardSuit;
  rank: CardRank;
  value: number;
  color: 'red' | 'black';
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  stocks: { [stockId: string]: number };
  inventory: { [itemId: string]: number };
  flag: string;
  rouletteBets: {
    red: number;
    black: number;
    green: number;
  };
  lastRouletteNetResult: number | null;
  startDirection?: 'north' | 'south' | 'east' | 'west';
  position: number;
  isOnSuckersRoad?: boolean;
  originalStartDirection?: 'north' | 'south' | 'east' | 'west';
}

export interface Stock {
  id: string;
  name: string;
  price: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'weapon' | 'powerup';
  requiresTarget: boolean;
  unlocksAtRound?: number;
}

export interface JackpotWinner {
  playerId: string;
  name: string;
  flag: string;
  amount: number;
}

export interface TrolleyState {
  position: number;
  playerIds: string[];
}

export interface BonusCard {
  type: 'BONUS' | 'MEGABONUS';
  card: Card;
  isRevealed: boolean;
  guess?: 'red' | 'black';
  isCorrect?: boolean;
  multiplier: number | null;
}

export interface BonusGame {
  isActive: boolean;
  playerId: string;
  cards: BonusCard[];
  winnings: number;
  phase: 'initializing' | 'revealing_multipliers' | 'playing' | 'finished';
}

export interface Landmine {
  row: number;
  col: number;
  ownerId: string;
}

export interface BeggarEncounter {
  playerId: string;
  demand: number;
  phase: 'demanding' | 'responding';
  outcomeDialogue?: string;
  outcomeDescription?: string;
  coinChange?: number;
}

export interface FinaleGame {
  isActive: boolean;
  playerId: string;
  card: Card;
  phase: 'intro' | 'guessing' | 'revealing' | 'won' | 'lost';
  guess?: 'red' | 'black';
  isCorrect?: boolean;
}

export interface GameState {
  id:string;
  players: Player[];
  stocks: Stock[];
  turnPlayerId: string;
  adminId: string;
  activeAlert: string | null;
  status: GameStatus;
  round: number;
  roulette: RouletteState;
  tripleGreenJackpot: number;
  isJackpotImminent: boolean;
  jackpotJustWon: boolean;
  jackpotWinners: JackpotWinner[] | null;
  deck: Card[];
  boardCards: (Card | null)[][];
  boardFlipped: boolean[][];
  currentCard: Card | null;
  lastCardFlipResult: { correct: boolean; stepsMoved: number; coinValue: number; explosion?: boolean } | null;
  winnerId: string | null;
  trolley: TrolleyState;
  suckersRoadUnlocked: boolean;
  suckersRoadItemAvailable: boolean;
  forceRedCards: boolean;
  forceClubs3: boolean;
  bonusGame: BonusGame | null;
  landmines: Landmine[];
  placingMineForPlayerId: string | null;
  lastFlippedCardCoords: { row: number, col: number } | null;
  explodedMines: { row: number, col: number }[];
  beggarEncounter: BeggarEncounter | null;
  forceBeggar: boolean;
  justUnlockedSuckersRoad?: boolean;
  suckersRoadCutsceneInfo: { sourcePlayerName: string; targetPlayerName: string } | null;
  finaleGame: FinaleGame | null;
}

export interface ScannedCard {
    rank: CardRank;
    suit: CardSuit;
    value: number;
}