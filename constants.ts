

import { ShopItem, Stock, Card, CardRank, CardSuit } from './types';

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'weapon-billettkontroll',
    name: 'Billettkontroll',
    description: 'Send en annen nasjon 1 steg bakover.',
    price: 25,
    type: 'weapon',
    requiresTarget: true,
    unlocksAtRound: 3,
  },
  {
    id: 'weapon-landmine',
    name: 'Landmine',
    description: 'Plasser en landmine på et valgfritt kort. -1 steg for den som flipper det.',
    price: 1,
    type: 'weapon',
    requiresTarget: false,
  },
  {
    id: 'weapon-nuke',
    name: 'Nuke',
    description: 'Send en nasjon tilbake til steinalderen (rykk tilbake til start).',
    price: 75,
    type: 'weapon',
    requiresTarget: true,
  },
  {
    id: 'weapon-suckers-road',
    name: 'Suckers Road®',
    description: 'Send en annen nasjon til Suckers Road.',
    price: 1,
    type: 'weapon',
    requiresTarget: true,
  },
  {
    id: 'powerup-rontgenbriller',
    name: 'Røntgenbriller',
    description: 'Se gjennom 1 klesplagg (damer).',
    price: 13000,
    type: 'powerup',
    requiresTarget: false,
  },
];

export const INITIAL_STOCKS: Stock[] = [
  { id: 'tuborg', name: 'Tuborg', price: 50 },
  { id: 'dnb', name: 'DNB', price: 100 },
  { id: 'norwegian', name: 'Norwegian', price: 75 },
];

export const GAME_CODE_LENGTH = 4;

export const FLAGS = [
  '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿',
  '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿',
  '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿',
  '🇩🇪', '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿',
  '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺',
  '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷',
  '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾',
  '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺',
  '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹',
  '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵',
  '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾', '🇰🇿',
  '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾',
  '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿',
  '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿',
  '🇴🇲',
  '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾',
  '🇶🇦',
  '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼',
  '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿',
  '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿',
  '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇳', '🇺🇸', '🇺🇾', '🇺🇿',
  '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺',
  '🇼🇫', '🇼🇸',
  '🇽🇰',
  '🇾🇪', '🇾🇹',
  '🇿🇦', '🇿🇲', '🇿🇼'
];

export const ROULETTE_POCKETS: ('red' | 'black' | 'green')[] = [
    'green', 
    'red', 'black', 'red', 'black', 'red', 'black', 'red', 
    'black', 'red', 'black', 'red', 'black', 'red', 'black'
];

export const MAP_LAYOUT = {
    grid: { rows: 15, cols: 29 },
    paths: {
        north: [ // Top-left edge
            { row: 0, col: 14 }, { row: 1, col: 13 }, { row: 2, col: 12 },
            { row: 3, col: 11 }, { row: 4, col: 10 }, { row: 5, col: 9 }
        ],
        south: [ // Bottom-left edge
            { row: 14, col: 14 }, { row: 13, col: 13 }, { row: 12, col: 12 },
            { row: 11, col: 11 }, { row: 10, col: 10 }, { row: 9, col: 9 }
        ],
        west: [ // Left horizontal arm
            { row: 7, col: 0 }, { row: 7, col: 2 }, { row: 7, col: 4 },
            { row: 7, col: 6 }, { row: 7, col: 8 }, { row: 7, col: 10 }
        ],
        east: [ // Right horizontal arm
            { row: 7, col: 28 }, { row: 7, col: 26 }, { row: 7, col: 24 },
            { row: 7, col: 22 }, { row: 7, col: 20 }, { row: 7, col: 18 }
        ]
    },
    cells: [
        // Diamond Shape (black squares)
        { type: 'diamond', row: 0, col: 14 },
        { type: 'diamond', row: 1, col: 13 }, { type: 'diamond', row: 1, col: 15 },
        { type: 'diamond', row: 2, col: 12 }, { type: 'diamond', row: 2, col: 14 }, { type: 'diamond', row: 2, col: 16 },
        { type: 'diamond', row: 3, col: 11 }, { type: 'diamond', row: 3, col: 13 }, { type: 'diamond', row: 3, col: 15 }, { type: 'diamond', row: 3, col: 17 },
        { type: 'diamond', row: 4, col: 10 }, { type: 'diamond', row: 4, col: 12 }, { type: 'diamond', row: 4, col: 14 }, { type: 'diamond', row: 4, col: 16 }, { type: 'diamond', row: 4, col: 18 },
    ],
};
export const MAP_LAYOUT_DIAMOND = {
    board: [
      [null,null,null,null,null,null,null,"N1",null,null,null,null,null,null,null],
      [null,null,null,null,null,null,"N2","N2","N2",null,null,null,null,null,null],
      [null,null,null,null,null,"N3","N3","N3","N3","N3",null,null,null,null,null],
      [null,null,null,null,"N4","N4","N4","N4","N4","N4","N4",null,null,null,null],
      [null,null,null,"N5","N5","N5","N5","N5","N5","N5","N5","N5",null,null,null],
      [null,null,"N6","N6","N6","N6","N6","N6","N6","N6","N6","N6","N6",null,null],
      [null,"N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7",null],
      ["N8","N8","N8","N8","N8","N8","N8","X","N8","N8","N8","N8","N8","N8","N8"],
      [null,"N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7",null],
      [null,null,"N6","N6","N6","N6","N6","N6","N6","N6","N6","N6","N6",null,null],
      [null,null,null,"N5","N5","N5","N5","N5","N5","N5","N5","N5",null,null,null],
      [null,null,null,null,"N4","N4","N4","N4","N4","N4","N4",null,null,null,null],
      [null,null,null,null,null,"N3","N3","N3","N3","N3",null,null,null,null,null],
      [null,null,null,null,null,null,"N2","N2","N2",null,null,null,null,null,null],
      [null,null,null,null,null,null,null,"N1",null,null,null,null,null,null,null]
    ],
    paths: {
        north: [ { row: 0, col: 7 }, { row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 } ],
        south: [ { row: 14, col: 7 }, { row: 13, col: 7 }, { row: 12, col: 7 }, { row: 11, col: 7 }, { row: 10, col: 7 }, { row: 9, col: 7 }, { row: 8, col: 7 } ],
        west: [ { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 } ],
        east: [ { row: 7, col: 14 }, { row: 7, col: 13 }, { row: 7, col: 12 }, { row: 7, col: 11 }, { row: 7, col: 10 }, { row: 7, col: 9 }, { row: 7, col: 8 } ],
    }
};

export const MAP_LAYOUT_LOCKED = {
    board: [
        ['skog','skog','skog','skog','skog','skog','skog',"N1",'desert_rock','desert_rock','desert_rock','desert_rock_highlight','desert_rock','desert_rock','desert_rock_skull'],
        ['skog','vann','skog','skog','skog','skog',"N2","N2","N2",'desert_sand_light','desert_rock','desert_sand_dark','desert_rock','desert_rock','desert_rock'],
        ['skog','vann','vann','skog','skog',"N3","N3","N3","N3","N3",'desert_sand_dark','desert_rock','desert_sand_light','desert_rock','desert_rock'],
        ['skog','skog','skog','skog',"N4","N4","N4","N4","N4","N4","N4",'desert_sand_dark','desert_rock_skull','desert_sand_dark','desert_sand_light'],
        ['skog','skog','skog',"N5","N5","N5","N5","N5","N5","N5","N5","N5",'desert_sand_light','desert_sand_dark','desert_sand_light'],
        ['skog','skog',"N6","N6","N6","N6","N6","N6","N6","N6","N6","N6","N6",'desert_sand_dark','desert_sand_light'],
        ['skog',"N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7",'desert_sand_light'],
        ["N8","N8","N8","N8","N8","N8","N8","X","N8","N8","N8","N8","N8","N8","N8"],
        ['stein',"N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7",null],
        ['stein','stein',"N6","N6","N6","N6","N6","N6","N6","N6","N6","N6","N6",null,null],
        ['stein','stein','stein',"N5","N5","N5","N5","N5","N5","N5","N5","N5",null,null,null],
        ['stein','stein','BONUS','stein',"N4","N4","N4","N4","N4","N4","N4",null,null,null,null],
        ['stein','BONUS','MEGABONUS','BONUS','stein',"N3","N3","N3","N3","N3",null,null,null,null,null],
        ['stein','stein','BONUS','stein','stein','stein',"N2","N2","N2",null,null,null,null,null,null],
        ['stein','stein','stein','stein','stein','stein','stein',"N1",null,null,null,null,null,null,null]
    ],
    paths: MAP_LAYOUT_DIAMOND.paths,
};

export const MAP_LAYOUT_SUCKERS_ROAD = {
    board: [
        ['N','N','skog','skog','skog','skog','skog',"N1",'desert_rock','desert_rock','desert_rock','desert_rock_highlight','desert_rock','desert_rock','desert_rock_skull'],
        ['skog','vann','N','skog','skog','skog',"N2","N2","N2",'desert_sand_light','desert_rock','desert_sand_dark','desert_rock','desert_rock','desert_rock'],
        ['skog','vann','vann','N','skog',"N3","N3","N3","N3","N3",'desert_sand_dark','desert_rock','desert_sand_light','desert_rock','desert_rock'],
        ['skog','skog','skog','skog',"N4","N4","N4","N4","N4","N4","N4",'desert_sand_dark','desert_rock_skull','desert_sand_dark','desert_sand_light'],
        ['skog','skog','skog',"N5","N5","N5","N5","N5","N5","N5","N5","N5",'desert_sand_light','desert_sand_dark','desert_sand_light'],
        ['skog','skog',"N6","N6","N6","N6","N6","N6","N6","N6","N6","N6","N6",'desert_sand_dark','desert_sand_light'],
        ['skog',"N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7",'desert_sand_light'],
        ["N8","N8","N8","N8","N8","N8","N8","X","N8","N8","N8","N8","N8","N8","N8"],
        ['stein',"N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7","N7",null],
        ['stein','stein',"N6","N6","N6","N6","N6","N6","N6","N6","N6","N6","N6",null,null],
        ['stein','stein','stein',"N5","N5","N5","N5","N5","N5","N5","N5","N5",null,null,null],
        ['stein','stein','BONUS','stein',"N4","N4","N4","N4","N4","N4","N4",null,null,null,null],
        ['stein','BONUS','MEGABONUS','BONUS','stein',"N3","N3","N3","N3","N3",null,null,null,null,null],
        ['stein','stein','BONUS','stein','stein','stein',"N2","N2","N2",null,null,null,null,null,null],
        ['stein','stein','stein','stein','stein','stein','stein',"N1",null,null,null,null,null,null,null]
    ],
    paths: {
        ...MAP_LAYOUT_DIAMOND.paths,
        suckers: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 3 },
        ],
    }
};

export const createDeck = (): Card[] => {
  const suits: CardSuit[] = ['♥', '♦', '♣', '♠'];
  const ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const cardValues: { [key in CardRank]: number } = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 11, 'K': 12, 'A': 13
  };

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        value: cardValues[rank],
        color: ['♥', '♦'].includes(suit) ? 'red' : 'black',
      });
    }
  }

  // Shuffle the deck (Fisher-Yates shuffle)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};