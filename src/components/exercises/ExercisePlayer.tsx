import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Exercise } from '../../types';

interface ExercisePlayerProps {
  exercise: Exercise;
  onComplete: () => void;
  onBack: () => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({ exercise, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(0);

  // Estados nuevos para revisión y corrección
  const [reviewed, setReviewed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestion = exercise.questions[currentQuestionIndex];

  // Drag & Drop states
  const [dragOptions, setDragOptions] = useState<string[]>([]);
  const [answersMap, setAnswersMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedAnswer(null);
    setReviewed(false);
    setIsCorrect(null);

    if (currentQuestion.type === 'drag_and_drop') {
      setDragOptions(currentQuestion.draggable_options || []);
      setAnswersMap({});
    } else {
      setDragOptions([]);
      setAnswersMap({});
    }
  }, [currentQuestionIndex, currentQuestion]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Drag & Drop handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, word: string) => {
    e.dataTransfer.setData('text/plain', word);
  };

  const onDrop = (e: React.DragEvent<HTMLSpanElement>, blankId: string) => {
    e.preventDefault();
    const draggedWord = e.dataTransfer.getData('text/plain');

    if (Object.values(answersMap).includes(draggedWord)) return;

    setAnswersMap(prev => ({ ...prev, [blankId]: draggedWord }));
    setDragOptions(prev => prev.filter(w => w !== draggedWord));
  };

  const onDragOver = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();
  };

  const removeAnswer = (blankId: string) => {
    const removedWord = answersMap[blankId];
    setAnswersMap(prev => {
      const copy = { ...prev };
      delete copy[blankId];
      return copy;
    });
    setDragOptions(prev => [...prev, removedWord]);
  };

  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div>
            <p className="mb-4 font-semibold">{currentQuestion.question}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, idx: number) => {
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={idx}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-colors
                    ${isSelected ? 'border-[#1ea5b9] bg-[#1ea5b9]/10 text-[#1ea5b9]' : 'border-gray-300 hover:border-[#1ea5b9] hover:bg-[#1ea5b9]/5'}`}
                    onClick={() => !reviewed && setSelectedAnswer(option)}
                    disabled={reviewed} // evitar cambiar respuesta tras revisar
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'drag_and_drop':
        return (
          <div>
            <p className="mb-2 font-semibold">Build the sentence:</p>
            <p className="mb-6 text-lg">
              {currentQuestion.question_template.split('___').map((part: string, index: number) => {
                if (index === currentQuestion.question_template.split('___').length - 1) {
                  return <span key={index}>{part}</span>;
                }
                const blankId = currentQuestion.blanks[index]?.id || `blank-${index}`;
                const word = answersMap[blankId];

                return (
                  <span
                    key={blankId}
                    onDrop={(e) => !reviewed && onDrop(e, blankId)}
                    onDragOver={onDragOver}
                    className="inline-block min-w-[80px] min-h-[30px] border-b-2 border-gray-400 mx-1 px-2 cursor-pointer select-none"
                    title={word ? 'Click to remove' : 'Drop word here'}
                    onClick={() => !reviewed && word && removeAnswer(blankId)}
                    style={{ backgroundColor: word ? '#a0d8ef' : 'transparent' }}
                  >
                    {word || '\u00A0'}
                  </span>
                );
              })}
            </p>

            <div className="mb-2 font-semibold">Drag these words:</div>
            <div className="flex flex-wrap gap-3">
              {dragOptions.map((word: string) => (
                <div
                  key={word}
                  draggable={!reviewed}
                  onDragStart={(e) => onDragStart(e, word)}
                  className={`cursor-grab select-none rounded border border-gray-300 px-3 py-1 bg-white shadow-sm transition
                    ${reviewed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1ea5b9] hover:text-white'}`}
                >
                  {word}
                </div>
              ))}
              {dragOptions.length === 0 && <p className="text-gray-500 italic">All words placed.</p>}
            </div>
          </div>
        );

      case 'listening_multiple_choice':
        return (
          <div>
            {currentQuestion.audio_file && (
              <audio controls className="mb-4 w-full">
                <source src={currentQuestion.audio_file} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            <p className="mb-3">{currentQuestion.question}</p>
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedAnswer === option;
              return (
                <button
                  key={idx}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-colors
                    ${isSelected ? 'border-[#1ea5b9] bg-[#1ea5b9]/10 text-[#1ea5b9]' : 'border-gray-300 hover:border-[#1ea5b9] hover:bg-[#1ea5b9]/5'}`}
                  onClick={() => !reviewed && setSelectedAnswer(option)}
                  disabled={reviewed}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );

      case 'listening_writing':
        return (
          <div>
            {currentQuestion.audio_file && (
              <audio controls className="mb-4 w-full">
                <source src={currentQuestion.audio_file} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            <p className="mb-3">{currentQuestion.question}</p>
            <textarea
              className="w-full border rounded p-2"
              placeholder="Write your answer here"
              value={selectedAnswer || ''}
              onChange={e => !reviewed && setSelectedAnswer(e.target.value)}
              rows={3}
              disabled={reviewed}
            />
          </div>
        );

      case 'speaking_repetition':
        return (
          <div>
            <p className="mb-3">{currentQuestion.instructions}</p>
            <p className="mb-3 italic font-semibold">Sentence to repeat:</p>
            <p className="mb-6 text-lg font-semibold">{currentQuestion.sentence_to_repeat}</p>
            <audio controls className="mb-4 w-full">
              <source src={currentQuestion.audio_model_file} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-gray-600 italic">(Recording and pronunciation evaluation not implemented)</p>
          </div>
        );

      default:
        return <p>Unknown question type: {currentQuestion.type}</p>;
    }
  };

  const checkAnswer = () => {
    let correct = false;
    switch (currentQuestion.type) {
      case 'multiple_choice':
      case 'listening_multiple_choice':
        correct = selectedAnswer === currentQuestion.correct_answer;
        break;
      case 'listening_writing':
        correct = selectedAnswer?.trim().toLowerCase() === currentQuestion.correct_answer?.trim().toLowerCase();
        break;
      case 'drag_and_drop':
        correct = currentQuestion.blanks.every(
          (blank: any) => answersMap[blank.id] === blank.correct_word
        );
        break;
      default:
        correct = false;
    }
    setIsCorrect(correct);
    setReviewed(true);
  };

  const resetTry = () => {
    setReviewed(false);
    setIsCorrect(null);
    setSelectedAnswer(null);
    if (currentQuestion.type === 'drag_and_drop') {
      setDragOptions(currentQuestion.draggable_options || []);
      setAnswersMap({});
    }
  };

  const handleNextClick = () => {
    resetTry();
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1ea5b9] mb-4">Exercise Finished</h2>
        <p className="mb-8">You finished the exercise in {formatTime(timer)}</p>
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
          <h3 className="text-xl font-semibold text-[#1ea5b9] mb-6">{currentQuestion.title}</h3>
          <p className="mb-4 font-semibold">{currentQuestion.instructions}</p>

          {renderQuestionContent()}

          <div className="mt-6 flex justify-between items-center">
            <Button
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={() => {
                resetTry();
                setCurrentQuestionIndex(currentQuestionIndex - 1);
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-4">
              {!reviewed ? (
                <Button
                  disabled={
                    (currentQuestion.type !== 'listening_writing' && currentQuestion.type !== 'speaking_repetition')
                      ? (!selectedAnswer && currentQuestion.type !== 'drag_and_drop')
                      : false
                  }
                  onClick={checkAnswer}
                  className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
                >
                  Review Answer
                </Button>
              ) : (
                <>
                  <div
                    className={`flex items-center font-semibold ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isCorrect ? 'Correct ✔' : 'Incorrect ✘'}
                  </div>

                  {!isCorrect && (
                    <Button onClick={resetTry} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                      Try Again
                    </Button>
                  )}

                  <Button onClick={handleNextClick} className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90">
                    {currentQuestionIndex === exercise.questions.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
