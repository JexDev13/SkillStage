import React, { useState, useEffect } from 'react';
import { Play, Lock, Trophy, Clock, Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ExercisePlayer } from './ExercisePlayer';
import { useAuth } from '../../contexts/AuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../ui/accordion';
import { cn } from '../../lib/utils';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { GrammarSubtopic, Game } from '../../types';

interface ExerciseSectionProps {
  selectedExercise: any;
  onExerciseSelect: (exercise: any) => void;
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
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const unitSnapshot = await getDocs(collection(db, 'grammar_units'));

      const unitsData = await Promise.all(
        unitSnapshot.docs.map(async (unitDoc) => {
          const unitData = unitDoc.data();
          const id = unitDoc.id;
          const progressDocRef = collection(db, `users/${user.uid}/user_progress`);
          const userProgressSnapshot = await getDocs(progressDocRef);
          const userProgressDocs = userProgressSnapshot.docs.map((d) => d.data());
          const userUnitProgress = userProgressDocs.find((p) => p.id === id);
          const progressMap: Record<string, any> = {};
          if (userUnitProgress) {
            for (const sub of userUnitProgress.subtopics || []) {
              progressMap[sub.id] = sub;
            }
          }

          const subtopicsSnapshot = await getDocs(
            collection(db, `grammar_units/${id}/subtopics`)
          );

          const subtopics = await Promise.all(
            subtopicsSnapshot.docs.map(async (subDoc) => {
              const subData = subDoc.data();
              const gamesSnapshot = await getDocs(
                collection(db, `grammar_units/${id}/subtopics/${subDoc.id}/games`)
              );

              const games = gamesSnapshot.docs.map((g) => ({
                ...g.data(),
                game_id: g.id,
              })) as Game[];

              const subId = subDoc.id;
              const progress = progressMap[subId] || { isLocked: true, isCompleted: false };

              return {
                ...subData,
                id: subId,
                games,
                isLocked: progress.isLocked,
                isCompleted: progress.isCompleted,
                score: progress.score || 0,
              } as GrammarSubtopic;
            })
          );

          return {
            id: id,
            title: unitData.title,
            description: unitData.description,
            isUnitCompleted: userUnitProgress?.isUnitCompleted || false,
            subtopics,
          };
        })
      );

      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = async () => {
    onBackToExercises();
    await fetchData();
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 text-[#1ea5b9] animate-spin" />
      </div>
    );
  }

  if (selectedExercise && !showInstructions) {
    return (
      <DndProvider backend={HTML5Backend}>
        <ExercisePlayer
          exercise={{ ...selectedExercise, unitId: selectedExercise.unitId }}
          onComplete={handleExerciseComplete}
          onBack={() => setShowInstructions(true)}
        />
      </DndProvider>
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
              <p className="text-gray-700 leading-relaxed">
                Complete all the games in this subtopic to master the subject!
              </p>
            </div>

            <Button
              onClick={() => setShowInstructions(false)}
              className="bg-[#ff852e] hover:bg-[#ff852e]/90 text-white px-8 py-3 text-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {selectedExercise.score != 0 ? 'Play Again' : 'Start Game'}
            </Button>
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

      <div className="space-y-4">
        {units.map((unit) => {
          const isUnitLocked = unit.subtopics.every((s: { isLocked: boolean }) => s.isLocked);

          return (
            <Card key={unit.id} className="border-2 hover:border-[#1ea5b9]/30 transition-colors">
              <CardContent className="p-0">
                <Accordion
                  type="single"
                  collapsible
                  value={expandedUnit}
                  onValueChange={setExpandedUnit}
                >
                  <AccordionItem value={unit.id.toString()} className="border-none">
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
                          <h3 className="text-lg font-semibold text-[#1ea5b9]">{unit.title}</h3>
                          <p className="text-sm text-gray-600 font-normal">{unit.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {unit.subtopics.map((subtopic: GrammarSubtopic) => {
                          const subtopicExercise = {
                            id: subtopic.id,
                            title: subtopic.title,
                            description: subtopic.description,
                            instructions: subtopic.description,
                            questions: subtopic.games,
                            isLocked: subtopic.isLocked,
                          };

                          const isSubtopicCompleted = subtopic.isCompleted;
                          const score = subtopic.score;

                          return (
                            <Card
                              key={subtopicExercise.id}
                              className={cn(
                                'border-2 transition-colors',
                                subtopicExercise.isLocked
                                  ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-60'
                                  : 'hover:border-[#ff852e]'
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-[#1ea5b9] mb-1">
                                    {subtopicExercise.title}
                                  </h4>
                                  {score !== undefined && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                      <Trophy className="h-4 w-4 text-[#ff852e]" />
                                      <span className="font-medium">{score}%</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm text-gray-500">
                                    {subtopicExercise.questions.length} game
                                    {subtopicExercise.questions.length !== 1 ? 's' : ''}
                                  </span>

                                  {subtopicExercise.isLocked ? (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <Play className="h-5 w-5 text-[#ff852e]" />
                                  )}
                                </div>

                                {!subtopicExercise.isLocked && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-4 border-[#ff852e] text-[#ff852e] hover:bg-[#ff852e] hover:text-white"
                                    onClick={() => {
                                      onExerciseSelect({
                                        ...subtopic,
                                        unitId: unit.id,
                                      });
                                    }}
                                  >
                                    {isSubtopicCompleted ? 'Practice Again' : 'Start Game'}
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
