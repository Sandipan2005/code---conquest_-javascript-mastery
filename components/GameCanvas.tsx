import React, { useRef, useEffect } from 'react';
import { Challenge } from '../types';

interface GameCanvasProps {
  challenge: Challenge | null;
  studentOriginalCode: string; 
  codeForVisuals: string | null;     
  lastEvaluationPassed: boolean | null;
  lastEvaluationMessage: string | null;
  lastEvaluationValue: any | null; 
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  challenge, 
  studentOriginalCode, 
  codeForVisuals, 
  lastEvaluationPassed,
  lastEvaluationMessage,
  lastEvaluationValue 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store a reference to the animation frame request ID
  const animationFrameIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (parent) {
        // Ensure minimum dimensions for game scenes
        const newWidth = Math.max(parent.clientWidth > 50 ? parent.clientWidth - 30 : 300, 300); // Adjusted padding
        const newHeight = Math.max(parent.clientHeight > 50 ? parent.clientHeight - 30 : 250, 250); // Adjusted padding
        if (canvas.width !== newWidth) canvas.width = newWidth;
        if (canvas.height !== newHeight) canvas.height = newHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cancel any previous animation frame before starting a new one
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
    }

    if (challenge && challenge.visualFeedback) {
      // The visualFeedback function is now responsible for its own animation loop
      // and should use the setAnimFrameId callback it receives to store the frame ID.
      // We pass a function to visualFeedback so it can update our ref.
      challenge.visualFeedback(canvas, {
        codeToVisualize: codeForVisuals, // This is the successfully evaluated code
        studentOriginalCode: studentOriginalCode, // This is the raw code from the editor
        passed: lastEvaluationPassed === true, 
        message: lastEvaluationMessage || undefined,
        evaluatedValue: lastEvaluationValue, 
      }/*, (id: number | null) => { // This callback was part of createAnimatedVisualFeedback logic
          animationFrameIdRef.current = id;
         }*/ // The visualFeedback itself now manages its animation id via the `setAnimFrameId` it receives from `createAnimatedVisualFeedback`
      );
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a202c"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "18px 'VT323', monospace";
      ctx.fillStyle = "#a0aec0"; 
      ctx.textAlign = "center";
      if (challenge) {
        ctx.fillText("This realm has no visual enchantments.", canvas.width / 2, canvas.height / 2);
      } else {
        ctx.fillText("The Enchanted Canvas Awaits Thy Spell...", canvas.width / 2, canvas.height / 2);
      }
    }
    // Cleanup function to cancel animation when component unmounts or challenge changes
    return () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
    };
  // Ensure re-render on all relevant prop changes, especially lastEvaluation* which signals new state for visuals
  }, [challenge, studentOriginalCode, codeForVisuals, lastEvaluationPassed, lastEvaluationMessage, lastEvaluationValue, canvasRef]); 

  return (
    <canvas 
        ref={canvasRef} 
        id="game-canvas" 
        className="border-2 border-gray-600 rounded-md shadow-xl bg-[#10151f]" // Slightly darker bg for canvas itself
        // Width and height are now set dynamically in useEffect
    ></canvas>
  );
};

export default GameCanvas;