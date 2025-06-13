
import React from 'react';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onRequestHint: () => void;
  hintAvailable: boolean; 
  isGeneratingHint: boolean;
  isChallengeCompleted: boolean;
  onRequestAnalysis: () => void; 
  isGeneratingAnalysis: boolean; 
  showAnalysisButton: boolean;   
  isPlaceholderChallenge: boolean; // New prop
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
    code, 
    onCodeChange, 
    onSubmit, 
    isSubmitting, 
    onRequestHint, 
    hintAvailable, 
    isGeneratingHint,
    isChallengeCompleted,
    onRequestAnalysis,      
    isGeneratingAnalysis,
    showAnalysisButton,
    isPlaceholderChallenge, // Destructure new prop
}) => {
  const hintButtonText = isGeneratingHint ? 'Oracle Seeks Wisdom...' : 'Seek Wisdom (Hint)';
  const analysisButtonText = isGeneratingAnalysis ? 'Oracle Ponders...' : "Unravel My Spell's Flaw";
  
  const isDisabledCore = isSubmitting || isGeneratingHint || isChallengeCompleted || isGeneratingAnalysis || isPlaceholderChallenge;

  let placeholderText = "Enter your JavaScript spell here...";
  if (isChallengeCompleted) {
    placeholderText = "This quest has been mastered. Thy spellbook is sealed for this trial.";
  } else if (isPlaceholderChallenge) {
    placeholderText = "The full incantation for this challenge is still being transcribed by the Elder Scribes. Content coming soon!";
  }

  return (
    <div className="flex flex-col h-full code-editor-bg rounded-lg shadow-inner overflow-hidden">
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        className="flex-1 p-4 bg-transparent text-gray-200 font-mono text-sm resize-none focus:outline-none"
        placeholder={placeholderText}
        spellCheck="false"
        disabled={isDisabledCore} 
        readOnly={isChallengeCompleted || isPlaceholderChallenge}
        aria-label="JavaScript Code Editor"
      />
      <div className="p-3 bg-gray-700 flex justify-end space-x-3 items-center">
        { showAnalysisButton && !isChallengeCompleted && !isPlaceholderChallenge && (
          <button
            onClick={onRequestAnalysis}
            className="button-secondary text-sm"
            disabled={isDisabledCore}
            aria-live="polite"
          >
            {analysisButtonText}
          </button>
        )}
        { hintAvailable && !isChallengeCompleted && !isPlaceholderChallenge && ( 
          <button
            onClick={onRequestHint}
            className="button-secondary text-sm"
            disabled={isDisabledCore}
            aria-live="polite"
          >
            {hintButtonText}
          </button>
        )}
        <button
          onClick={onSubmit}
          className="button-primary text-sm"
          disabled={isDisabledCore}
          aria-live="polite"
          title={isPlaceholderChallenge ? "This challenge is not yet fully implemented." : (isChallengeCompleted ? "Challenge already completed" : "Run your code")}
        >
          {isSubmitting ? 'Casting Spell...' : (isChallengeCompleted ? 'Quest Mastered' : (isPlaceholderChallenge ? 'Scribes At Work' : 'Cast Spell'))}
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
