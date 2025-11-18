

import React, { useState, useRef, useEffect } from 'react';
import { Player, CardRank, CardSuit, ScannedCard } from '../types';

interface ScannerViewProps {
  player: Player;
  onScanCard: (playerId: string, value: number) => void;
}

const cardRanks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardSuits: CardSuit[] = ['♥', '♦', '♣', '♠'];
const cardValues: {[key in CardRank]: number} = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 11, 'K': 12, 'A': 13
};

const ScannerView: React.FC<ScannerViewProps> = ({ player, onScanCard }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [lastScan, setLastScan] = useState<ScannedCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError(null);
    setLastScan(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setIsCameraOn(true);
      } else {
        setError("Kamera er ikke støttet på denne enheten.");
      }
    } catch (err) {
      console.error(err);
      setError("Kunne ikke få tilgang til kamera. Sjekk tillatelser.");
    }
  };

  const stopCamera = () => {
      if(streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsCameraOn(false);
  }

  // Cleanup effect
  useEffect(() => {
    return () => {
      if(streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleDummyScan = () => {
    // Dummy AI logic
    const randomRank = cardRanks[Math.floor(Math.random() * cardRanks.length)];
    const randomSuit = cardSuits[Math.floor(Math.random() * cardSuits.length)];
    const value = cardValues[randomRank];
    
    const scannedCard: ScannedCard = { rank: randomRank, suit: randomSuit, value };

    setLastScan(scannedCard);
    onScanCard(player.id, value);
    stopCamera();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      {!isCameraOn ? (
        <div className="space-y-4">
          {lastScan && (
             <div className="bg-neutral-900 p-6 rounded-lg border-2 border-neutral-700 text-center animate-fade-in">
                <p className="text-lg text-neutral-400">Siste skann:</p>
                <p className="text-5xl font-bold my-2" style={{color: ['♥', '♦'].includes(lastScan.suit) ? '#ef4444' : '#e5e5e5'}}>
                    {lastScan.rank}{lastScan.suit}
                </p>
                <p className="text-xl font-semibold text-white">
                    +{lastScan.value} BussCoins!
                </p>
             </div>
          )}
          <h2 className="text-2xl font-bold text-white">Kortskanner</h2>
          <p className="text-neutral-400 max-w-xs">
            Bruk mobilkameraet for å skanne et fysisk kort og konvertere verdien til BussCoins.
          </p>
          <button 
            onClick={startCamera}
            className="w-full p-4 bg-white text-black font-bold rounded-md hover:bg-neutral-200 transition-all duration-300"
          >
            Åpne Kamera
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[60vh] rounded-lg"></video>
          <div className="absolute inset-0 border-4 border-white/20 rounded-lg pointer-events-none animate-pulse"></div>
          
          <div className="mt-4 space-y-2 w-full">
            <button
                onClick={handleDummyScan}
                className="w-full p-4 bg-white text-black font-bold rounded-md text-lg"
            >
                Skann Kort
            </button>
            <button
                onClick={stopCamera}
                className="w-full p-2 bg-neutral-800 text-neutral-300 font-semibold rounded-md text-sm"
            >
                Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerView;