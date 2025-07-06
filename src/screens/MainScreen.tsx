import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GrammarSection } from '../components/grammar/GrammarSection';
import { ExerciseSection } from '../components/exercises/ExerciseSection';
import { HelpDialog } from '../components/help/HelpDialog';
import { SettingsDialog } from '../components/settings/SettingsDialog';
import { Card, CardContent } from '../components/ui/card';
import { Book, GamepadIcon, Trophy, Clock } from 'lucide-react';
import { GrammarTopic, Exercise } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const MainScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedGrammarTopic, setSelectedGrammarTopic] = useState<GrammarTopic | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedGrammarTopic(null);
    setSelectedExercise(null);
  };

  const renderHomeContent = () => (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1ea5b9] mb-4">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 text-lg">
          Continue your English learning journey
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="border-2 border-[#1ea5b9]/20 hover:border-[#1ea5b9]/40 transition-colors cursor-pointer"
              onClick={() => setActiveTab('grammar')}>
          <CardContent className="p-6 text-center">
            <Book className="h-12 w-12 text-[#d43241] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-2">Grammar Theory</h3>
            <p className="text-gray-600 text-sm">
              Learn grammar rules and concepts with detailed explanations
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#ff852e]/20 hover:border-[#ff852e]/40 transition-colors cursor-pointer"
              onClick={() => setActiveTab('exercises')}>
          <CardContent className="p-6 text-center">
            <GamepadIcon className="h-12 w-12 text-[#ff852e] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-2">Practice Exercises</h3>
            <p className="text-gray-600 text-sm">
              Test your knowledge with interactive quizzes and activities
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#463675]/20 hover:border-[#463675]/40 transition-colors">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-[#463675] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-2">Your Progress</h3>
            <p className="text-gray-600 text-sm">
              Units completed: {user?.progress.completedUnits.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {Object.entries(user?.progress.exerciseScores || {}).slice(0, 3).map(([exerciseId, score]) => (
                <div key={exerciseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{exerciseId.replace('-', ' ')}</span>
                  <span className="text-sm text-[#ff852e] font-semibold">
                    {Math.round((score.score / score.totalQuestions) * 100)}%
                  </span>
                </div>
              ))}
              {Object.keys(user?.progress.exerciseScores || {}).length === 0 && (
                <p className="text-gray-500 text-sm italic">No exercises completed yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('grammar')}
                className="w-full p-3 text-left bg-[#d43241]/10 hover:bg-[#d43241]/20 rounded-lg transition-colors"
              >
                <span className="font-medium text-[#d43241]">Continue Grammar Study</span>
              </button>
              <button
                onClick={() => setActiveTab('exercises')}
                className="w-full p-3 text-left bg-[#ff852e]/10 hover:bg-[#ff852e]/20 rounded-lg transition-colors"
              >
                <span className="font-medium text-[#ff852e]">Practice Exercises</span>
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="w-full p-3 text-left bg-[#463675]/10 hover:bg-[#463675]/20 rounded-lg transition-colors"
              >
                <span className="font-medium text-[#463675]">Get Help</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'grammar':
        return (
          <GrammarSection
            selectedTopic={selectedGrammarTopic}
            onTopicSelect={setSelectedGrammarTopic}
            onBackToUnits={() => setSelectedGrammarTopic(null)}
          />
        );
      case 'exercises':
        return (
          <ExerciseSection
            selectedExercise={selectedExercise}
            onExerciseSelect={setSelectedExercise}
            onBackToExercises={() => setSelectedExercise(null)}
          />
        );
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onHelpClick={() => setShowHelp(true)}
        onSettingsClick={() => setShowSettings(true)}
      />
      
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>

      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
};