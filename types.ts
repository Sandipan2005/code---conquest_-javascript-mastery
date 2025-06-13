

export interface SolutionCriteriaResult {
  passed: boolean;
  message?: string;
  updatedPlayerCode?: string; // For auto-corrections or formatting
  evaluatedValue?: any; // To pass the successfully evaluated value to visualFeedback
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  // topicId: string; // Will be implicitly defined by its parent SubTopic/MainTopic
  difficulty: 1 | 2 | 3; // 1: Easy (Beginner), 2: Medium (Intermediate), 3: Hard (Advanced)
  starterCode: string;
  solutionCriteria: (code: string, capturedLogs: string[]) => SolutionCriteriaResult;
  hint?: string;
  solutionExplanation?: string;
  visualFeedback?: (
    canvas: HTMLCanvasElement,
    details: {
      codeToVisualize?: string;
      studentOriginalCode: string;
      passed: boolean;
      message?: string;
      evaluatedValue?: any;
    }
  ) => void;
  nextChallengeId?: string | null; // May become less relevant with hierarchical navigation
  isPlaceholder?: boolean; // True if solutionCriteria is not fully implemented
}

// New Hierarchical Structure
export interface Concept {
  id: string; // Unique ID for the concept, e.g., "concept_let_declaration"
  name: string; // Display name, e.g., "Using let"
  challenge: Challenge; // The actual challenge associated with this concept
}

export interface SubTopic {
  id: string; // Unique ID for the sub-topic, e.g., "subtopic_variable_declarations"
  name: string; // Display name, e.g., "Variable Declarations"
  description?: string;
  concepts: Concept[];
  isUnlocked?: boolean; // Can be used by UI, though progress tracks this
}

export interface MainTopic {
  id: string; // Unique ID for the main topic, e.g., "maintopic_all_about_variables"
  name: string; // Display name, e.g., "All About Variables"
  description?: string;
  subTopics: SubTopic[];
  isUnlocked?: boolean; // Can be used by UI
}

export interface Curriculum {
  id: string;
  name: string; // e.g., "JavaScript Mastery Path"
  mainTopics: MainTopic[];
}
// End New Hierarchical Structure


export interface PlayerProgress {
  completedConcepts: Set<string>; // Set of Concept IDs (which are Challenge IDs)
  currentXp: number;
  
  unlockedMainTopics: Set<string>;
  unlockedSubTopics: Set<string>;

  lastSubmittedCode: Map<string, string>; // Stores successful code for completed concepts (key is concept/challenge ID)
  lastSuccessfulEvaluationValue: Map<string, any>; // Stores the evaluated value (key is concept/challenge ID)
}

export enum FeedbackType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  HINT = 'hint',
  ANALYSIS = 'analysis'
}

export interface FeedbackMessage {
  id: string; 
  text: string;
  type: FeedbackType;
}

export interface GameState {
  currentChallengeId: string | null; // This will be the ID of the Concept's Challenge
  playerCode: string; 
  consoleOutput: FeedbackMessage[];
  feedbackMessages: FeedbackMessage[]; 
  playerProgress: PlayerProgress;
  isLoading: boolean;
  isEvaluating: boolean;
  
  activeMainTopicId: string | null;
  activeSubTopicId: string | null;

  lastEvaluationPassed: boolean | null; 
  lastEvaluationMessage: string | null; 
  codeForVisuals: string | null; 
  lastEvaluationValue: any | null; 

  isGeneratingHint: boolean; 
  challengeJustCompleted: boolean; 

  isGeneratingAnalysis: boolean; 
  showAnalysisButton: boolean;   
}
