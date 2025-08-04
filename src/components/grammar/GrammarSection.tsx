import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Check, ChevronRight, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../ui/accordion';
import { useAuth } from '../../contexts/AuthContext';
import { GrammarSubtopic, GrammarUnit } from '../../types';

interface GrammarSectionProps {
  selectedTopic: GrammarSubtopic | null;
  onTopicSelect: (topic: GrammarSubtopic) => void;
  onBackToUnits: () => void;
}

export const GrammarSection: React.FC<GrammarSectionProps> = ({
  selectedTopic,
  onTopicSelect,
  onBackToUnits
}) => {
  const { user } = useAuth();
  const [expandedUnit, setExpandedUnit] = useState<string>('');
  const [grammarUnits, setGrammarUnits] = useState<GrammarUnit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const unitsSnapshot = await getDocs(collection(db, 'grammar_units'));
        const userProgressSnapshot = await getDocs(collection(db, 'users', user.uid, 'user_progress'));
        const userProgressMap: Record<string, any> = {};
        userProgressSnapshot.docs.forEach(doc => {
          userProgressMap[doc.id] = doc.data();
        });

        const unitsData: GrammarUnit[] = await Promise.all(
          unitsSnapshot.docs.map(async (unitDoc) => {
            const id = unitDoc.id;
            const unitData = unitDoc.data();

            const unitProgress = userProgressMap[id];

            const subtopicsSnapshot = await getDocs(
              collection(db, `grammar_units/${id}/subtopics`)
            );

            const subtopics: GrammarSubtopic[] = subtopicsSnapshot.docs.map((subDoc) => {
              const subData = subDoc.data();
              const subId = subDoc.id;

              const progressArray = unitProgress?.subtopics ?? [];
              const progressSub = progressArray.find((s: any) => s.id === subId);

              return {
                id: subId,
                title: subData.title,
                description: subData.description,
                usage: subData.usage,
                examples: subData.examples || [],
                image: subData.image,
                games: subData.games || [],
                isLocked: progressSub ? progressSub.isLocked : true,
                isCompleted: progressSub ? progressSub.isCompleted : false,
                score: progressSub ? progressSub.score : 0
              };
            });

            return {
              id: parseInt(id),
              title: unitData.title,
              description: unitData.description,
              isUnitCompleted: unitProgress?.isUnitCompleted ?? false,
              subtopics,
            };
          })
        );

        setGrammarUnits(unitsData);
      } catch (error) {
        console.error('Error loading grammar units:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 text-[#1ea5b9] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">You need to be logged in to see this content.</p>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            tabIndex={0}
            variant="ghost"
            onClick={onBackToUnits}
            className="text-[#1ea5b9] hover:bg-[#1ea5b9]/10"
            aria-label="Back to Units"
          >
            ← Back to Units
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div tabIndex={0} aria-label={selectedTopic.title}>
                <h1 className="text-3xl font-bold text-[#1ea5b9] mb-2">
                  {selectedTopic.title.toUpperCase()}
                </h1>
                <div className="w-full h-1 bg-[#1ea5b9] rounded mb-4"></div>
              </div>

              {selectedTopic.image && (
                <div tabIndex={0} aria-label="Grammar illustration" className="hidden lg:block">
                  <img
                    src={selectedTopic.image}
                    alt="Chart of Present Perfect tense: affirmative, negative, and questions with have/has and past participle"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              )}
            </div>

            <div tabIndex={0} aria-label={`Description: ${selectedTopic.description}. Usage: ${selectedTopic.usage}`} className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
              <p><strong>Description:</strong> {selectedTopic.description}</p>
              <p><strong>Usage:</strong> {selectedTopic.usage}</p>
            </div>

            {(selectedTopic.examples?.length ?? 0) > 0 && (
              <div tabIndex={0} aria-label="Examples" className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4">Examples:</h3>
                <ul className="space-y-2">
                  {selectedTopic.examples?.map((example, index) => (
                    <li key={index} tabIndex={0} aria-label={example} className="flex items-center space-x-2">
                      <ChevronRight className="h-4 w-4 text-[#ff852e]" />
                      <span className="italic">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div  className="mb-8 text-center">
        <h1  tabIndex={0} aria-label="Grammar Units"className="text-3xl font-bold text-[#1ea5b9] mb-4">Grammar Units</h1>
        <p tabIndex={0} aria-label="Select a unit to explore grammar topics" className="text-gray-600">Select a unit to explore grammar topics</p>
      </div>

      <div className="space-y-4">
        {grammarUnits.map((unit) => {
          const isLocked = unit.subtopics.every((t) => t.isLocked);

          return (
            <Card
              key={unit.id}
              aria-label={unit.title}
              className="border-2 hover:border-[#1ea5b9]/30 transition-colors"
            >
              <CardContent  className="p-0">
                <Accordion
                  type="single"
                  collapsible
                  value={expandedUnit}
                  onValueChange={setExpandedUnit}
                >
                  <AccordionItem value={unit.id.toString()} className="border-none">
                    <AccordionTrigger
                      className={`px-6 py-4 hover:no-underline ${isLocked ? 'opacity-50' : ''}`}
                      disabled={isLocked}
                    >
                      <div className="flex items-center space-x-4">
                        {unit.isUnitCompleted ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="h-5 w-5 text-gray-400" />
                        ) : null}

                        <div className="text-left">
                          <h3 tabIndex={0} aria-label={unit.title} className="text-lg font-semibold text-[#1ea5b9]">{unit.title}</h3>
                          <p tabIndex={0} aria-label={unit.description} className="text-sm text-gray-600 font-normal">{unit.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>

                    {!isLocked && (
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-2">
                          {unit.subtopics.map((topic) => (
                            <Button
                              aria-label={topic.title}
                              key={topic.id}
                              variant="ghost"
                              onClick={() => {
                                if (!topic.isLocked) {
                                  onTopicSelect(topic);
                                }
                              }}
                              disabled={topic.isLocked}
                              className={`w-full justify-start text-left p-4 h-auto flex items-center space-x-2 ${topic.isLocked
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-[#1ea5b9]/10'
                                }`}
                            >
                              {topic.isCompleted ? (
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : topic.isLocked ? (
                                <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              ) : null}
                              <span tabIndex={0} aria-label={topic.title} className="font-medium text-[#1ea5b9]">{topic.title}</span>
                            </Button>
                          ))}
                          {unit.subtopics.length === 0 && (
                            <p tabIndex={0} aria-label="No topics available yet" className="text-gray-500 italic py-2">No topics available yet</p>
                          )}
                        </div>
                      </AccordionContent>
                    )}
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
