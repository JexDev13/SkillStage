import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GrammarSection } from '../components/grammar/GrammarSection';
import { ExerciseSection } from '../components/exercises/ExerciseSection';
import { HelpDialog } from '../components/help/HelpDialog';
import { SettingsDialog } from '../components/settings/SettingsDialog';
import { Card, CardContent } from '../components/ui/card';
import { Book, GamepadIcon, Trophy, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Game, GrammarSubtopic } from '../types';
import { collection, getDocs } from 'firebase/firestore';


export const MainScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrammarTopic, setSelectedGrammarTopic] = useState<GrammarSubtopic | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Game | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const userDocSnap = await getDoc(doc(db, 'users', user.uid));
        const userInfo = userDocSnap.exists() ? userDocSnap.data() : null;

        const progressSnapshot = await getDocs(collection(db, `users/${user.uid}/user_progress`));
        const progressData: Record<string, any> = {};

        progressSnapshot.forEach((doc) => {
          progressData[doc.id] = doc.data();
        });

        const completedUnits = Object.entries(progressData)
          .filter(([_, unit]) => unit.isUnitCompleted)
          .map(([unitId]) => unitId);

        setUserData({ ...userInfo, progress: { ...progressData, completedUnits } });
      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);


  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (!user && !loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 text-xl">
        Please log in to access the platform.
      </div>
    );
  }

  if (loading || !userData) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 text-xl">
        Loading content...
      </div>
    );
  }

  const renderHomeContent = () => (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 tabIndex={0}  className="text-3xl font-bold text-[#1ea5b9] mb-4">
          Welcome back, {userData?.name || 'Student'}!
        </h1>
        <p tabIndex={0} aria-label="Continue your English learning journey" className="text-gray-600 text-lg">
          Continue your English learning journey
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="border-2 border-[#1ea5b9]/20 hover:border-[#1ea5b9]/40 transition-colors cursor-pointer"
          onClick={() => setActiveTab('grammar')}>
          <CardContent className="p-6 text-center">
            <Book tabIndex={0} aria-label="Book" className="h-12 w-12 text-[#d43241] mx-auto mb-4" />
            <h3 tabIndex={0} aria-label="Grammar Theory" className="text-lg font-semibold text-[#1ea5b9] mb-2">Grammar Theory</h3>
            <p tabIndex={0} aria-label="Learn grammar rules and concepts with detailed explanations" className="text-gray-600 text-sm">
              Learn grammar rules and concepts with detailed explanations
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#ff852e]/20 hover:border-[#ff852e]/40 transition-colors cursor-pointer"
          onClick={() => setActiveTab('exercises')}>
          <CardContent className="p-6 text-center">
            <GamepadIcon tabIndex={0} aria-label="Gamepad Icon" className="h-12 w-12 text-[#ff852e] mx-auto mb-4" />
            <h3 tabIndex={0} aria-label="Practice Exercises" className="text-lg font-semibold text-[#1ea5b9] mb-2">Practice Exercises</h3>
            <p tabIndex={0} aria-label="Test your knowledge with interactive quizzes and activities" className="text-gray-600 text-sm">
              Test your knowledge with interactive quizzes and activities
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#463675]/20 hover:border-[#463675]/40 transition-colors">
          <CardContent className="p-6 text-center">
            <Trophy tabIndex={0} aria-label="Trophy" className="h-12 w-12 text-[#463675] mx-auto mb-4" />
            <h3 tabIndex={0} aria-label="Your Progress" className="text-lg font-semibold text-[#1ea5b9] mb-2">Your Progress</h3>
            <p tabIndex={0} aria-label="Units completed" className="text-gray-600 text-sm">
              Units completed: {userData?.progress?.completedUnits?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 tabIndex={0} aria-label="Recent Activity" className="text-lg font-semibold text-[#1ea5b9] mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {(() => {
                const completedSubtopics: { unitId: string; id: any; score: any }[] = [];

                for (const unitId in userData?.progress) {
                  const unitProgress = userData.progress[unitId];

                  if (!unitProgress?.subtopics) {
                    continue;
                  }

                  unitProgress.subtopics.forEach((sub: any) => {
                    if (sub.isCompleted) {
                      completedSubtopics.push({
                        unitId,
                        id: sub.id,
                        score: sub.score,
                      });
                    }
                  });
                }

                const lastEight = completedSubtopics.slice().reverse().slice(0, 5);

                if (lastEight.length === 0) {
                  return <p tabIndex={0} aria-label="No subtopics completed yet" className="text-gray-500 text-sm italic">No subtopics completed yet</p>;
                }

                return lastEight.map(({ unitId, id }) => (
                  <div
                    key={`${unitId}-${id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium capitalize">
                      Unit {unitId.replace('-', ' › ')} Subtopic {id.replace('-', ' › ')}
                    </span>
                    <span className="text-sm text-green-600 font-semibold">Completed</span>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 tabIndex={0} aria-label="Quick Actions" className="text-lg font-semibold text-[#1ea5b9] mb-4">Quick Actions</h3>
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
