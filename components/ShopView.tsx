

import React, { useState } from 'react';
import { Player, ShopItem, GameState } from '../types';
import { INITIAL_SHOP_ITEMS } from '../constants';
import { LockIcon, itemIcons } from './icons/NavIcons';

interface ShopViewProps {
  player: Player;
  onBuyItem: (playerId: string, item: ShopItem, startRect: DOMRect) => void;
  round: number;
  gameState: GameState;
}

const ShopView: React.FC<ShopViewProps> = ({ player, onBuyItem, round, gameState }) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const shopItems = INITIAL_SHOP_ITEMS.filter(item => {
    if (item.id === 'weapon-suckers-road' && !gameState.suckersRoadItemAvailable) {
      return false;
    }
    return true;
  });

  const handleBuyClick = (e: React.MouseEvent, item: ShopItem) => {
    e.stopPropagation(); // Prevent the card from toggling when buying
    const rect = e.currentTarget.getBoundingClientRect();
    onBuyItem(player.id, item, rect);
  };

  const handleToggleExpand = (itemId: string) => {
    setExpandedItemId(prevId => (prevId === itemId ? null : itemId));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">SHOP</h2>
      <div className="text-center mb-6">
        <p className="text-neutral-400">Din Saldo: <span className="font-bold text-white">{player.coins} BC</span></p>
      </div>
      <div className="space-y-4">
        {shopItems.map(item => {
          const canAfford = player.coins >= item.price;
          const isLocked = !!item.unlocksAtRound && round < item.unlocksAtRound;
          const isExpanded = expandedItemId === item.id;
          const IconComponent = itemIcons[item.id] || (() => null);

          return (
            <div
              key={item.id}
              onClick={() => !isLocked && handleToggleExpand(item.id)}
              role="button"
              aria-expanded={isExpanded}
              tabIndex={isLocked ? -1 : 0}
              onKeyDown={(e) => {
                if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleToggleExpand(item.id);
                }
              }}
              className={`w-full text-left bg-neutral-900 p-4 rounded-lg flex items-start gap-4 border border-neutral-800 transition-all duration-300 ease-in-out ${
                isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-neutral-700'
              }`}
            >
              <div className="flex-shrink-0 bg-neutral-800 p-3 rounded-md text-neutral-400 mt-1">
                <IconComponent className="w-8 h-8" />
              </div>

              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-lg text-white">{item.name}</h3>
                <p className={`text-sm text-neutral-400 transition-all duration-300 ease-in-out ${isExpanded ? 'whitespace-normal' : 'truncate'}`}>
                  {item.description}
                </p>
              </div>

              <div className="w-32 flex-shrink-0 flex flex-col items-center justify-center ml-auto">
                {isLocked && item.unlocksAtRound ? (
                  <div className="flex flex-col items-center justify-center text-center bg-neutral-800 px-3 py-2 rounded-md">
                    <LockIcon className="w-5 h-5 text-neutral-500" />
                    <span className="text-xs text-neutral-500 font-semibold mt-1">
                      Låses opp runde {item.unlocksAtRound}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleBuyClick(e, item)}
                    disabled={!canAfford}
                    className={`w-full px-4 py-2 rounded-md font-bold text-sm transition-all duration-300 ${
                      canAfford
                        ? 'bg-white text-black hover:bg-neutral-200'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {item.price} BC
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopView;