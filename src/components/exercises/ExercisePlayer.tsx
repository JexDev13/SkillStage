import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';


interface Game {
  game_id: string;
  type: string;
  title: string;
  instructions: string;
  question?: string;
  question_template?: string;
  options?: string[];
  correct_answer?: string;
  answer?: string;
  audio_file?: string;
  sentence_to_repeat?: string;
  audio_model_file?: string;
  justification?: string;
}

interface Exercise {
  id: string;
  unitId: number;
  unitTitle: string;
  subtopicId: string;
  subtopicTitle: string;
  title: string;
  instructions: string;
  description: string;
  questions: Game[];
  isLocked: boolean;
}

interface ExercisePlayerProps {
  exercise: Exercise;
  onComplete: () => void;
  onBack: () => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({ exercise, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(0);

  const currentQuestion = exercise.questions[currentQuestionIndex];

  // Cronómetro
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset selección y check cuando cambia pregunta
  useEffect(() => {
    setSelectedAnswer(null);
    setChecked(false);
    setIsCorrect(null);
  }, [currentQuestionIndex]);

  // Formatear tiempo
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Función para checkear respuesta en opción múltiple o listening_multiple_choice
  const checkAnswer = () => {
    if (!selectedAnswer) return;
    let correctAnswer = currentQuestion.answer ?? currentQuestion.correct_answer ?? '';
    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    setChecked(true);
  };

  // Función para pasar a siguiente pregunta o mostrar resultados
  const nextQuestion = () => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  // Render de contenido según tipo de pregunta
  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
      case 'listening_multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const showCorrectness = checked;
              const correctAnswer = currentQuestion.answer ?? currentQuestion.correct_answer ?? '';

              let btnClass = 'w-full p-4 text-left border-2 rounded-lg transition-colors ';
              if (showCorrectness) {
                if (option === correctAnswer) {
                  btnClass += 'border-green-500 bg-green-50 text-green-800';
                } else if (isSelected && option !== correctAnswer) {
                  btnClass += 'border-red-500 bg-red-50 text-red-800';
                } else {
                  btnClass += 'border-gray-200 bg-gray-50 text-gray-600';
                }
              } else if (isSelected) {
                btnClass += 'border-[#1ea5b9] bg-[#1ea5b9]/10 text-[#1ea5b9]';
              } else {
                btnClass += 'border-gray-300 hover:border-[#1ea5b9] hover:bg-[#1ea5b9]/5';
              }

              return (
                <button
                  key={idx}
                  className={btnClass}
                  disabled={checked}
                  onClick={() => !checked && setSelectedAnswer(option)}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showCorrectness && option === correctAnswer && <Check className="h-5 w-5 text-green-500" />}
                    {showCorrectness && isSelected && option !== correctAnswer && <X className="h-5 w-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'drag_and_drop':
        // Simple placeholder para drag and drop
        return (
          <div>
            <p className="font-semibold mb-2">Build the sentence:</p>
            <p className="mb-4">{currentQuestion.question_template}</p>
            <p className="italic text-gray-600">Drag & Drop UI not implemented yet.</p>
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
              onChange={e => setSelectedAnswer(e.target.value)}
              rows={3}
              disabled={checked}
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
          <h3 className="text-xl font-semibold text-[#1ea5b9] mb-2">{currentQuestion.title}</h3>
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
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-3">
              {!checked && (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'listening_multiple_choice') && (
                <Button
                  disabled={!selectedAnswer}
                  onClick={checkAnswer}
                  className="bg-[#ff852e] hover:bg-[#ff852e]/90"
                >
                  Check Answer
                </Button>
              )}

              {checked && (
                <Button
                  onClick={nextQuestion}
                  className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
                >
                  {currentQuestionIndex === exercise.questions.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {/* Para tipos sin check (listening_writing, speaking_repetition), solo Next */}
              {(currentQuestion.type === 'listening_writing' || currentQuestion.type === 'speaking_repetition') && (
                <Button
                  disabled={currentQuestion.type === 'listening_writing' && !selectedAnswer}
                  onClick={nextQuestion}
                  className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
                >
                  {currentQuestionIndex === exercise.questions.length - 1 ? 'Finish' : 'Next'}
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
