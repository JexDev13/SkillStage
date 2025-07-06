import React, { useState } from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { grammarUnits } from '../../data(deprecated)/grammarData';
import { GrammarTopic } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface GrammarSectionProps {
  selectedTopic: GrammarTopic | null;
  onTopicSelect: (topic: GrammarTopic) => void;
  onBackToUnits: () => void;
}

export const GrammarSection: React.FC<GrammarSectionProps> = ({
  selectedTopic,
  onTopicSelect,
  onBackToUnits
}) => {
  const { user } = useAuth();
  const [expandedUnit, setExpandedUnit] = useState<string>('');

  if (selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBackToUnits}
            className="text-[#1ea5b9] hover:bg-[#1ea5b9]/10"
          >
            ← Back to Units
          </Button>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#1ea5b9] mb-2">
                  {selectedTopic.title.toUpperCase()}
                </h1>
                <div className="w-full h-1 bg-[#1ea5b9] rounded mb-4"></div>
                <p className="text-xl font-bold text-gray-400">
                  UNIT {selectedTopic.unitId}
                </p>
              </div>
              
              <div className="hidden lg:block">
                <img
                  src="/ilusformas-06-1.png"
                  alt="Grammar illustration"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>

            <div 
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedTopic.content }}
            />

            {selectedTopic.examples.length > 0 && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4">Examples:</h3>
                <ul className="space-y-2">
                  {selectedTopic.examples.map((example, index) => (
                    <li key={index} className="flex items-center space-x-2">
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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1ea5b9] mb-4">Grammar Units</h1>
        <p className="text-gray-600">Select a unit to explore grammar topics</p>
      </div>

      <div className="space-y-4">
        {grammarUnits.map((unit) => {
          const isLocked = unit.isLocked && !user?.progress.completedUnits.includes(unit.id - 1);
          
          return (
            <Card key={unit.id} className="border-2 hover:border-[#1ea5b9]/30 transition-colors">
              <CardContent className="p-0">
                <Accordion type="single" collapsible value={expandedUnit} onValueChange={setExpandedUnit}>
                  <AccordionItem value={unit.id.toString()} className="border-none">
                    <AccordionTrigger 
                      className={`px-6 py-4 hover:no-underline ${isLocked ? 'opacity-50' : ''}`}
                      disabled={isLocked}
                    >
                      <div className="flex items-center space-x-4">
                        {isLocked && <Lock className="h-5 w-5 text-gray-400" />}
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-[#1ea5b9]">{unit.title}</h3>
                          <p className="text-sm text-gray-600">{unit.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    {!isLocked && (
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-2">
                          {unit.topics.map((topic) => (
                            <Button
                              key={topic.id}
                              variant="ghost"
                              onClick={() => onTopicSelect(topic)}
                              className="w-full justify-start text-left p-4 h-auto hover:bg-[#1ea5b9]/10"
                            >
                              <div>
                                <h4 className="font-medium text-[#1ea5b9]">{topic.title}</h4>
                              </div>
                            </Button>
                          ))}
                          
                          {unit.topics.length === 0 && (
                            <p className="text-gray-500 italic py-2">No topics available yet</p>
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