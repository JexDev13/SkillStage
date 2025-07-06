import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Exercise, Question } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ExercisePlayerProps {
  exercise: Exercise;
  onComplete: () => void;
  onBack: () => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exercise,
  onComplete,
  onBack
}) => {
  const { updateProgress } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(
    exercise.questions.map(q => ({ ...q, userAnswer: undefined, isChecked: false, isCorrect: false }))
  );
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (currentQuestion.isChecked) return;

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer
    };
    setQuestions(updatedQuestions);
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion.userAnswer) {
      toast.error('Please select an answer first');
      return;
    }

    const isCorrect = currentQuestion.userAnswer === currentQuestion.correctAnswer;
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      isChecked: true,
      isCorrect
    };
    setQuestions(updatedQuestions);

    if (isCorrect) {
      toast.success('Correct!');
    } else {
      toast.error('Incorrect. Check the explanation below.');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinishExercise();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishExercise = () => {
    // Check if all answered questions have been checked
    const answeredQuestions = questions.filter(q => q.userAnswer);
    const uncheckedAnswers = answeredQuestions.filter(q => !q.isChecked);

    if (uncheckedAnswers.length > 0) {
      // Auto-check unchecked answers
      const updatedQuestions = questions.map(q => {
        if (q.userAnswer && !q.isChecked) {
          return {
            ...q,
            isChecked: true,
            isCorrect: q.userAnswer === q.correctAnswer
          };
        }
        return q;
      });
      setQuestions(updatedQuestions);
      toast.info('Checking remaining answers...');
      setTimeout(() => setShowResults(true), 1000);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    const answeredQuestions = questions.filter(q => q.userAnswer);
    const correctAnswers = answeredQuestions.filter(q => q.isCorrect);
    return {
      score: correctAnswers.length,
      totalQuestions: answeredQuestions.length,
      percentage: answeredQuestions.length > 0 ? Math.round((correctAnswers.length / answeredQuestions.length) * 100) : 0
    };
  };

  const handleCompleteExercise = () => {
    const scoreData = calculateScore();
    updateProgress(exercise.unitId, exercise.id, {
      score: scoreData.score,
      totalQuestions: scoreData.totalQuestions,
      completedAt: new Date(),
      attempts: 1
    });
    
    toast.success(`Exercise completed! Score: ${scoreData.percentage}%`);
    onComplete();
  };

  if (showResults) {
    const scoreData = calculateScore();
    
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white ${
                scoreData.percentage >= 80 ? 'bg-green-500' : scoreData.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {scoreData.percentage}%
              </div>
              
              <h2 className="text-2xl font-bold text-[#1ea5b9] mb-2">Exercise Complete!</h2>
              <p className="text-gray-600">
                You got {scoreData.score} out of {scoreData.totalQuestions} questions correct
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {questions.filter(q => q.userAnswer).map((question, index) => (
                <div key={question.id} className="text-left p-4 border rounded-lg">
                  <div className="flex items-start space-x-2 mb-2">
                    {question.isCorrect ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{question.text}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer: <span className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {question.userAnswer}
                        </span>
                      </p>
                      {!question.isCorrect && (
                        <p className="text-sm text-green-600 mt-1">
                          Correct answer: {question.correctAnswer}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2 italic">{question.explanation}</p>
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
                  setQuestions(exercise.questions.map(q => ({ ...q, userAnswer: undefined, isChecked: false, isCorrect: false })));
                  setShowResults(false);
                }}
              >
                Try Again
              </Button>
              <Button
                onClick={handleCompleteExercise}
                className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
              >
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-[#1ea5b9] hover:bg-[#1ea5b9]/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Instructions
        </Button>
        
        <div className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#1ea5b9] mb-6">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = currentQuestion.userAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showCorrectness = currentQuestion.isChecked;
                
                let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all ";
                
                if (showCorrectness) {
                  if (isCorrect) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                  }
                } else if (isSelected) {
                  buttonClass += "border-[#1ea5b9] bg-[#1ea5b9]/10 text-[#1ea5b9]";
                } else {
                  buttonClass += "border-gray-200 hover:border-[#1ea5b9]/50 hover:bg-[#1ea5b9]/5";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={currentQuestion.isChecked}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showCorrectness && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                      {showCorrectness && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {currentQuestion.isChecked && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-3">
              {!currentQuestion.isChecked && currentQuestion.userAnswer && (
                <Button
                  onClick={handleCheckAnswer}
                  className="bg-[#ff852e] hover:bg-[#ff852e]/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Check Answer
                </Button>
              )}

              {currentQuestion.isChecked && (
                <Button
                  onClick={handleNext}
                  className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
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