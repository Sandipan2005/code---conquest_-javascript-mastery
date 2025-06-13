import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsMasteryCurriculum, GAME_TITLE } from './constants'; // Use jsMasteryCurriculum
import { Challenge, GameState, PlayerProgress, FeedbackType, FeedbackMessage, Concept, SubTopic, MainTopic, Curriculum, SolutionCriteriaResult } from './types';
import CurriculumNavigator from './components/CurriculumNavigator';
import ChallengeView from './components/ChallengeView';
import CodeEditor from './components/CodeEditor';
import OutputConsole from './components/OutputConsole';
import GameCanvas from './components/GameCanvas';
import FeedbackDisplay from './components/FeedbackDisplay';
import PlayerStats from './components/PlayerStats.tsx'; // Explicitly added .tsx extension
import { generateDynamicHint, generateCodeAnalysis } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'codeConquestPlayerProgress';

const getAllChallengesFromCurriculum = (curriculum: Curriculum): Challenge[] => {
  return curriculum.mainTopics.flatMap(mt => mt.subTopics.flatMap(st => st.concepts.map(c => c.challenge)));
};

const findChallengeInCurriculum = (challengeId: string | null, curriculum: Curriculum): Challenge | null => {
  if (!challengeId) return null;
  for (const mt of curriculum.mainTopics) {
    for (const st of mt.subTopics) {
      const concept = st.concepts.find(c => c.challenge.id === challengeId);
      if (concept) return concept.challenge;
    }
  }
  return null;
};

const findConceptById = (conceptId: string | null, curriculum: Curriculum): Concept | null => {
    if (!conceptId) return null;
    for (const mainTopic of curriculum.mainTopics) {
        for (const subTopic of mainTopic.subTopics) {
            const concept = subTopic.concepts.find(c => c.id === conceptId || c.challenge.id === conceptId);
            if (concept) return concept;
        }
    }
    return null;
};

const getChallengeParentSubTopic = (challengeId: string, curriculum: Curriculum): SubTopic | null => {
    for (const mainTopic of curriculum.mainTopics) {
        for (const subTopic of mainTopic.subTopics) {
            if (subTopic.concepts.some(c => c.challenge.id === challengeId)) {
                return subTopic;
            }
        }
    }
    return null;
};

const getChallengeParentMainTopic = (challengeId: string, curriculum: Curriculum): MainTopic | null => {
    for (const mainTopic of curriculum.mainTopics) {
        if (mainTopic.subTopics.some(st => st.concepts.some(c => c.challenge.id === challengeId))) {
            return mainTopic;
        }
    }
    return null;
};

const getDefaultInitialPlayerProgress = (curriculum: Curriculum): PlayerProgress => {
    const initialCompletedConcepts = new Set<string>();
    const initialUnlockedMainTopics = new Set<string>();
    const initialUnlockedSubTopics = new Set<string>();
    const initialLastSubmittedCode = new Map<string, string>();
    const initialLastSuccessfulEvaluationValue = new Map<string, any>();

    const introMainTopic = curriculum.mainTopics.find(mt => mt.id === 'mt_intro_js');
    if (introMainTopic) {
      initialUnlockedMainTopics.add(introMainTopic.id);
      introMainTopic.subTopics.forEach(st => {
        initialUnlockedSubTopics.add(st.id);
        st.concepts.forEach(c => {
          initialCompletedConcepts.add(c.challenge.id);
          initialLastSubmittedCode.set(c.challenge.id, c.challenge.starterCode);
          initialLastSuccessfulEvaluationValue.set(c.challenge.id, true); // Generic success
        });
      });
    }
    return {
        completedConcepts: initialCompletedConcepts,
        currentXp: 0,
        unlockedMainTopics: initialUnlockedMainTopics,
        unlockedSubTopics: initialUnlockedSubTopics,
        lastSubmittedCode: initialLastSubmittedCode,
        lastSuccessfulEvaluationValue: initialLastSuccessfulEvaluationValue,
    };
};


const App: React.FC = () => {
  const curriculumRef = useRef<Curriculum>(jsMasteryCurriculum);

  const [gameState, setGameState] = useState<GameState>(() => {
    let loadedPlayerProgress: PlayerProgress | null = null;
    try {
      const savedProgressString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedProgressString) {
        const parsed = JSON.parse(savedProgressString);
        loadedPlayerProgress = {
          completedConcepts: new Set(parsed.completedConcepts || []),
          currentXp: parsed.currentXp || 0,
          unlockedMainTopics: new Set(parsed.unlockedMainTopics || []),
          unlockedSubTopics: new Set(parsed.unlockedSubTopics || []),
          lastSubmittedCode: new Map(parsed.lastSubmittedCode || []),
          lastSuccessfulEvaluationValue: new Map(parsed.lastSuccessfulEvaluationValue || []),
        };
      }
    } catch (error) {
      console.error("Failed to load player progress from localStorage:", error);
      loadedPlayerProgress = null; 
    }

    const initialPlayerProgress = loadedPlayerProgress || getDefaultInitialPlayerProgress(curriculumRef.current);
    
    let initialFocusChallengeId: string | null = null;
    let initialFocusMainTopicId: string | null = null;
    let initialFocusSubTopicId: string | null = null;

    // Determine initial focus based on progress (or default if no progress)
    // Try to find the first *unlocked* but *not completed* challenge
    let foundFocus = false;
    for (const mt of curriculumRef.current.mainTopics) {
        if (initialPlayerProgress.unlockedMainTopics.has(mt.id)) {
            for (const st of mt.subTopics) {
                if (initialPlayerProgress.unlockedSubTopics.has(st.id)) {
                    const firstRelevantConcept = st.concepts.find(c => !initialPlayerProgress.completedConcepts.has(c.challenge.id) && !c.challenge.isPlaceholder) || 
                                                 st.concepts.find(c => !initialPlayerProgress.completedConcepts.has(c.challenge.id)); // fallback to placeholder if all playable are done
                    if (firstRelevantConcept) {
                        initialFocusChallengeId = firstRelevantConcept.challenge.id;
                        initialFocusMainTopicId = mt.id;
                        initialFocusSubTopicId = st.id;
                        foundFocus = true;
                        break;
                    }
                }
            }
        }
        if (foundFocus) break;
    }
    
    // If no such challenge found (e.g., all unlocked are completed, or issues with initial unlock logic),
    // default to the very first challenge after intro, ensuring topics are unlocked.
    if (!foundFocus) {
        for (const mt of curriculumRef.current.mainTopics) {
          if (mt.id === 'mt_intro_js') continue; 
          initialPlayerProgress.unlockedMainTopics.add(mt.id);
          initialFocusMainTopicId = mt.id;
          for (const st of mt.subTopics) {
            initialPlayerProgress.unlockedSubTopics.add(st.id);
            initialFocusSubTopicId = st.id;
            const firstConcept = st.concepts.find(c => !c.challenge.isPlaceholder) || st.concepts[0];
            if (firstConcept) {
              initialFocusChallengeId = firstConcept.challenge.id;
              foundFocus = true;
            }
            if (foundFocus) break;
          }
          if (foundFocus) break;
        }
    }
     // Absolute fallback: first challenge of first subtopic of first maintopic (could be intro)
    if (!foundFocus && curriculumRef.current.mainTopics[0]?.subTopics[0]?.concepts[0]) {
        const firstMt = curriculumRef.current.mainTopics[0];
        const firstSt = firstMt.subTopics[0];
        const firstC = firstSt.concepts[0];
        initialFocusMainTopicId = firstMt.id;
        initialFocusSubTopicId = firstSt.id;
        initialFocusChallengeId = firstC.challenge.id;
        initialPlayerProgress.unlockedMainTopics.add(firstMt.id);
        initialPlayerProgress.unlockedSubTopics.add(firstSt.id);
    }
    
    return {
      currentChallengeId: initialFocusChallengeId,
      playerCode: '', 
      consoleOutput: [],
      feedbackMessages: [],
      playerProgress: initialPlayerProgress,
      isLoading: true, 
      isEvaluating: false,
      activeMainTopicId: initialFocusMainTopicId,
      activeSubTopicId: initialFocusSubTopicId,
      lastEvaluationPassed: null,
      lastEvaluationMessage: null,
      codeForVisuals: null,
      lastEvaluationValue: null,
      isGeneratingHint: false,
      challengeJustCompleted: false,
      isGeneratingAnalysis: false, 
      showAnalysisButton: false,   
    };
  });

  const currentChallenge = findChallengeInCurriculum(gameState.currentChallengeId, curriculumRef.current);

  // Effect to save player progress to localStorage
  useEffect(() => {
    try {
      const progressToSave = {
        completedConcepts: Array.from(gameState.playerProgress.completedConcepts),
        currentXp: gameState.playerProgress.currentXp,
        unlockedMainTopics: Array.from(gameState.playerProgress.unlockedMainTopics),
        unlockedSubTopics: Array.from(gameState.playerProgress.unlockedSubTopics),
        lastSubmittedCode: Array.from(gameState.playerProgress.lastSubmittedCode.entries()),
        lastSuccessfulEvaluationValue: Array.from(gameState.playerProgress.lastSuccessfulEvaluationValue.entries()),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progressToSave));
    } catch (error) {
      console.error("Failed to save player progress to localStorage:", error);
    }
  }, [gameState.playerProgress]);


  const addMessage = useCallback((text: string, type: FeedbackType, target: 'console' | 'feedback') => {
    const newMessage: FeedbackMessage = { id: Date.now().toString() + Math.random(), text, type };
    setGameState(prev => {
      if (target === 'console') {
        return { ...prev, consoleOutput: [...prev.consoleOutput, newMessage].slice(-10) };
      } else {
        let filteredMessages = prev.feedbackMessages;
        if (type === FeedbackType.HINT) {
            filteredMessages = prev.feedbackMessages.filter(msg => msg.type !== FeedbackType.HINT);
        } else if (type === FeedbackType.ANALYSIS) {
            filteredMessages = prev.feedbackMessages.filter(msg => msg.type !== FeedbackType.ANALYSIS);
        }
        if (type === FeedbackType.SUCCESS || type === FeedbackType.ERROR) {
            filteredMessages = []; 
        }
        return { ...prev, feedbackMessages: [newMessage, ...filteredMessages].slice(-5) };
      }
    });
  }, []);

  useEffect(() => {
    const challengeToLoad = findChallengeInCurriculum(gameState.currentChallengeId, curriculumRef.current);
  
    if (challengeToLoad) {
      const parentSubTopic = getChallengeParentSubTopic(challengeToLoad.id, curriculumRef.current);
      const parentMainTopic = getChallengeParentMainTopic(challengeToLoad.id, curriculumRef.current);

      setGameState(prev => {
        const isCompleted = prev.playerProgress.completedConcepts.has(challengeToLoad.id);
        const savedCode = isCompleted ? prev.playerProgress.lastSubmittedCode.get(challengeToLoad.id) : undefined;
        const savedEvalValue = isCompleted ? prev.playerProgress.lastSuccessfulEvaluationValue.get(challengeToLoad.id) : undefined;

        if (prev.challengeJustCompleted && prev.currentChallengeId === challengeToLoad.id) {
          return {
            ...prev,
            isLoading: false,
            activeSubTopicId: parentSubTopic?.id || prev.activeSubTopicId, 
            activeMainTopicId: parentMainTopic?.id || prev.activeMainTopicId,
          };
        }

        // Show loading for at least 500ms before showing the next challenge
        setTimeout(() => {
          setGameState(innerPrev => ({
            ...innerPrev,
            playerCode: savedCode ?? challengeToLoad.starterCode,
            consoleOutput: [], 
            feedbackMessages: [{
              id: 'init-' + challengeToLoad.id + Date.now(),
              text: `Challenge: ${challengeToLoad.title}. ${isCompleted ? "(Status: Mastered)" : challengeToLoad.description}`,
              type: FeedbackType.INFO
            }],
            isLoading: false,
            activeSubTopicId: parentSubTopic?.id || innerPrev.activeSubTopicId,
            activeMainTopicId: parentMainTopic?.id || innerPrev.activeMainTopicId,
            lastEvaluationPassed: isCompleted ? true : null,
            lastEvaluationMessage: isCompleted ? `This trial, "${challengeToLoad.title}", has been mastered.` : null,
            codeForVisuals: isCompleted ? savedCode : null, 
            lastEvaluationValue: isCompleted ? savedEvalValue : null,
            showAnalysisButton: isCompleted ? false : innerPrev.showAnalysisButton, 
            isGeneratingAnalysis: false, 
          }));
        }, 500);
        // Keep loading state true until timeout fires
        return { ...prev, isLoading: true };
      });
    } else if (gameState.currentChallengeId && curriculumRef.current.mainTopics.length > 0) {
      const firstPlayableMt = curriculumRef.current.mainTopics.find(mt => mt.id !== 'mt_intro_js' && gameState.playerProgress.unlockedMainTopics.has(mt.id));
      const firstPlayableSt = firstPlayableMt?.subTopics.find(st => gameState.playerProgress.unlockedSubTopics.has(st.id));
      const firstPlayableC = firstPlayableSt?.concepts.find(c => !gameState.playerProgress.completedConcepts.has(c.challenge.id))?.challenge.id || firstPlayableSt?.concepts[0]?.challenge.id;

      if (firstPlayableC) {
        setGameState(prev => ({ ...prev, currentChallengeId: firstPlayableC, isLoading: true }));
      } else {
        addMessage('No further challenges found on the current path.', FeedbackType.ERROR, 'feedback');
        setGameState(prev => ({ ...prev, isLoading: false, currentChallengeId: null })); 
      }
    } else {
        addMessage('The library of wisdom is empty or no path is chosen.', FeedbackType.ERROR, 'feedback');
        setGameState(prev => ({...prev, isLoading: false, currentChallengeId: null}));
    }
  }, [gameState.currentChallengeId, addMessage]); // addMessage is now a dependency


  const handleChallengeSelect = useCallback((challengeId: string, subTopicId: string, mainTopicId: string) => {
    setGameState(prev => {
        const isSubTopicUnlocked = prev.playerProgress.unlockedSubTopics.has(subTopicId);
        const isMainTopicUnlocked = prev.playerProgress.unlockedMainTopics.has(mainTopicId);

        if (isMainTopicUnlocked && isSubTopicUnlocked) {
           return { 
             ...prev, 
             currentChallengeId: challengeId, 
             isLoading: true,
             challengeJustCompleted: false, 
             showAnalysisButton: false, 
            };
        } else {
          const subTopic = curriculumRef.current.mainTopics.find(mt => mt.id === mainTopicId)?.subTopics.find(st => st.id === subTopicId);
          addMessage(`The path to "${subTopic?.name || 'this wisdom'}" is currently sealed. Complete prior scrolls to unlock it.`, FeedbackType.ERROR, 'feedback');
          return prev; 
        }
    });
  }, [addMessage]); 

  const handleCodeChange = useCallback((code: string) => {
    setGameState(prev => ({ ...prev, playerCode: code, showAnalysisButton: false })); 
  }, []);

  const handleSubmitCode = useCallback(async () => {
    if (!currentChallenge || gameState.isEvaluating || currentChallenge.isPlaceholder) {
        if(currentChallenge?.isPlaceholder) {
            addMessage("This challenge's full magic is still being woven by the scribes. Please try another.", FeedbackType.INFO, 'feedback');
        }
        return;
    }

    setGameState(prev => ({ ...prev, isEvaluating: true, consoleOutput: [], feedbackMessages: [], showAnalysisButton: false }));
    addMessage('Thy spell is cast upon the winds...', FeedbackType.INFO, 'console');
    await new Promise(resolve => setTimeout(resolve, 300)); 
    
    let capturedLogs: string[] = [];
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => { 
        const logMsg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        capturedLogs.push(logMsg);
        setGameState(prev => ({ ...prev, consoleOutput: [...prev.consoleOutput, {id: Date.now().toString() + Math.random(), text: logMsg, type: FeedbackType.INFO}].slice(-10) }));
    };

    let evaluationResult: SolutionCriteriaResult;
    let finalPlayerCodeForVisuals: string = gameState.playerCode;

    try {
      evaluationResult = currentChallenge.solutionCriteria(gameState.playerCode, capturedLogs);
      if(evaluationResult.updatedPlayerCode) finalPlayerCodeForVisuals = evaluationResult.updatedPlayerCode;
    } catch (e: any) {
      const errorMessage = `A critical flaw in the weave! ${e.message}`;
      addMessage(errorMessage, FeedbackType.ERROR, 'console');
      evaluationResult = { passed: false, message: errorMessage };
    } finally {
      console.log = originalConsoleLog; 
    }

    if (evaluationResult.passed) {
      addMessage(evaluationResult.message || 'Victory! Thy challenge is overcome!', FeedbackType.SUCCESS, 'feedback');
      
      const newCompletedConcepts = new Set(gameState.playerProgress.completedConcepts).add(currentChallenge.id);
      const newLastSubmittedCode = new Map(gameState.playerProgress.lastSubmittedCode).set(currentChallenge.id, finalPlayerCodeForVisuals);
      const newLastSuccessfulEvalValue = new Map(gameState.playerProgress.lastSuccessfulEvaluationValue);
      if (evaluationResult.evaluatedValue !== undefined) {
        newLastSuccessfulEvalValue.set(currentChallenge.id, evaluationResult.evaluatedValue);
      }

      const newUnlockedMainTopics = new Set(gameState.playerProgress.unlockedMainTopics);
      const newUnlockedSubTopics = new Set(gameState.playerProgress.unlockedSubTopics);
      
      const parentSubTopic = getChallengeParentSubTopic(currentChallenge.id, curriculumRef.current);
      const parentMainTopic = getChallengeParentMainTopic(currentChallenge.id, curriculumRef.current);
      let nextChallengeToUnlockId: string | null = null; 

      if (parentSubTopic && parentMainTopic) {
        const currentConceptIndex = parentSubTopic.concepts.findIndex(c => c.challenge.id === currentChallenge.id);
        if (currentConceptIndex !== -1 && currentConceptIndex < parentSubTopic.concepts.length - 1) {
          nextChallengeToUnlockId = parentSubTopic.concepts[currentConceptIndex + 1].challenge.id;
        } else { 
          const currentSubTopicIndex = parentMainTopic.subTopics.findIndex(st => st.id === parentSubTopic.id);
          if (currentSubTopicIndex !== -1 && currentSubTopicIndex < parentMainTopic.subTopics.length - 1) {
            const nextSubTopic = parentMainTopic.subTopics[currentSubTopicIndex + 1];
            if (!newUnlockedSubTopics.has(nextSubTopic.id)) { 
                 newUnlockedSubTopics.add(nextSubTopic.id);
                 addMessage(`A new path unfolds: "${nextSubTopic.name}" is now accessible!`, FeedbackType.INFO, 'feedback');
            }
            nextChallengeToUnlockId = nextSubTopic.concepts[0]?.challenge.id || null;
          } else { 
            const currentMainTopicIndex = curriculumRef.current.mainTopics.findIndex(mt => mt.id === parentMainTopic.id);
            if (currentMainTopicIndex !== -1 && currentMainTopicIndex < curriculumRef.current.mainTopics.length - 1) {
              const nextMainTopic = curriculumRef.current.mainTopics[currentMainTopicIndex + 1];
               if (!newUnlockedMainTopics.has(nextMainTopic.id)) { 
                  newUnlockedMainTopics.add(nextMainTopic.id);
                   addMessage(`A new domain of knowledge awaits: "${nextMainTopic.name}" has been revealed!`, FeedbackType.SUCCESS, 'feedback');
              }
              const firstSubTopicOfNextMain = nextMainTopic.subTopics[0];
              if (firstSubTopicOfNextMain) {
                if(!newUnlockedSubTopics.has(firstSubTopicOfNextMain.id)) newUnlockedSubTopics.add(firstSubTopicOfNextMain.id); 
                nextChallengeToUnlockId = firstSubTopicOfNextMain.concepts[0]?.challenge.id || null;
              }
            }
          }
        }
      }
      
      const directNextChallengeId = currentChallenge.nextChallengeId; 
      const finalNextChallengeIdForButton = nextChallengeToUnlockId || directNextChallengeId;


      setGameState(prev => ({
        ...prev,
        isEvaluating: false,
        lastEvaluationPassed: true,
        lastEvaluationMessage: evaluationResult.message || null,
        codeForVisuals: finalPlayerCodeForVisuals,
        lastEvaluationValue: evaluationResult.evaluatedValue !== undefined ? evaluationResult.evaluatedValue : null,
        playerProgress: {
          ...prev.playerProgress,
          completedConcepts: newCompletedConcepts,
          currentXp: prev.playerProgress.currentXp + (currentChallenge.difficulty * 10),
          unlockedMainTopics: newUnlockedMainTopics,
          unlockedSubTopics: newUnlockedSubTopics,
          lastSubmittedCode: newLastSubmittedCode,
          lastSuccessfulEvaluationValue: newLastSuccessfulEvalValue,
        },
        challengeJustCompleted: true, 
        showAnalysisButton: false, 
      }));
      
      if (!finalNextChallengeIdForButton) {
         addMessage('All known trials on this path are complete, or perhaps the stars align for a greater revelation soon!', FeedbackType.INFO, 'feedback');
      }

    } else {
      addMessage(evaluationResult.message || 'Thy spell fizzles... The path remains obscured. Try again!', FeedbackType.ERROR, 'feedback');
      setGameState(prev => ({ 
        ...prev, 
        isEvaluating: false,
        lastEvaluationPassed: false,
        lastEvaluationMessage: evaluationResult.message || null,
        codeForVisuals: gameState.playerCode, 
        lastEvaluationValue: null,
        challengeJustCompleted: false, 
        showAnalysisButton: true, 
      }));
    }
  }, [currentChallenge, gameState.playerCode, gameState.isEvaluating, gameState.playerProgress, addMessage]); 

  const handleRequestHint = useCallback(async () => {
    if (!currentChallenge || gameState.isGeneratingHint || gameState.isGeneratingAnalysis || currentChallenge.isPlaceholder) return;
    setGameState(prev => ({ ...prev, isGeneratingHint: true }));
    addMessage('The Oracle whispers... seeking ancient wisdom for thee...', FeedbackType.INFO, 'feedback');
    try {
      const dynamicHint = await generateDynamicHint(currentChallenge.title, currentChallenge.description, gameState.playerCode, currentChallenge.hint);
      if (dynamicHint) addMessage(`Oracle's Counsel: ${dynamicHint}`, FeedbackType.HINT, 'feedback');
      else if (currentChallenge.hint) addMessage(`From an ancient scroll (Hint): ${currentChallenge.hint}`, FeedbackType.HINT, 'feedback');
      else addMessage("The Oracle finds no guidance for this trial at present.", FeedbackType.INFO, 'feedback');
    } catch (error: any) {
      console.error("Error generating dynamic hint:", error);
      addMessage(`The Oracle's connection to the aether is unstable: ${error.message || 'Could not divine a hint.'}`, FeedbackType.ERROR, 'feedback');
      if (currentChallenge.hint) addMessage(`Ancient Scroll (Hint): ${currentChallenge.hint}`, FeedbackType.HINT, 'feedback'); 
    } finally {
      setGameState(prev => ({ ...prev, isGeneratingHint: false }));
    }
  }, [currentChallenge, gameState.playerCode, addMessage, gameState.isGeneratingHint, gameState.isGeneratingAnalysis]);

  const handleRequestAnalysis = useCallback(async () => {
    if (!currentChallenge || gameState.isGeneratingAnalysis || gameState.isGeneratingHint || gameState.lastEvaluationPassed === true || !gameState.lastEvaluationMessage || currentChallenge.isPlaceholder) return;
    setGameState(prev => ({ ...prev, isGeneratingAnalysis: true }));
    addMessage('The Oracle peers into the weave of thy failed spell...', FeedbackType.INFO, 'feedback');
    try {
      const analysis = await generateCodeAnalysis(currentChallenge.title, currentChallenge.description, gameState.playerCode, gameState.lastEvaluationMessage);
      if (analysis) addMessage(`Oracle's Scrutiny: ${analysis}`, FeedbackType.ANALYSIS, 'feedback');
      else addMessage("The patterns of thy spell are too complex or faint for the Oracle to analyze now.", FeedbackType.INFO, 'feedback');
    } catch (error: any) {
      console.error("Error generating code analysis:", error);
      addMessage(`The Oracle's sight is clouded: ${error.message || 'Could not complete analysis.'}`, FeedbackType.ERROR, 'feedback');
    } finally {
      setGameState(prev => ({ ...prev, isGeneratingAnalysis: false }));
    }
  }, [currentChallenge, gameState.playerCode, gameState.lastEvaluationMessage, addMessage, gameState.isGeneratingAnalysis, gameState.isGeneratingHint, gameState.lastEvaluationPassed]);

  const handleProceedToNextQuest = useCallback(() => {
    if (!currentChallenge) return;
    
    let nextChallengeId: string | null = null;
    const parentSubTopic = getChallengeParentSubTopic(currentChallenge.id, curriculumRef.current);
    const parentMainTopic = getChallengeParentMainTopic(currentChallenge.id, curriculumRef.current);

    if (parentSubTopic && parentMainTopic) {
        const currentConceptIndex = parentSubTopic.concepts.findIndex(c => c.challenge.id === currentChallenge.id);
        if (currentConceptIndex !== -1 && currentConceptIndex < parentSubTopic.concepts.length - 1) {
            nextChallengeId = parentSubTopic.concepts[currentConceptIndex + 1].challenge.id;
        } else { 
            const currentSubTopicIndex = parentMainTopic.subTopics.findIndex(st => st.id === parentSubTopic.id);
            if (currentSubTopicIndex !== -1 && currentSubTopicIndex < parentMainTopic.subTopics.length - 1) {
                nextChallengeId = parentMainTopic.subTopics[currentSubTopicIndex + 1].concepts[0]?.challenge.id || null;
            } else { 
                const currentMainTopicIndex = curriculumRef.current.mainTopics.findIndex(mt => mt.id === parentMainTopic.id);
                if (currentMainTopicIndex !== -1 && currentMainTopicIndex < curriculumRef.current.mainTopics.length - 1) {
                    nextChallengeId = curriculumRef.current.mainTopics[currentMainTopicIndex + 1].subTopics[0]?.concepts[0]?.challenge.id || null;
                }
            }
        }
    }
    
    if (!nextChallengeId && currentChallenge.nextChallengeId) { 
        nextChallengeId = currentChallenge.nextChallengeId;
    }

    if (nextChallengeId) {
      const nextChallengeDetails = findChallengeInCurriculum(nextChallengeId, curriculumRef.current);
      if (nextChallengeDetails) { 
          const nextChallengeParentSubTopic = getChallengeParentSubTopic(nextChallengeId, curriculumRef.current);
          const nextChallengeParentMainTopic = getChallengeParentMainTopic(nextChallengeId, curriculumRef.current);
          setGameState(prev => ({
            ...prev,
            currentChallengeId: nextChallengeId!,
            isLoading: true,
            challengeJustCompleted: false, 
            showAnalysisButton: false, 
            activeSubTopicId: nextChallengeParentSubTopic?.id || null,
            activeMainTopicId: nextChallengeParentMainTopic?.id || null,
          }));
      } else {
        addMessage("The next scroll seems to be missing from the archives!", FeedbackType.ERROR, 'feedback');
        setGameState(prev => ({ ...prev, challengeJustCompleted: false }));
      }
    } else {
      addMessage("Thou art at the end of this path, or the next is yet to be revealed. Choose another from the scrolls!", FeedbackType.INFO, 'feedback');
       setGameState(prev => ({ ...prev, challengeJustCompleted: false })); 
    }
  }, [currentChallenge, addMessage]);


  if (gameState.isLoading && gameState.currentChallengeId) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-2xl p-8 text-center" style={{fontFamily: "'VT323', monospace"}}>Loading your next challenge...</div>;
  }
  
  if (!currentChallenge && !gameState.isLoading) {
     return <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-2xl p-8 text-center" style={{fontFamily: "'VT323', monospace"}}>No challenge beckons. Choose thy path from the codex, brave coder!</div>;
  }

  const isCurrentChallengeCompleted = currentChallenge ? gameState.playerProgress.completedConcepts.has(currentChallenge.id) : false;

  let hasNextQuestForButton = false;
    if (currentChallenge) {
        const parentSubTopic = getChallengeParentSubTopic(currentChallenge.id, curriculumRef.current);
        const parentMainTopic = getChallengeParentMainTopic(currentChallenge.id, curriculumRef.current);
        if (parentSubTopic && parentMainTopic) {
            const currentConceptIndex = parentSubTopic.concepts.findIndex(c => c.challenge.id === currentChallenge.id);
            if (currentConceptIndex !== -1 && currentConceptIndex < parentSubTopic.concepts.length - 1) {
                if (parentSubTopic.concepts[currentConceptIndex + 1]) hasNextQuestForButton = true;
            } else {
                const currentSubTopicIndex = parentMainTopic.subTopics.findIndex(st => st.id === parentSubTopic.id);
                if (currentSubTopicIndex !== -1 && currentSubTopicIndex < parentMainTopic.subTopics.length - 1) {
                    if(parentMainTopic.subTopics[currentSubTopicIndex + 1].concepts[0]) hasNextQuestForButton = true;
                } else {
                    const currentMainTopicIndex = curriculumRef.current.mainTopics.findIndex(mt => mt.id === parentMainTopic.id);
                    if (currentMainTopicIndex !== -1 && currentMainTopicIndex < curriculumRef.current.mainTopics.length - 1) {
                        if(curriculumRef.current.mainTopics[currentMainTopicIndex + 1].subTopics[0]?.concepts[0]) hasNextQuestForButton = true;
                    }
                }
            }
        }
        if (!hasNextQuestForButton && currentChallenge.nextChallengeId) { 
            if(findChallengeInCurriculum(currentChallenge.nextChallengeId, curriculumRef.current)) hasNextQuestForButton = true;
        }
    }


  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
      <header className="p-4 bg-gray-900 shadow-lg text-center">
        <h1 className="text-4xl font-bold accent-color tracking-wider" style={{ fontFamily: "'Cinzel Decorative', cursive" }}>{GAME_TITLE}</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 panel-bg p-4 overflow-y-auto shadow-lg min-w-[350px]"> 
          <PlayerStats progress={gameState.playerProgress} />
          <CurriculumNavigator 
            curriculum={curriculumRef.current} 
            onSelectChallenge={handleChallengeSelect}
            activeChallengeId={gameState.currentChallengeId}
            activeSubTopicId={gameState.activeSubTopicId}
            activeMainTopicId={gameState.activeMainTopicId}
            progress={gameState.playerProgress}
          />
        </aside>

        <main className="flex-1 flex flex-col p-4 overflow-hidden min-w-[400px]">
          {currentChallenge && <ChallengeView challenge={currentChallenge} />}
           {!currentChallenge && gameState.isLoading && 
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">Loading challenge details from the archives...</div>
           }
          <div className="flex-1 my-4 min-h-0">
            {currentChallenge && gameState.challengeJustCompleted && hasNextQuestForButton && (
              <div className="flex flex-col items-center justify-center h-full panel-bg rounded-lg p-6 text-center">
                <h3 className="text-3xl font-bold text-green-400 mb-4" style={{ fontFamily: "'MedievalSharp', cursive" }}>Quest Mastered!</h3>
                <p className="text-gray-300 mb-6 text-lg">Thou hast triumphed over "{currentChallenge.title}".<br/>Art thou ready for the next trial?</p>
                <button
                  onClick={handleProceedToNextQuest}
                  className="button-primary px-8 py-3 text-xl"
                >
                  Embark on Next Quest
                </button>
              </div>
            )}
            {currentChallenge && gameState.challengeJustCompleted && !hasNextQuestForButton && (
              <div className="flex flex-col items-center justify-center h-full panel-bg rounded-lg p-6 text-center">
                  <h3 className="text-3xl font-bold text-green-400 mb-4" style={{ fontFamily: "'MedievalSharp', cursive" }}>Path Completed!</h3>
                  <p className="text-gray-300 text-lg">All trials on this path are conquered, or the path ahead is veiled.<br/>Explore other scrolls in thy growing codex of knowledge!</p>
              </div>
            )}
            {currentChallenge && !gameState.challengeJustCompleted && (
              <CodeEditor 
                code={gameState.playerCode}
                onCodeChange={handleCodeChange}
                onSubmit={handleSubmitCode}
                isSubmitting={gameState.isEvaluating}
                onRequestHint={handleRequestHint}
                hintAvailable={!!currentChallenge && !currentChallenge.isPlaceholder} 
                isGeneratingHint={gameState.isGeneratingHint}
                isChallengeCompleted={isCurrentChallengeCompleted} 
                onRequestAnalysis={handleRequestAnalysis} 
                isGeneratingAnalysis={gameState.isGeneratingAnalysis} 
                showAnalysisButton={gameState.showAnalysisButton && !isCurrentChallengeCompleted && !currentChallenge.isPlaceholder} 
                isPlaceholderChallenge={currentChallenge.isPlaceholder || false}
              />
            )}
          </div>
          <div className="h-1/3 flex flex-col min-h-[200px]">
             <FeedbackDisplay messages={gameState.feedbackMessages} />
             <OutputConsole logs={gameState.consoleOutput} />
          </div>
        </main>

        <aside className="w-1/3 panel-bg p-4 flex items-center justify-center shadow-lg min-w-[350px]">
           <GameCanvas 
            challenge={currentChallenge} 
            studentOriginalCode={gameState.playerCode}
            codeForVisuals={gameState.codeForVisuals}
            lastEvaluationPassed={gameState.lastEvaluationPassed}
            lastEvaluationMessage={gameState.lastEvaluationMessage}
            lastEvaluationValue={gameState.lastEvaluationValue}
          />
        </aside>
      </div>
    </div>
  );
};

export default App;
