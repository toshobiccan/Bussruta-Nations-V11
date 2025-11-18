
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { GameState, Player, Card } from '../types';
import { MAP_LAYOUT_DIAMOND, MAP_LAYOUT_LOCKED, MAP_LAYOUT_SUCKERS_ROAD } from '../constants';
import { BusLogo } from './BusLogo';
import { LockIcon, SkullIcon, PermanentSkullIcon } from './icons/NavIcons';

// --- PIXEL ART TILE DEFINITIONS ---

// A helper for creating pixelated SVG tiles
const PixelTile: React.FC<{ pixels: (string|null)[], width?: number, height?: number }> = ({ pixels, width = 8, height = 8 }) => {
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" className="rounded-md">
      {pixels.map((color, i) => {
        if (!color) return null;
        const x = i % width;
        const y = Math.floor(i / width);
        return <rect key={i} x={x} y={y} width="1" height="1" fill={color} />;
      })}
    </svg>
  );
};

// --- Define the pixel data for each tile ---

const skogPixels = [
    '#166534', '#15803d', '#166534', '#14532d', '#166534', '#15803d', '#166534', '#14532d',
    '#15803d', '#22c55e', '#15803d', '#16a34a', '#15803d', '#22c55e', '#15803d', '#16a34a',
    '#166534', '#15803d', '#14532d', '#166534', '#166534', '#15803d', '#14532d', '#166534',
    '#14532d', '#16a34a', '#15803d', '#22c55e', '#14532d', '#16a34a', '#15803d', '#22c55e',
    '#166534', '#166534', '#14532d', '#15803d', '#166534', '#166534', '#14532d', '#15803d',
    '#15803d', '#22c55e', '#16a34a', '#15803d', '#15803d', '#22c55e', '#16a34a', '#15803d',
    '#14532d', '#166534', '#15803d', '#166534', '#14532d', '#166534', '#15803d', '#166534',
    '#22c55e', '#15803d', '#16a34a', '#14532d', '#22c55e', '#15803d', '#16a34a', '#14532d',
];

const vannPixels = [
    '#1e3a8a', '#1d4ed8', '#1e3a8a', '#1e40af', '#1e3a8a', '#1d4ed8', '#1e3a8a', '#1e40af',
    '#1d4ed8', '#3b82f6', '#1d4ed8', '#2563eb', '#1d4ed8', '#3b82f6', '#1d4ed8', '#2563eb',
    '#1e40af', '#1e3a8a', '#1d4ed8', '#1e3a8a', '#1e40af', '#1e3a8a', '#1d4ed8', '#1e3a8a',
    '#2563eb', '#1d4ed8', '#3b82f6', '#1d4ed8', '#2563eb', '#1d4ed8', '#3b82f6', '#1d4ed8',
    '#1e3a8a', '#1e40af', '#1e3a8a', '#1d4ed8', '#1e3a8a', '#1e40af', '#1e3a8a', '#1d4ed8',
    '#3b82f6', '#2563eb', '#1d4ed8', '#3b82f6', '#3b82f6', '#2563eb', '#1d4ed8', '#3b82f6',
    '#1e3a8a', '#1d4ed8', '#1e40af', '#1e3a8a', '#1e3a8a', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#1d4ed8', '#3b82f6', '#2563eb', '#1d4ed8', '#1d4ed8', '#3b82f6', '#2563eb', '#1d4ed8',
];

const steinPixels = [
    '#57534e', '#78716c', '#57534e', '#44403c', '#57534e', '#78716c', '#57534e', '#44403c',
    '#78716c', '#a8a29e', '#78716c', '#a1a1aa', '#78716c', '#a8a29e', '#78716c', '#a1a1aa',
    '#57534e', '#44403c', '#57534e', '#78716c', '#57534e', '#44403c', '#57534e', '#78716c',
    '#44403c', '#a1a1aa', '#78716c', '#a8a29e', '#44403c', '#a1a1aa', '#78716c', '#a8a29e',
    '#57534e', '#78716c', '#44403c', '#57534e', '#57534e', '#78716c', '#44403c', '#57534e',
    '#78716c', '#a8a29e', '#a1a1aa', '#78716c', '#78716c', '#a8a29e', '#a1a1aa', '#78716c',
    '#44403c', '#57534e', '#78716c', '#57534e', '#44403c', '#57534e', '#78716c', '#57534e',
    '#a8a29e', '#78716c', '#a1a1aa', '#44403c', '#a8a29e', '#78716c', '#a1a1aa', '#44403c',
];

const C = {
    sandL: '#d8c8a0', sandD: '#c0a880',
    rock: '#786050', rockH: '#907868', rockS: '#685040',
    skull: '#e0d8b8'
};

const desertSandLightPixels = [
    C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL,
    C.sandL, C.sandD, C.sandL, C.sandL, C.sandL, C.sandD, C.sandL, C.sandL,
    C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL,
    C.sandD, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandD, C.sandL,
    C.sandL, C.sandL, C.sandL, C.sandD, C.sandL, C.sandL, C.sandL, C.sandL,
    C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandD, C.sandL, C.sandL,
    C.sandL, C.sandD, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandD,
    C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL, C.sandL,
];

const desertSandDarkPixels = [
    C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD,
    C.sandD, C.sandL, C.sandD, C.sandD, C.sandD, C.sandL, C.sandD, C.sandD,
    C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD,
    C.sandL, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandL, C.sandD,
    C.sandD, C.sandD, C.sandD, C.sandL, C.sandD, C.sandD, C.sandD, C.sandD,
    C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandL, C.sandD, C.sandD,
    C.sandD, C.sandL, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandL,
    C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD, C.sandD,
];

const desertRockPixels = [
    C.rockH, C.rockH, C.rock, C.rock, C.rock, C.rock, C.rock, C.rock,
    C.rockH, C.rock, C.rock, C.rock, C.rockS, C.rockS, C.rock, C.rock,
    C.rock, C.rock, C.rockS, C.rockS, C.rock, C.rock, C.rockS, C.rockS,
    C.rock, C.rockS, C.rock, C.rock, C.rock, C.rockS, C.rock, C.rock,
    C.rock, C.rock, C.rock, C.rockH, C.rock, C.rock, C.rockS, C.rockS,
    C.rockS, C.rockS, C.rockH, C.rockH, C.rock, C.rock, C.rock, C.rock,
    C.rock, C.rock, C.rock, C.rock, C.rock, C.rockS, C.rock, C.rock,
    C.rockS, C.rockS, C.rockS, C.rockS, C.rockS, C.rock, C.rock, C.rock,
];

const desertRockHighlightPixels = [
    C.rockH, C.rockH, C.rockH, C.rockH, C.rockH, C.rockH, C.rockH, C.rockH,
    C.rockH, C.rockH, C.rock, C.rockH, C.rock, C.rockH, C.rockH, C.rock,
    C.rock, C.rock, C.rockH, C.rock, C.rockH, C.rock, C.rock, C.rockH,
    C.rockH, C.rock, C.rock, C.rockH, C.rock, C.rockH, C.rockH, C.rock,
    C.rock, C.rockH, C.rockH, C.rock, C.rockH, C.rock, C.rock, C.rockH,
    C.rockH, C.rockH, C.rock, C.rock, C.rockH, C.rockH, C.rockH, C.rock,
    C.rock, C.rock, C.rockH, C.rockH, C.rock, C.rock, C.rock, C.rockH,
    C.rockH, C.rockH, C.rockH, C.rockH, C.rock, C.rockH, C.rockH, C.rockH,
];

const desertRockSkullPixels = [
    C.rockH, C.rock,  C.rock,  C.rock,  C.rock,  C.rock,  C.rock, C.rockS,
    C.rock,  C.rock,  C.rock,  C.rock,  C.rock,  C.rockS, C.rock, C.rockS,
    C.rock,  C.rock,  C.skull, C.rockS, C.skull, C.rock,  C.rock, C.rock,
    C.rock,  C.rockS, C.skull, C.skull, C.skull, C.rock,  C.rock, C.rock,
    C.rock,  C.rock,  C.rockS, C.skull, C.rockS, C.rock,  C.rock, C.rock,
    C.rockS, C.rock,  C.skull, C.rockS, C.skull, C.rock, C.rock, C.rockS,
    C.rock,  C.rockS, C.rock,  C.rock,  C.rock, C.rock, C.rockS, C.rock,
    C.rockS, C.rockS, C.rockS, C.rockS, C.rockS, C.rock, C.rock, C.rock,
];


interface DiamondCardMapGameProps {
  gameState: GameState;
  currentPlayer: Player;
  onFlipCard: (playerId: string, guess: 'red' | 'black', row: number, col: number) => void;
  onPlaceMine: (row: number, col: number) => void;
  onCancelPlacingMine: () => void;
}

const TILE_SIZE_REM = 3; // 48px

const CardOnMap: React.FC<{ card: Card }> = ({ card }) => {
    const isRed = card.color === 'red';
    return (
        <div className={`w-full h-full bg-white rounded-sm border border-neutral-400 flex flex-col items-center justify-center text-xs shadow-md ${isRed ? 'text-red-600' : 'text-black'}`}>
            <span className="font-bold -mb-1">{card.rank}</span>
            <span>{card.suit}</span>
        </div>
    );
};

const DrawnCardDisplay: React.FC<{ card: Card }> = ({ card }) => {
  const isRed = card.color === 'red';
  return (
    <div className={`w-28 h-40 bg-white border-2 border-neutral-300 rounded-lg shadow-2xl relative flex flex-col justify-between p-2 ${isRed ? 'text-red-600' : 'text-black'}`}>
      <div className="text-left">
        <div className="text-3xl font-bold leading-none">{card.rank}</div>
        <div className="text-xl leading-none">{card.suit}</div>
      </div>
      <div className="text-center text-5xl opacity-30">{card.suit}</div>
      <div className="text-right transform rotate-180">
        <div className="text-3xl font-bold leading-none">{card.rank}</div>
        <div className="text-xl leading-none">{card.suit}</div>
      </div>
    </div>
  );
};


const MapTile: React.FC<{ type: string }> = React.memo(({ type }) => {
    const baseClasses = 'w-full h-full rounded-md border';

    // Handle special tiles with custom content first
    if (type === 'MEGABONUS') {
        return (
            <div className={`${baseClasses} bg-pink-500/70 border-pink-400/70 flex items-center justify-center`}>
                <svg className="w-3/4 h-3/4 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </div>
        );
    }
    
    switch (type) {
        case 'skog':
            return <PixelTile pixels={skogPixels} />;
        case 'vann':
            return <PixelTile pixels={vannPixels} />;
        case 'stein':
            return <PixelTile pixels={steinPixels} />;
        case 'desert_sand_light':
            return <PixelTile pixels={desertSandLightPixels} />;
        case 'desert_sand_dark':
            return <PixelTile pixels={desertSandDarkPixels} />;
        case 'desert_rock':
            return <PixelTile pixels={desertRockPixels} />;
        case 'desert_rock_highlight':
            return <PixelTile pixels={desertRockHighlightPixels} />;
        case 'desert_rock_skull':
            return <PixelTile pixels={desertRockSkullPixels} />;
        default:
            let defaultClasses = 'bg-transparent border-transparent';
            if (type.startsWith('N')) {
                defaultClasses = 'bg-neutral-800/50 border-neutral-700/50';
            } else if (type === 'X') {
                return <div className={`${baseClasses} bg-yellow-900 border-yellow-700`}></div>;
            } else if (type === 'BONUS') {
                defaultClasses = 'bg-yellow-400/70 border-yellow-300/70 animate-pulse';
            }
             return <div className={`${baseClasses} ${defaultClasses}`}></div>;
    }
});

const PlayerMarker: React.FC<{ player: Player, isTurn: boolean }> = ({ player, isTurn }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <span className="text-4xl drop-shadow-lg" style={{ transform: 'translateY(-10%)' }}>{player.flag}</span>
            {isTurn && (
                <div className="absolute -top-1 -right-1">
                    <div className="relative w-4 h-4">
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-4 h-4 bg-white rounded-full border-2 border-black"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DiamondCardMapGame: React.FC<DiamondCardMapGameProps> = ({ gameState, currentPlayer, onFlipCard, onPlaceMine, onCancelPlacingMine }) => {
  const [selectedTile, setSelectedTile] = useState<{ row: number, col: number } | null>(null);
  const [guess, setGuess] = useState<'red' | 'black' | null>(null);
  const [confirmingMineLocation, setConfirmingMineLocation] = useState<{ row: number, col: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [isPanning, setIsPanning] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const startPanPoint = useRef({ x: 0, y: 0 });
  const suckersPathCoords = useMemo(() => MAP_LAYOUT_SUCKERS_ROAD.paths.suckers, []);

  const startingTileCoords = useMemo(() => {
    const paths = MAP_LAYOUT_DIAMOND.paths;
    const coords = [
      paths.north[0],
      paths.south[0],
      paths.west[0],
      paths.east[0],
    ];
    return coords.filter(Boolean); // Filter out potential undefined values
  }, []);

  const onPanStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = 'grabbing';
    }
    setIsPanning(true);
    const point = 'touches' in e ? e.touches[0] : e;
    startPanPoint.current = {
      x: point.clientX - pan.x,
      y: point.clientY - pan.y,
    };
  }, [pan.x, pan.y]);

  const onPanMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    const point = 'touches' in e ? e.touches[0] : e;
    setPan({ 
      x: point.clientX - startPanPoint.current.x,
      y: point.clientY - startPanPoint.current.y
    });
  }, [isPanning]);

  const onPanEnd = useCallback(() => {
    if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = 'grab';
    }
    setIsPanning(false);
  }, []);
  
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!mapContainerRef.current) return;
    e.preventDefault();

    const rect = mapContainerRef.current.getBoundingClientRect();
    const zoomSpeed = 0.1;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const mapX = (mouseX - pan.x) / zoom;
    const mapY = (mouseY - pan.y) / zoom;
    
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newZoom = Math.max(0.4, Math.min(2.0, zoom * (1 + delta)));

    const newPanX = mouseX - mapX * newZoom;
    const newPanY = mouseY - mapY * newZoom;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });

  }, [pan, zoom]);

  const isMyTurn = currentPlayer.id === gameState.turnPlayerId;
  const isPlacingMine = gameState.placingMineForPlayerId === currentPlayer.id;

  const winner = useMemo(() => gameState.winnerId ? gameState.players.find(p => p.id === gameState.winnerId) : null, [gameState.winnerId, gameState.players]);
  
  const boardToRender = gameState.suckersRoadUnlocked ? MAP_LAYOUT_SUCKERS_ROAD.board : MAP_LAYOUT_LOCKED.board;

  const playerMarkers = useMemo(() => {
    return gameState.players.map(player => {
      let playerPath;
      if (player.isOnSuckersRoad) {
        playerPath = MAP_LAYOUT_SUCKERS_ROAD.paths.suckers;
      } else if (player.startDirection) {
        playerPath = MAP_LAYOUT_SUCKERS_ROAD.paths[player.startDirection];
      } else {
        return null;
      }

      if (!playerPath) return null;

      const positionIndex = player.position - 1;
      let row: number, col: number;

      if (positionIndex < 0) { // At start, off the board
        const firstTile = playerPath[0];
        row = firstTile.row;
        col = firstTile.col;

        if (player.isOnSuckersRoad) { // Special start for suckers road
            row = -1;
            col = 0.5;
        } else {
            switch (player.startDirection) {
                case 'north': row -= 1; break;
                case 'south': row += 1; break;
                case 'west': col -= 1; break;
                case 'east': col += 1; break;
            }
        }
      } else {
        const pos = playerPath[positionIndex];
        if (!pos) return null;
        row = pos.row;
        col = pos.col;
      }
      return { ...player, row, col };
    }).filter(p => p !== null) as (Player & { row: number; col: number })[];
  }, [gameState.players]);


  if (winner) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center animate-fade-in">
            <h2 className="text-4xl font-bold text-yellow-400 mb-4">Spillet er over!</h2>
            <p className="text-6xl mb-4">{winner.flag}</p>
            <p className="text-2xl text-white"><span className="font-bold">{winner.name}</span> har vunnet spillet!</p>
            <p className="text-neutral-400 mt-2">De nådde målet først.</p>
        </div>
    );
  }
  
  const handleFlip = () => {
    if (guess && isMyTurn && !gameState.currentCard && selectedTile) {
      onFlipCard(currentPlayer.id, guess, selectedTile.row, selectedTile.col);
      setSelectedTile(null);
      setGuess(null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
        <style>{`
          .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
          .card-flipped { transform: rotateY(180deg); }
          @keyframes pulse-border {
            0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); }
            50% { box-shadow: 0 0 0 4px rgba(234, 179, 8, 0); }
          }
          @keyframes pulse-mine-target {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
          }
          .pulsing-card { animation: pulse-border 2s infinite; }
          .pulsing-mine-target { animation: pulse-mine-target 1.5s infinite; }
          @keyframes explosion-effect {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            70% { opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
          }
          .explosion {
            position: absolute; top: 50%; left: 50%; width: 200%; height: 200%;
            background-color: #f59e0b; border-radius: 50%;
            animation: explosion-effect 0.5s ease-out forwards;
          }
          .skull-container {
            opacity: 0;
            animation: skull-fade-in 0.3s ease-in 0.4s forwards;
          }
          @keyframes skull-fade-in {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
           @keyframes shiny-gold {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
          }
          .shiny-gold-tile {
              background: linear-gradient(110deg, #a67c00 8%, #f0e68c 18%, #a67c00 33%);
              background-size: 200% 100%;
              animation: shiny-gold 3s linear infinite, pulse-border 2s infinite;
              border-color: #f0e68c;
          }
        `}</style>
        <div 
            ref={mapContainerRef}
            className="flex-grow relative overflow-hidden cursor-grab touch-none flex items-center justify-center bg-neutral-950"
            onMouseDown={onPanStart}
            onMouseMove={onPanMove}
            onMouseUp={onPanEnd}
            onMouseLeave={onPanEnd}
            onTouchStart={onPanStart}
            onTouchMove={onPanMove}
            onTouchEnd={onPanEnd}
            onWheel={onWheel}
        >
            <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-neutral-700">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block leading-tight">Saldo</span>
                <span className="text-2xl font-extrabold text-white leading-tight">
                    {currentPlayer.coins}
                    <span className="text-lg ml-1 text-neutral-400">BC</span>
                </span>
            </div>
            
            <div 
                className="relative grid"
                style={{ 
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    gridTemplateColumns: `repeat(${boardToRender[0].length}, 1fr)`,
                    width: `${boardToRender[0].length * TILE_SIZE_REM}rem`,
                    height: `${boardToRender.length * TILE_SIZE_REM}rem`,
                }}
            >
                {/* Render ALL Map Elements in a single pass */}
                {boardToRender.map((row, r) => 
                    row.map((tileType, c) => {
                        const card = gameState.boardCards[r]?.[c];
                        const isFlipped = gameState.boardFlipped[r][c];
                        const mineOnTile = gameState.landmines.find(m => m.row === r && m.col === c);
                        const isMyMine = mineOnTile && mineOnTile.ownerId === currentPlayer.id;
                        const hasExplodedMine = gameState.explodedMines.some(m => m.row === r && m.col === c);
                        const isWinningTile = tileType === 'X';
                        
                        let isSelectable = false;
                        let isMineTarget = false;
                        
                        const isStartingTile = startingTileCoords.some(coord => coord.row === r && coord.col === c);

                        if (isPlacingMine) {
                            if (card && !isFlipped && !isWinningTile && !isStartingTile) {
                                isMineTarget = true;
                            }
                        } else if (isMyTurn && card && !isFlipped && !gameState.currentCard) {
                            const playerPath = currentPlayer.isOnSuckersRoad
                                ? MAP_LAYOUT_SUCKERS_ROAD.paths.suckers
                                : currentPlayer.startDirection
                                ? MAP_LAYOUT_SUCKERS_ROAD.paths[currentPlayer.startDirection]
                                : null;

                            if (playerPath) {
                                if (!currentPlayer.isOnSuckersRoad && currentPlayer.position >= playerPath.length) {
                                    // Player is eligible for the winning tile
                                    if (isWinningTile) {
                                        isSelectable = true;
                                    }
                                } else {
                                    const nextTileCoords = playerPath[currentPlayer.position];
                                    if (nextTileCoords) {
                                        const isLinearPath = currentPlayer.isOnSuckersRoad;
                                        if (isLinearPath) {
                                            if (nextTileCoords.row === r && nextTileCoords.col === c) {
                                                isSelectable = true;
                                            }
                                        } else {
                                            const isNorthSouth = currentPlayer.startDirection === 'north' || currentPlayer.startDirection === 'south';
                                            const targetLevel = isNorthSouth ? nextTileCoords.row : nextTileCoords.col;
                                            const cardLevel = isNorthSouth ? r : c;
                                            if (targetLevel === cardLevel) {
                                                const currentTileType = boardToRender[r][c];
                                                if (currentTileType && (currentTileType.startsWith('N') || currentTileType === 'X')) {
                                                     const isSuckersRoadTile = suckersPathCoords.some(coord => coord.row === r && coord.col === c);
                                                     if (!isSuckersRoadTile) isSelectable = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        const isSelected = selectedTile?.row === r && selectedTile?.col === c;
                        const isExplodingCard = gameState.lastFlippedCardCoords?.row === r && 
                                                gameState.lastFlippedCardCoords?.col === c &&
                                                gameState.lastCardFlipResult?.explosion;
                        const isConfirmingMine = confirmingMineLocation?.row === r && confirmingMineLocation?.col === c;

                        const backBorderClasses = isSelected
                            ? 'ring-4 ring-offset-2 ring-offset-black ring-yellow-400 border-yellow-400'
                            : isSelectable
                            ? 'border-yellow-500 pulsing-card'
                            : isConfirmingMine
                            ? 'ring-4 ring-offset-2 ring-offset-black ring-red-500 border-red-400'
                            : isMineTarget
                            ? 'border-red-500 pulsing-mine-target'
                            : isWinningTile ? 'border-yellow-600' : 'border-blue-700';

                        return (
                            <div
                                key={`tile-${r}-${c}`}
                                className="relative p-0.5"
                                style={{
                                    width: `${TILE_SIZE_REM}rem`,
                                    height: `${TILE_SIZE_REM}rem`,
                                    cursor: isSelectable || isMineTarget ? 'pointer' : 'default',
                                }}
                                onClick={() => {
                                    if (isMineTarget) {
                                        setConfirmingMineLocation({ row: r, col: c });
                                    } else if (isSelectable) {
                                        if (isWinningTile) {
                                            onFlipCard(currentPlayer.id, 'red', r, c); // Dummy guess, finale is triggered directly
                                        } else {
                                            setSelectedTile({ row: r, col: c }); setGuess(null);
                                        }
                                    }
                                }}
                            >
                                {tileType && <MapTile type={tileType} />}

                                {card && (
                                  <div className="absolute inset-0 p-1">
                                      <div className={`relative w-full h-full transition-transform duration-500 ${isFlipped ? 'card-flipped' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                                          {/* Card Back */}
                                          <div className={`absolute w-full h-full backface-hidden rounded-sm flex items-center justify-center shadow-lg border-2 ${backBorderClasses} ${isWinningTile ? 'shiny-gold-tile' : 'bg-blue-900'}`}>
                                            {isWinningTile ? (
                                                null
                                            ) : (
                                                <>
                                                    <BusLogo className={`w-8 h-auto ${isSelectable || isMineTarget ? 'text-blue-500' : 'text-neutral-700'}`} />
                                                    {isMyMine && !isFlipped && (
                                                        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-black/50"></div>
                                                    )}
                                                </>
                                            )}
                                          </div>
                                          {/* Card Front */}
                                          <div className="absolute w-full h-full backface-hidden rounded-sm" style={{ transform: 'rotateY(180deg)' }}>
                                              {isExplodingCard ? (
                                                  <div className="w-full h-full bg-neutral-900 border-2 border-red-500/50 rounded-sm flex items-center justify-center relative overflow-hidden">
                                                      <div className="explosion"></div>
                                                      <div className="skull-container">
                                                          <SkullIcon className="w-8 h-8 text-neutral-300" />
                                                      </div>
                                                  </div>
                                              ) : (
                                                  <div className="relative w-full h-full">
                                                      <CardOnMap card={card} />
                                                      {hasExplodedMine && (
                                                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-sm">
                                                              <PermanentSkullIcon className="w-10 h-10 text-neutral-300" />
                                                          </div>
                                                      )}
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                                )}
                            </div>
                        );
                    })
                )}

                {!gameState.suckersRoadUnlocked && (
                    <div
                        className="absolute flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-lg border-2 border-dashed border-neutral-600 p-2 text-center pointer-events-none animate-fade-in"
                        style={{
                            top: `0rem`,
                            left: `0rem`,
                            width: `${4 * TILE_SIZE_REM}rem`,
                            height: `${4 * TILE_SIZE_REM}rem`,
                            zIndex: 6,
                        }}
                    >
                        <LockIcon className="w-10 h-10 text-neutral-400 mb-2 opacity-80" />
                        <h3 className="text-lg font-black text-neutral-300 tracking-tighter" style={{ textShadow: '0 0 8px #000' }}>
                            Suckers Road
                        </h3>
                    </div>
                )}
                
                {/* Player markers are rendered on top */}
                {playerMarkers.map(player => (
                    <div
                        key={player.id}
                        className="absolute transition-transform duration-700 ease-in-out pointer-events-none"
                        style={{
                            width: `${TILE_SIZE_REM}rem`,
                            height: `${TILE_SIZE_REM}rem`,
                            transform: `translate(${player.col * TILE_SIZE_REM}rem, ${player.row * TILE_SIZE_REM}rem)`,
                            zIndex: 10,
                        }}
                    >
                        <PlayerMarker player={player} isTurn={player.id === gameState.turnPlayerId} />
                    </div>
                ))}
            </div>
        </div>
        
        {(isMyTurn || isPlacingMine) && (
            <div className="min-h-[13rem] flex flex-col justify-center items-center p-4 bg-neutral-900 border-t-2 border-neutral-800">
                {isPlacingMine ? (
                    confirmingMineLocation ? (
                        <div className="w-full max-w-sm text-center animate-fade-in">
                            <h3 className="text-lg font-bold mb-3 text-white">Bekreft plassering</h3>
                            <p className="text-neutral-400 text-sm mb-4">
                                Er du sikker på at du vil plassere en landmine på dette kortet?
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        onPlaceMine(confirmingMineLocation.row, confirmingMineLocation.col);
                                        setConfirmingMineLocation(null);
                                    }}
                                    className="p-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 transition"
                                >
                                    Ja, plasser
                                </button>
                                <button
                                    onClick={() => setConfirmingMineLocation(null)}
                                    className="p-4 bg-neutral-700 text-neutral-300 font-bold rounded-md hover:bg-neutral-600 transition"
                                >
                                    Nei, velg en annen
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="w-full max-w-sm text-center animate-fade-in">
                            <h3 className="text-lg font-bold mb-2 text-white">Plasser Landmine</h3>
                            <p className="text-neutral-400 text-sm mb-3">Velg et hvilket som helst uåpnet kort på brettet for å plassere en landmine. Startkort og vinnerkortet (X) kan ikke mineres.</p>
                            <button onClick={onCancelPlacingMine} className="w-full p-3 bg-neutral-700 text-neutral-300 font-bold rounded-md hover:bg-neutral-600 transition">
                                Avbryt
                            </button>
                        </div>
                    )
                ) : !gameState.currentCard ? (
                    <div className="w-full max-w-sm text-center animate-fade-in">
                        {selectedTile === null ? (
                             <>
                                <h3 className="text-lg font-bold mb-2 text-white">Din tur til å flippe!</h3>
                                <p className="text-neutral-400 text-sm mb-3">
                                    {currentPlayer.isOnSuckersRoad 
                                      ? "Du er på Suckers Road! Gjett riktig for å komme deg tilbake til hovedveien."
                                      : "Velg et kort på din rad. Gjett riktig for å gå videre. Uansett utfall vinner du kortets verdi i BussCoins!"
                                    }
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold mb-3 text-white">Du har valgt et kort. Gjett farge.</h3>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <button onClick={() => setGuess('red')} className={`p-4 font-bold rounded-md transition ${guess === 'red' ? 'bg-red-500 text-white ring-2 ring-white' : 'bg-red-800/50 text-red-300'}`}>
                                        Rød
                                    </button>
                                    <button onClick={() => setGuess('black')} className={`p-4 font-bold rounded-md transition ${guess === 'black' ? 'bg-neutral-600 text-white ring-2 ring-white' : 'bg-neutral-800/50 text-neutral-400'}`}>
                                        Svart
                                    </button>
                                </div>
                                <button 
                                    onClick={handleFlip}
                                    disabled={!guess}
                                    className="w-full p-4 bg-white text-black font-bold rounded-md hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 transition"
                                >
                                    Flip Kort
                                </button>
                            </>
                        )}
                    </div>
                ) : gameState.lastCardFlipResult && (
                    <div className="text-center animate-fade-in flex items-center justify-center gap-6 w-full max-w-sm">
                        {gameState.lastCardFlipResult.explosion ? (
                            <div>
                                <p className="text-4xl font-black text-red-500 animate-pulse">BOOM!</p>
                                <p className="text-lg mt-2 text-white">Du tråkket på en landmine!</p>
                                <p className="text-neutral-400 mt-1">Du må flytte ett steg tilbake.</p>
                                <p className="text-neutral-500 mt-4 text-sm">Trykk "Avslutt Tur" øverst.</p>
                            </div>
                        ) : (
                            <>
                                <DrawnCardDisplay card={gameState.currentCard} />
                                <div>
                                    <p className={`text-2xl font-bold ${gameState.lastCardFlipResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                                        {gameState.lastCardFlipResult.correct ? `Riktig!` : 'Feil.'}
                                    </p>
                                    <p className="text-xl mt-1 text-white">
                                        {gameState.lastCardFlipResult.correct ? `Flytt ${gameState.lastCardFlipResult.stepsMoved} steg!` : 'Ingen steg.'}
                                    </p>
                                    <p className={`text-xl font-bold mt-2 text-yellow-400`}>
                                        +{gameState.lastCardFlipResult.coinValue} BC
                                    </p>
                                    <p className="text-neutral-400 mt-4 text-sm">Trykk "Avslutt Tur" øverst.</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default DiamondCardMapGame;
