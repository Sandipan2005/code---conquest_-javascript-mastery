
import React, { useState } from 'react';
import { Curriculum, MainTopic, SubTopic, Concept, PlayerProgress } from '../types';

interface CurriculumNavigatorProps {
  curriculum: Curriculum;
  onSelectChallenge: (challengeId: string, subTopicId: string, mainTopicId: string) => void;
  activeChallengeId: string | null;
  activeSubTopicId: string | null;
  activeMainTopicId: string | null;
  progress: PlayerProgress;
}

const SubTopicItem: React.FC<{
  subTopic: SubTopic;
  mainTopicId: string;
  onSelectChallenge: CurriculumNavigatorProps['onSelectChallenge'];
  activeChallengeId: string | null;
  progress: PlayerProgress;
  isSubTopicActive: boolean;
  isSubTopicUnlocked: boolean;
}> = ({ subTopic, mainTopicId, onSelectChallenge, activeChallengeId, progress, isSubTopicActive, isSubTopicUnlocked }) => {
  const [isExpanded, setIsExpanded] = useState(isSubTopicActive || false);
  const allConceptsInSubTopicCompleted = subTopic.concepts.every(c => progress.completedConcepts.has(c.challenge.id));

  return (
    <li className="ml-4 my-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left text-md font-medium p-2 rounded transition-colors duration-150 flex justify-between items-center
          ${isSubTopicActive ? 'bg-orange-600 text-white' : 'hover:bg-gray-600 text-gray-300'}
          ${allConceptsInSubTopicCompleted && isSubTopicUnlocked ? 'nav-item-completed' : ''}
          ${!isSubTopicUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={!isSubTopicUnlocked}
        style={{ fontFamily: "'Metamorphous', cursive" }}
        aria-expanded={isExpanded}
      >
        <span>
          {subTopic.name}
          {!isSubTopicUnlocked && <span className="text-xs text-red-400 ml-1">(Locked)</span>}
        </span>
        {isSubTopicUnlocked && <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>}
      </button>
      {isSubTopicUnlocked && isExpanded && (
        <ul className="space-y-1 mt-1 ml-4 border-l-2 border-gray-500 pl-3">
          {subTopic.concepts.map((concept: Concept) => {
            const isCompleted = progress.completedConcepts.has(concept.challenge.id);
            const isActive = concept.challenge.id === activeChallengeId;
            return (
              <li key={concept.id}>
                <button
                  onClick={() => onSelectChallenge(concept.challenge.id, subTopic.id, mainTopicId)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors duration-150 
                    ${isActive ? 'nav-item-active font-semibold' : 'hover:bg-gray-500'} 
                    ${isCompleted ? 'nav-item-completed italic' : 'text-gray-300'}
                    ${concept.challenge.isPlaceholder ? 'opacity-70' : ''}
                  `}
                  title={concept.challenge.isPlaceholder ? "This challenge's content is coming soon." : concept.challenge.title}
                >
                  {concept.name}
                  {concept.challenge.difficulty === 2 && <span className="text-yellow-400 text-xs ml-1">(M)</span>}
                  {concept.challenge.difficulty === 3 && <span className="text-red-400 text-xs ml-1">(H)</span>}
                  {concept.challenge.isPlaceholder && <span className="text-purple-400 text-xs ml-1">(P)</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

const MainTopicItem: React.FC<{
  mainTopic: MainTopic;
  onSelectChallenge: CurriculumNavigatorProps['onSelectChallenge'];
  activeChallengeId: string | null;
  activeSubTopicId: string | null;
  progress: PlayerProgress;
  isMainTopicActive: boolean;
  isMainTopicUnlocked: boolean;
}> = ({ mainTopic, onSelectChallenge, activeChallengeId, activeSubTopicId, progress, isMainTopicActive, isMainTopicUnlocked }) => {
  const [isExpanded, setIsExpanded] = useState(isMainTopicActive || false);
  const allSubTopicsCompleted = mainTopic.subTopics.every(st => st.concepts.every(c => progress.completedConcepts.has(c.challenge.id)));

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left text-xl font-semibold p-2 rounded transition-colors duration-150 flex justify-between items-center
         ${isMainTopicActive ? 'accent-bg text-gray-900' : 'hover:bg-gray-700 accent-color border-b-2 border-gray-700 pb-1'}
         ${allSubTopicsCompleted && isMainTopicUnlocked ? 'nav-item-completed' : ''}
         ${!isMainTopicUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={!isMainTopicUnlocked}
        style={{ fontFamily: "'MedievalSharp', cursive" }}
        aria-expanded={isExpanded}
      >
        <span>
          {mainTopic.name}
          {!isMainTopicUnlocked && <span className="text-xs text-red-400 ml-1">(Locked)</span>}
        </span>
        {isMainTopicUnlocked && <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>}
      </button>
      {mainTopic.description && isMainTopicUnlocked && <p className="text-xs text-gray-400 mt-1 mb-2 px-2">{mainTopic.description}</p>}
      {isMainTopicUnlocked && isExpanded && (
        <ul className="space-y-1 mt-2">
          {mainTopic.subTopics.map((subTopic: SubTopic) => (
            <SubTopicItem
              key={subTopic.id}
              subTopic={subTopic}
              mainTopicId={mainTopic.id}
              onSelectChallenge={onSelectChallenge}
              activeChallengeId={activeChallengeId}
              progress={progress}
              isSubTopicActive={subTopic.id === activeSubTopicId}
              isSubTopicUnlocked={progress.unlockedSubTopics.has(subTopic.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};


const CurriculumNavigator: React.FC<CurriculumNavigatorProps> = ({ 
  curriculum, 
  onSelectChallenge, 
  activeChallengeId, 
  activeSubTopicId, 
  activeMainTopicId, 
  progress 
}) => {
  return (
    <nav className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4 text-orange-400" style={{ fontFamily: "'Cinzel Decorative', cursive"}}>Scrolls of Wisdom</h2>
      {curriculum.mainTopics.map((mainTopic: MainTopic) => (
        <MainTopicItem
          key={mainTopic.id}
          mainTopic={mainTopic}
          onSelectChallenge={onSelectChallenge}
          activeChallengeId={activeChallengeId}
          activeSubTopicId={activeSubTopicId}
          progress={progress}
          isMainTopicActive={mainTopic.id === activeMainTopicId}
          isMainTopicUnlocked={progress.unlockedMainTopics.has(mainTopic.id)}
        />
      ))}
    </nav>
  );
};

export default CurriculumNavigator;
