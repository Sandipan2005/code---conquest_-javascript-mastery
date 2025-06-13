
import React from 'react';
import { PlayerProgress } from '../types';

interface PlayerStatsProps {
  progress: PlayerProgress;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ progress }) => {
  // Simple leveling system for demonstration
  const level = Math.floor(progress.currentXp / 100) + 1;
  const xpForNextLevel = level * 100;
  const currentLevelXp = progress.currentXp % 100;

  return (
    <div className="mb-6 p-3 panel-bg rounded shadow-md border border-gray-700">
      <h3 className="text-lg font-semibold accent-color mb-2" style={{ fontFamily: "'Metamorphous', cursive, serif" }}>Your Prowess</h3>
      <div className="text-sm">
        <p>Level: <span className="font-bold text-white">{level}</span></p>
        <p>Experience: <span className="font-bold text-white">{progress.currentXp} XP</span></p>
        <div className="w-full bg-gray-600 rounded-full h-2.5 my-1">
          <div 
            className="accent-bg h-2.5 rounded-full" 
            style={{ width: `${(currentLevelXp / 100) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400">{currentLevelXp} / {100} XP to next level</p>
        <p className="mt-1">Concepts Mastered: <span className="font-bold text-white">{progress.completedConcepts.size}</span></p>
        <p>Scrolls Unlocked (Topics): <span className="font-bold text-white">{progress.unlockedMainTopics.size + progress.unlockedSubTopics.size}</span></p>
      </div>
    </div>
  );
};

export default PlayerStats;