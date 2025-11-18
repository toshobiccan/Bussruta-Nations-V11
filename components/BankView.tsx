
import React, { useState } from 'react';
import { Player, Stock, ShopItem } from '../types';
import { INITIAL_SHOP_ITEMS } from '../constants';

interface BankViewProps {
  player: Player;
  stocks: Stock[];
  players: Player[];
  onUseItem: (sourcePlayerId: string, targetPlayerId: string | null, item: ShopItem) => void;
}

const TargetSelectionModal: React.FC<{
    players: Player[];
    currentItem: ShopItem;
    onSelectTarget: (targetId: string) => void;
    onClose: () => void;
}> = ({ players, currentItem, onSelectTarget, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-sm border border-neutral-700">
                <h3 className="text-lg font-bold text-white mb-4">Velg mål for {currentItem.name}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {players.map(p => (
                        <button
                            key={p.id}
                            onClick={() => onSelectTarget(p.id)}
                            className="w-full text-left p-3 bg-neutral-800 hover:bg-neutral-700 rounded-md text-white transition"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-full mt-4 p-2 bg-neutral-700 text-neutral-300 font-semibold rounded-md"
                >
                    Avbryt
                </button>
            </div>
        </div>
    )
}

const BankView: React.FC<BankViewProps> = ({ player, stocks, players, onUseItem }) => {
  const [targetingItem, setTargetingItem] = useState<ShopItem | null>(null);

  const inventoryItems = Object.entries(player.inventory);
  const otherPlayers = players.filter(p => p.id !== player.id);

  const handleUseItemClick = (item: ShopItem) => {
    if (item.requiresTarget) {
      setTargetingItem(item);
    } else {
      onUseItem(player.id, null, item);
    }
  };

  const handleSelectTarget = (targetId: string) => {
    if (targetingItem) {
      onUseItem(player.id, targetId, targetingItem);
      setTargetingItem(null);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {targetingItem && (
        <TargetSelectionModal
            players={otherPlayers}
            currentItem={targetingItem}
            onSelectTarget={handleSelectTarget}
            onClose={() => setTargetingItem(null)}
        />
      )}

      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-1">Nasjon</h2>
        <p className="text-4xl font-bold text-white flex items-center gap-3">
            <span className="text-5xl" role="img" aria-label={`Flagg for ${player.name}`}>{player.flag}</span>
            {player.name}
        </p>
      </div>
      
      <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-2">Kontantbeholdning</h3>
        <p className="text-6xl font-extrabold text-white">
          {player.coins}
          <span className="text-4xl ml-2 text-neutral-400">BC</span>
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-neutral-300 mb-3">Inventar</h3>
        <div className="space-y-3">
            {inventoryItems.map(([itemId, quantity]) => {
                const itemDetails = INITIAL_SHOP_ITEMS.find(i => i.id === itemId);
                if (!itemDetails) return null;
                return (
                    <div key={itemId} className="bg-neutral-900 p-4 rounded-md flex justify-between items-center border-l-4 border-neutral-700">
                        <div>
                            <p className="font-bold text-white">{itemDetails.name} <span className="text-sm text-neutral-400">x{quantity}</span></p>
                            <p className="text-xs text-neutral-400">{itemDetails.description}</p>
                        </div>
                        <button
                            onClick={() => handleUseItemClick(itemDetails)}
                            className="px-4 py-2 bg-white text-black font-bold text-xs rounded-md hover:bg-neutral-200 transition"
                        >
                            Bruk
                        </button>
                    </div>
                )
            })}
            {inventoryItems.length === 0 && (
                 <div className="text-center py-6 bg-neutral-900 rounded-lg">
                    <p className="text-neutral-500">Du eier ingen gjenstander.</p>
                    <p className="text-xs text-neutral-600">Besøk Shop for å handle!</p>
                </div>
            )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-neutral-300 mb-3">Aksjeportefølje</h3>
        <div className="space-y-3">
          {stocks.map(stock => {
            const ownedAmount = player.stocks[stock.id] || 0;
            if (ownedAmount === 0) return null;
            return (
                <div key={stock.id} className="bg-neutral-900 p-4 rounded-md flex justify-between items-center border-l-4 border-neutral-700">
                    <div>
                        <p className="font-bold text-white">{stock.name} <span className="text-sm text-neutral-400">x{ownedAmount}</span></p>
                        <p className="text-xs text-neutral-400">Verdi: {stock.price * ownedAmount} BC</p>
                    </div>
                    <p className="font-semibold text-white">{stock.price} BC/stk</p>
                </div>
            )
          })}
          {Object.keys(player.stocks).length === 0 && (
            <div className="text-center py-6 bg-neutral-900 rounded-lg">
              <p className="text-neutral-500">Du eier ingen aksjer.</p>
              <p className="text-xs text-neutral-600">Investeringer er ikke implementert enda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankView;