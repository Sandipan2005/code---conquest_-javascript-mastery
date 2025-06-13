
import React from 'react';
import { Challenge } from '../types';

interface ChallengeViewProps {
  challenge: Challenge | null;
}

const ChallengeView: React.FC<ChallengeViewProps> = ({ challenge }) => {
  if (!challenge) {
    return <div className="p-4 text-gray-400">Select a challenge to begin your quest!</div>;
  }

  return (
    <div className="p-4 panel-bg rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-3 accent-color" style={{ fontFamily: "'MedievalSharp', cursive, serif" }}>
        {challenge.title}
      </h2>
      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{challenge.description}</p>
    </div>
  );
};

export default ChallengeView;
