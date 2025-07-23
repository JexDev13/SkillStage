import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropResult } from 'react-beautiful-dnd';
import { Game } from '../../types';

interface ExercisePlayerProps {
  exercise: {
    id: string;
    unitId: string;
    title: string;
    games: Game[];
  };
  onComplete: () => void;
  onBack: () => void;
}

interface GameProgress {
  completed: boolean;
  score?: number;
  attempts?: number;
  completedAt?: string;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exercise,
  onComplete,
  onBack,
}) => {

  if (!exercise?.games || exercise.games.length === 0) {
    return <div className="p-4">No exercises available.</div>;
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion: Game = exercise.games[currentQuestionIndex];

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedAnswer(null);
    setChecked(false);
    setIsCorrect(null);
  }, [currentQuestionIndex]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const checkAnswer = () => {
    if (!selectedAnswer || (currentQuestion.type !== 'multiple_choice' && currentQuestion.type !== 'listening_multiple_choice')) return;
    const correct = currentQuestion.answer === selectedAnswer;
    setIsCorrect(correct);
    setChecked(true);
  };

  const nextQuestion = () => {
    const gameProgress: GameProgress = {
      completed: true,
      attempts: 1,
      score: isCorrect ? 100 : 0,
      completedAt: new Date().toISOString(),
    };

    // You could save progress here with updateProgress()

    if (currentQuestionIndex === exercise.games.length - 1) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    // To be implemented for drag and drop
  };

  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
      case 'listening_multiple_choice':
        return (
          <div className="space-y-2">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(opt)}
                className={`block w-full text-left p-3 border rounded ${selectedAnswer === opt
                  ? 'border-[#1ea5b9] bg-[#1ea5b9]/10'
                  : 'border-gray-300 hover:border-[#1ea5b9]'
                  }`}
              >
                {opt}
              </button>
            ))}
            {checked && (
              <div className={`mt-4 font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect
                  ? currentQuestion.correct_feedback || 'Correct!'
                  : currentQuestion.incorrect_feedback || 'Incorrect.'}
              </div>
            )}
          </div>
        );

      case 'listening_writing':
        return (
          <div>
            {currentQuestion.audio_file && (
              <audio src={currentQuestion.audio_file} controls className="mb-4" />
            )}
            <textarea
              placeholder="Write your answer..."
              value={selectedAnswer || ''}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        );

      case 'drag_and_drop':
        return (
          <div>
            <p className="italic text-sm mb-2">Drag the options to the correct spots.</p>
            {/* Drag & Drop component goes here */}
          </div>
        );

      case 'speaking_repetition':
        return (
          <div>
            <p className="mb-2">{currentQuestion.sentence_to_repeat}</p>
            {currentQuestion.audio_model_file && <audio src={currentQuestion.audio_model_file} controls />}
            <p className="text-sm italic mt-2 text-gray-500">Record your voice and compare it with the model.</p>
          </div>
        );

      default:
        return <p>Unsupported question type: {currentQuestion.type}</p>;
    }
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1ea5b9] mb-4">Exercise Completed! 🏆</h2>
        <p className="mb-8">You completed the exercise in {formatTime(timer)}</p>
        <Button onClick={onComplete} className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90">
          Back to Exercises
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center text-gray-600">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Instructions</span>
        </Button>
        <div className="font-mono text-lg tracking-widest">{formatTime(timer)}</div>
      </div>

      <Card className="shadow-lg border-none">
        <CardContent>
          <h3 className="text-xl font-semibold text-[#1ea5b9] mb-2">{exercise.title}</h3>
          <p className="mb-6 font-semibold">{currentQuestion.instructions}</p>
          {currentQuestion.question && <p className="mb-6">{currentQuestion.question}</p>}
          {renderQuestionContent()}
          {checked && currentQuestion.justification && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
              <p className="text-blue-700">{currentQuestion.justification}</p>
            </div>
          )}
          <div className="mt-6 flex justify-between items-center">
            <Button
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => i - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex space-x-3">
              {!checked &&
                (currentQuestion.type === 'multiple_choice' ||
                  currentQuestion.type === 'listening_multiple_choice') && (
                  <Button
                    disabled={!selectedAnswer}
                    onClick={checkAnswer}
                    className="bg-[#ff852e] hover:bg-[#ff852e]/90"
                  >
                    Check Answer
                  </Button>
                )}
              {(checked ||
                currentQuestion.type === 'listening_writing' ||
                currentQuestion.type === 'speaking_repetition' ||
                currentQuestion.type === 'drag_and_drop') && (
                  <Button
                    disabled={currentQuestion.type === 'listening_writing' && !selectedAnswer && !checked}
                    onClick={nextQuestion}
                    className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
                  >
                    {currentQuestionIndex === exercise.games.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
