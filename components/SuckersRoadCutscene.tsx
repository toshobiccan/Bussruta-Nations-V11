import React, { useState, useEffect } from 'react';
import { MAP_LAYOUT_LOCKED, MAP_LAYOUT_SUCKERS_ROAD } from '../constants';

const TILE_SIZE_REM = 4; // Use a larger tile size for the cutscene

const PixelTile: React.FC<{ pixels: (string|null)[], width?: number, height?: number }> = ({ pixels, width = 8, height = 8 }) => (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
        {pixels.map((color, i) => {
            if (!color) return null;
            const x = i % width;
            const y = Math.floor(i / width);
            return <rect key={i} x={x} y={y} width="1" height="1" fill={color} />;
        })}
    </svg>
);

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

const tileComponents: { [key: string]: React.ReactNode } = {
    'skog': <PixelTile pixels={skogPixels} />,
    'vann': <PixelTile pixels={vannPixels} />,
};

const PathTile: React.FC = () => (
    <div className="w-full h-full rounded-md border bg-neutral-800/80 border-neutral-700/80"></div>
);

const FlippingTile: React.FC<{ originalType: string; delay: number }> = ({ originalType, delay }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showSplash, setShowSplash] = useState(false);

    useEffect(() => {
        let splashTimerId: number;
        const flipTimerId = setTimeout(() => {
            setIsFlipped(true);
            // Trigger splash mid-animation (250ms into a 500ms flip)
            splashTimerId = window.setTimeout(() => setShowSplash(true), 250);
        }, delay);

        const splashClearTimerId = setTimeout(() => {
            setShowSplash(false);
        }, delay + 250 + 400); // delay + mid-flip delay + splash animation duration

        return () => {
            clearTimeout(flipTimerId);
            clearTimeout(splashTimerId);
            clearTimeout(splashClearTimerId);
        };
    }, [delay]);

    const frontTile = tileComponents[originalType] || <div className="w-full h-full bg-black rounded-md"></div>;

    return (
        <div className="p-1 w-full h-full relative" style={{ perspective: '1000px' }}>
            <div
                className={`relative w-full h-full transition-transform duration-500 ease-in-out`}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Front Face */}
                <div className="absolute w-full h-full backface-hidden">
                    {frontTile}
                </div>

                {/* Back Face */}
                <div className="absolute w-full h-full backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                    <PathTile />
                </div>
            </div>
            {/* The splash animation is an overlay on top of the flipping tile */}
            {showSplash && (
                <div
                    className="splash-animation"
                    style={{
                        position: 'absolute',
                        width: '50%',
                        height: '50%',
                        top: '25%',
                        left: '25%',
                        zIndex: 5,
                    }}
                ></div>
            )}
        </div>
    );
};


interface SuckersRoadCutsceneProps {
    onFinished: () => void;
}

const SuckersRoadCutscene: React.FC<SuckersRoadCutsceneProps> = ({ onFinished }) => {
    const [phase, setPhase] = useState<'intro' | 'building' | 'finished'>('intro');

    useEffect(() => {
        const introTimer = setTimeout(() => setPhase('building'), 2500);
        const buildingTimer = setTimeout(() => setPhase('finished'), 2500 + (MAP_LAYOUT_SUCKERS_ROAD.paths.suckers.length * 300) + 500);
        
        return () => {
            clearTimeout(introTimer);
            clearTimeout(buildingTimer);
        };
    }, []);

    const backgroundTiles = MAP_LAYOUT_LOCKED.board.slice(0, 4).map(row => row.slice(0, 4));
    const pathCoords = MAP_LAYOUT_SUCKERS_ROAD.paths.suckers;
    const pathCoordsSet = new Set(pathCoords.map(c => `${c.row},${c.col}`));


    return (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-[101] p-4 animate-fade-in">
            <style>{`
                @keyframes text-swoop {
                    0% { transform: translateY(-100px) scale(0.5); opacity: 0; }
                    50%, 70% { transform: translateY(0) scale(1.1); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                .suckers-road-text {
                    animation: text-swoop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes splash-effect {
                    0% {
                        transform: scale(1);
                        opacity: 0.7;
                    }
                    100% {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                .splash-animation {
                    animation: splash-effect 0.4s ease-out forwards;
                    background-color: #e5e5e5;
                    border-radius: 9999px;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
            `}</style>
            
            <div className={`text-center transition-opacity duration-1000 ${phase === 'intro' ? 'opacity-100' : 'opacity-0'}`}>
                <h1 className="suckers-road-text text-5xl font-black text-white" style={{ textShadow: '0 0 10px #000, 0 0 20px #ef4444' }}>
                    Suckers Road®
                </h1>
                <h2 className="suckers-road-text text-2xl font-bold text-neutral-300" style={{ animationDelay: '0.2s' }}>
                    er låst opp!
                </h2>
            </div>
            
             <div className="relative mt-8 grid" style={{
                    gridTemplateColumns: `repeat(4, ${TILE_SIZE_REM}rem)`,
                    gridTemplateRows: `repeat(4, ${TILE_SIZE_REM}rem)`,
                }}>
                    {backgroundTiles.map((row, r) =>
                        row.map((tileType, c) => {
                            const isPathTile = pathCoordsSet.has(`${r},${c}`);

                            if (isPathTile) {
                                const pathIndex = pathCoords.findIndex(coord => coord.row === r && coord.col === c);
                                return (
                                    <FlippingTile
                                        key={`tile-${r}-${c}`}
                                        originalType={tileType || 'skog'}
                                        delay={phase === 'building' ? pathIndex * 300 : 99999}
                                    />
                                );
                            } else {
                                return (
                                    <div key={`tile-${r}-${c}`} className="p-1 w-full h-full">
                                        {tileType && tileComponents[tileType]}
                                    </div>
                                );
                            }
                        })
                    )}
            </div>

            {phase === 'finished' && (
                <button
                    onClick={onFinished}
                    className="mt-8 px-8 py-4 bg-white text-black font-bold text-lg rounded-md hover:bg-neutral-200 transition-all animate-fade-in"
                >
                    Fortsett
                </button>
            )}
        </div>
    );
};

export default SuckersRoadCutscene;
