import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Game } from '../../types';
import { Progress } from '../ui/progress';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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

// Interfaz para el estado local de cada pregunta, extendiendo Game para facilitar la referencia
interface QuestionState extends Game {
  userAnswer?: string;
  isChecked: boolean;
  isCorrect?: boolean;
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
  const [questionsState, setQuestionsState] = useState<QuestionState[]>(
    exercise.games.map(game => ({
      ...game,
      userAnswer: undefined,
      isChecked: false,
      isCorrect: undefined
    }))
  );
  const [timer, setTimer] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion: QuestionState = questionsState[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionsState.length) * 100;

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswerSelect = (answer: string) => {
    if (currentQuestion.isChecked) return;

    const updatedQuestionsState = [...questionsState];
    updatedQuestionsState[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer
    };
    setQuestionsState(updatedQuestionsState);
  };

  const checkAnswer = () => {
    if (!currentQuestion.userAnswer) {
      toast.error('Please select an answer first');
      return;
    }

    const correct = currentQuestion.answer === currentQuestion.userAnswer;
    const updatedQuestionsState = [...questionsState];
    updatedQuestionsState[currentQuestionIndex] = {
      ...currentQuestion,
      isChecked: true,
      isCorrect: correct
    };
    setQuestionsState(updatedQuestionsState);

    if (correct) {
      toast.success('Correct!');
    } else {
      toast.error('Incorrect. Check the explanation below.');
    }
  };

  const nextQuestion = () => {
    if (
      (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'listening_multiple_choice') &&
      !currentQuestion.isChecked
    ) {
      toast.error('Please check your answer first!');
      return;
    }

    if (currentQuestionIndex === questionsState.length - 1) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const source = result.source;
    const destination = result.destination;

    // Solo permitir mover de "options" a un "blank-*"
    if (source.droppableId === 'options' && destination.droppableId.startsWith('blank-')) {
      const blankId = destination.droppableId.replace('blank-', '');
      const draggedItem = currentQuestion.draggable_options[source.index];

      const updatedUserAnswer = currentQuestion.userAnswer
        ? JSON.parse(currentQuestion.userAnswer)
        : {};

      updatedUserAnswer[blankId] = draggedItem;

      const updatedQuestion: QuestionState = {
        ...currentQuestion,
        userAnswer: JSON.stringify(updatedUserAnswer)
      };

      const updatedQuestionsState = [...questionsState];
      updatedQuestionsState[currentQuestionIndex] = updatedQuestion;
      setQuestionsState(updatedQuestionsState);
    }
  };


  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
      case 'listening_multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = currentQuestion.userAnswer === opt;
              const isCorrectOption = opt === currentQuestion.answer;
              const showCorrectness = currentQuestion.isChecked;

              let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all flex items-center justify-between";

              if (showCorrectness) {
                if (isCorrectOption) {
                  buttonClass += " border-green-500 bg-green-50 text-green-800";
                } else if (isSelected && !isCorrectOption) {
                  buttonClass += " border-red-500 bg-red-50 text-red-800";
                } else {
                  buttonClass += " border-gray-200 bg-gray-50 text-gray-600";
                }
              } else if (isSelected) {
                buttonClass += " border-[#1ea5b9] bg-[#1ea5b9]/10 text-[#1ea5b9]";
              } else {
                buttonClass += " border-gray-200 hover:border-[#1ea5b9]/50 hover:bg-[#1ea5b9]/5";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(opt)}
                  disabled={currentQuestion.isChecked}
                  className={buttonClass}
                >
                  <span>{opt}</span>
                  {showCorrectness && isCorrectOption && <Check className="h-5 w-5 text-green-500" />}
                  {showCorrectness && isSelected && !isCorrectOption && <X className="h-5 w-5 text-red-500" />}
                </button>
              );
            })}
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
              value={currentQuestion.userAnswer || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        );

      case 'drag_and_drop':
        if (!currentQuestion.question) {
          return <p className="text-red-600">Missing question template for this drag-and-drop exercise.</p>;
        }

        const filledTemplate = currentQuestion.question.split(/(\[\[.*?\]\])/g).map((part, i) => {
          const match = part.match(/\[\[(.*?)\]\]/);
          if (match) {
            const blankId = match[1];
            const userAnswer = currentQuestion.userAnswer ? JSON.parse(currentQuestion.userAnswer)[blankId] : '';
            return (
              <Droppable droppableId={`blank-${blankId}`} direction="horizontal" key={i}>
                {(provided, snapshot) => (
                  <span
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="inline-block min-w-[80px] border-b-2 border-gray-400 mx-1 px-2 py-1 text-center bg-white"
                  >
                    {userAnswer || '____'}
                    {provided.placeholder}
                  </span>
                )}
              </Droppable>
            );
          } else {
            return <span key={i}>{part}</span>;
          }
        });

        return (
          <div>
            <p className="italic text-sm mb-4">Drag the options to the correct blanks.</p>
            <p className="mb-4">{filledTemplate}</p>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="options" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-wrap gap-2 bg-gray-100 p-4 rounded"
                  >
                    {currentQuestion.draggable_options?.map((opt, index) => (
                      <Draggable key={opt} draggableId={opt} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`px-4 py-2 rounded bg-white border shadow cursor-move ${snapshot.isDragging ? 'bg-blue-100' : ''
                              }`}
                          >
                            {opt}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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
    const correctCount = questionsState.filter(q => q.isCorrect).length;
    const answeredCount = questionsState.filter(q => q.userAnswer !== undefined).length;
    const percentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="mb-6">
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
            {percentage}%
          </div>
          <h2 className="text-2xl font-bold text-[#1ea5b9] mb-2">Exercise Complete! 🏆</h2>
          <p className="text-gray-600">You got {correctCount} out of {answeredCount} questions correct</p>
          <p className="mb-8">You completed the exercise in {formatTime(timer)}</p>
        </div>

        <div className="space-y-4 mb-8">
          {questionsState.filter(q => q.userAnswer !== undefined).map((question, index) => (
            <div key={question.game_id} className="text-left p-4 border rounded-lg">
              <div className="flex items-start space-x-2 mb-2">
                {question.isCorrect ? (
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{question.question || question.instructions}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your answer: <span className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {question.userAnswer}
                    </span>
                  </p>
                  {!question.isCorrect && (
                    <p className="text-sm text-green-600 mt-1">
                      Correct answer: {question.answer}
                    </p>
                  )}
                  {question.justification && (
                    <p className="text-sm text-gray-500 mt-2 italic">{question.justification}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentQuestionIndex(0);
              setQuestionsState(exercise.games.map(game => ({
                ...game,
                userAnswer: undefined,
                isChecked: false,
                isCorrect: undefined
              })));
              setShowResults(false);
              setTimer(0);
            }}
          >
            Try Again
          </Button>
          <Button onClick={onComplete} className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90">
            Continue Learning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center text-gray-600">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-1 text-[#1ea5b9] hover:bg-[#1ea5b9]/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Instructions</span>
        </Button>
        <div className="font-mono text-lg tracking-widest">{formatTime(timer)}</div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {questionsState.length}
        </div>
        <Progress value={progress} className="h-2 w-2/3" />
      </div>

      <Card className="shadow-lg border-none">
        <CardContent className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#1ea5b9] mb-6">
              {currentQuestion.instructions}
            </h2>
            {currentQuestion.question && <p className="mb-6">{currentQuestion.question}</p>}
            {renderQuestionContent()}
          </div>

          {currentQuestion.isChecked && currentQuestion.justification && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
              <p className="text-blue-700">{currentQuestion.justification}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex space-x-3">
              {!currentQuestion.isChecked &&
                (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'listening_multiple_choice') &&
                currentQuestion.userAnswer && (
                  <Button
                    onClick={checkAnswer}
                    className="bg-[#ff852e] hover:bg-[#ff852e]/90"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Check Answer
                  </Button>
                )}

              {currentQuestion.isChecked && (
                <Button
                  onClick={nextQuestion}
                  className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
                >
                  {currentQuestionIndex === questionsState.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {(!currentQuestion.isChecked &&
                (currentQuestion.type === 'listening_writing' ||
                  currentQuestion.type === 'speaking_repetition' ||
                  currentQuestion.type === 'drag_and_drop')) && (
                  <Button
                    onClick={nextQuestion}
                    className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
                    disabled={currentQuestion.type === 'listening_writing' && !currentQuestion.userAnswer}
                  >
                    {currentQuestionIndex === questionsState.length - 1 ? 'Finish' : 'Next'}
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