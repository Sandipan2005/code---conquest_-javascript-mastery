
import React from 'react';
import { FeedbackMessage, FeedbackType } from '../types';

interface FeedbackDisplayProps {
  messages: FeedbackMessage[];
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ messages }) => {
  if (messages.length === 0) {
    return null;
  }

  const getMessageStyle = (type: FeedbackType): string => {
    switch (type) {
      case FeedbackType.SUCCESS:
        return 'bg-green-700 border-green-500 text-green-100';
      case FeedbackType.ERROR:
        return 'bg-red-700 border-red-500 text-red-100';
      case FeedbackType.HINT:
        return 'bg-yellow-600 border-yellow-400 text-yellow-100';
      case FeedbackType.ANALYSIS: // New style for AI analysis
        return 'bg-purple-700 border-purple-500 text-purple-100';
      case FeedbackType.INFO:
      default:
        return 'bg-blue-700 border-blue-500 text-blue-100';
    }
  };

  return (
    <div className="my-2 space-y-2 max-h-40 overflow-y-auto pr-2" aria-label="Feedback Messages">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-3 border-l-4 rounded shadow ${getMessageStyle(msg.type)}`}
          role="alert"
          aria-live={msg.type === FeedbackType.ERROR || msg.type === FeedbackType.SUCCESS || msg.type === FeedbackType.ANALYSIS ? "assertive" : "polite"}
        >
          <p className="font-medium text-sm">{msg.text}</p>
        </div>
      ))}
    </div>
  );
};

export default FeedbackDisplay;
