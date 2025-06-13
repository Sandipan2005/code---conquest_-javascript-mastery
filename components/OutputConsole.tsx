
import React, { useRef, useEffect } from 'react';
import { FeedbackMessage, FeedbackType } from '../types';

interface OutputConsoleProps {
  logs: FeedbackMessage[];
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ logs }) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogColor = (type: FeedbackType): string => {
    switch (type) {
      case FeedbackType.ERROR: return 'text-red-400';
      case FeedbackType.SUCCESS: return 'text-green-400';
      case FeedbackType.INFO: return 'text-blue-300';
      case FeedbackType.HINT: return 'text-yellow-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="h-full console-bg p-3 rounded-lg shadow-inner overflow-y-auto font-mono text-xs">
      <h4 className="text-sm text-gray-400 mb-2 sticky top-0 bg-gray-800 py-1">Sorcerer's Orb (Console Output):</h4>
      {logs.map((log) => (
        <div key={log.id} className={`py-0.5 ${getLogColor(log.type)} whitespace-pre-wrap`}>
          <span className="mr-1">&gt;</span>{log.text}
        </div>
      ))}
      <div ref={consoleEndRef} />
    </div>
  );
};

export default OutputConsole;
