import React, { useState } from 'react';
import { Play, Lock, Trophy, Clock, Check } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ExercisePlayer } from './ExercisePlayer';
import { useAuth } from '../../contexts/AuthContext';
import unitsData from '../../../public/data/games_units.json';
import { Exercise, Unit } from '../../types';
import { parseUnitsToExercises } from '../../utils/parseExercises';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion';
import { cn } from '../../lib/utils';

interface ExerciseSectionProps {
  selectedExercise: Exercise | null;
  onExerciseSelect: (exercise: Exercise) => void;
  onBackToExercises: () => void;
}

export const ExerciseSection: React.FC<ExerciseSectionProps> = ({
  selectedExercise,
  onExerciseSelect,
  onBackToExercises,
}) => {
  const { user } = useAuth();
  const [showInstructions, setShowInstructions] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState<string>('');

  const units: Unit[] = unitsData as Unit[];

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
                {selectedExercise.questions.length} question
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1ea5b9] mb-4">Practice Exercises</h1>
        <p className="text-gray-600">Test your knowledge with interactive exercises</p>
      </div>

      <div className="space-y-8">
        {units.map((unit) => {
          const unitExercises = parseUnitsToExercises([unit]);
          const isUnitLocked = unit.subtopics.every((s) => s.is_locked);

          return (
            <Card key={unit.unit_id} className="border-2 hover:border-[#1ea5b9]/30 transition-colors">
              <CardContent className="p-0">
                <Accordion
                  type="single"
                  collapsible
                  value={expandedUnit}
                  onValueChange={setExpandedUnit}
                >
                  <AccordionItem value={unit.unit_id.toString()} className="border-none">
                    <AccordionTrigger
                      className={`px-6 py-4 hover:no-underline ${isUnitLocked ? 'opacity-50' : ''}`}
                      disabled={isUnitLocked}
                    >
                      <div className="flex items-center space-x-4">
                        {unit.isUnitCompleted ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : isUnitLocked ? (
                          <Lock className="h-5 w-5 text-gray-400" />
                        ) : null}

                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-[#1ea5b9]">{unit.unit_title}</h3>
                          <p className="text-sm text-gray-600">{unitExercises[0].description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {unitExercises.map((exercise) => {
                          const score = user?.progress.exerciseScores[exercise.id];
                          const isLocked = exercise.isLocked;

                          return (
                            <Card
                              key={exercise.id}
                              className={cn(
                                "border transition-colors flex flex-col justify-between h-auto",
                                isLocked
                                  ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-60"
                                  : "hover:border-[#ff852e]"
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-[#1ea5b9] mb-1">{exercise.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{exercise.description}</p>
                                  </div>

                                  {score && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                      <Trophy className="h-4 w-4 text-[#ff852e]" />
                                      <span className="font-medium">
                                        {Math.round((score.score / score.totalQuestions) * 100)}%
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm text-gray-500">
                                    {exercise.questions.length} question
                                    {exercise.questions.length !== 1 ? 's' : ''}
                                  </span>

                                  {exercise.isLocked ? (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <Play className="h-5 w-5 text-[#ff852e]" />
                                  )}
                                </div>

                                {!exercise.isLocked && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-4 border-[#ff852e] text-[#ff852e] hover:bg-[#ff852e] hover:text-white"
                                    onClick={() => onExerciseSelect(exercise)}
                                  >
                                    {score ? 'Practice Again' : 'Start Exercise'}
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};