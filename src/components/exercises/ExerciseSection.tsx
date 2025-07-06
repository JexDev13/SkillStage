import React, { useState } from 'react';
import { Play, Lock, Trophy, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { exercises } from '../../data(deprecated)/exerciseData';
import { Exercise } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ExercisePlayer } from './ExercisePlayer';

interface ExerciseSectionProps {
  selectedExercise: Exercise | null;
  onExerciseSelect: (exercise: Exercise) => void;
  onBackToExercises: () => void;
}

export const ExerciseSection: React.FC<ExerciseSectionProps> = ({
  selectedExercise,
  onExerciseSelect,
  onBackToExercises
}) => {
  const { user } = useAuth();
  const [showInstructions, setShowInstructions] = useState(true);

  if (selectedExercise && !showInstructions) {
    return (
      <ExercisePlayer
        exercise={selectedExercise}
        onComplete={onBackToExercises}
        onBack={() => setShowInstructions(true)}
      />
    );
  }

  if (selectedExercise && showInstructions) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBackToExercises}
            className="text-[#1ea5b9] hover:bg-[#1ea5b9]/10"
          >
            ← Back to Exercises
          </Button>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Trophy className="h-16 w-16 text-[#ff852e] mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-[#1ea5b9] mb-2">
                {selectedExercise.title}
              </h1>
              <p className="text-gray-600 text-lg">{selectedExercise.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Instructions
              </h3>
              <p className="text-gray-700 leading-relaxed">{selectedExercise.instructions}</p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <div className="text-sm text-gray-600">
                {selectedExercise.questions.length} questions
              </div>
              <Button
                onClick={() => setShowInstructions(false)}
                className="bg-[#ff852e] hover:bg-[#ff852e]/90 text-white px-8 py-3 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group exercises by unit
  const exercisesByUnit = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.unitId]) {
      acc[exercise.unitId] = [];
    }
    acc[exercise.unitId].push(exercise);
    return acc;
  }, {} as Record<number, Exercise[]>);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1ea5b9] mb-4">Practice Exercises</h1>
        <p className="text-gray-600">Test your knowledge with interactive exercises</p>
      </div>

      <div className="space-y-8">
        {Object.entries(exercisesByUnit).map(([unitId, unitExercises]) => (
          <div key={unitId}>
            <h2 className="text-xl font-semibold text-[#1ea5b9] mb-4">
              Unit {unitId}
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unitExercises.map((exercise) => {
                const isLocked = exercise.isLocked;
                const score = user?.progress.exerciseScores[exercise.id];
                
                return (
                  <Card 
                    key={exercise.id} 
                    className={`border-2 transition-all duration-200 ${
                      isLocked 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-[#ff852e]/30 cursor-pointer hover:shadow-lg'
                    }`}
                    onClick={() => !isLocked && onExerciseSelect(exercise)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1ea5b9] mb-2">
                            {exercise.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {exercise.description}
                          </p>
                        </div>
                        
                        {isLocked ? (
                          <Lock className="h-5 w-5 text-gray-400 ml-2" />
                        ) : (
                          <Play className="h-5 w-5 text-[#ff852e] ml-2" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{exercise.questions.length} questions</span>
                        
                        {score && (
                          <div className="flex items-center space-x-1">
                            <Trophy className="h-4 w-4 text-[#ff852e]" />
                            <span className="font-medium">
                              {Math.round((score.score / score.totalQuestions) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {!isLocked && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4 border-[#ff852e] text-[#ff852e] hover:bg-[#ff852e] hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExerciseSelect(exercise);
                          }}
                        >
                          {score ? 'Practice Again' : 'Start Exercise'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};