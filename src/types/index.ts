export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  progress: UserProgress;
}

export interface UserProgress {
  completedUnits: number[];
  exerciseScores: Record<string, ExerciseScore>;
  currentUnit: number;
}

export interface ExerciseScore {
  score: number;
  totalQuestions: number;
  completedAt: Date;
  attempts: number;
}

export interface GrammarTopic {
  id: string;
  title: string;
  description: string;
  usage: string;
  examples: string[];
  image: string;
  isLocked: boolean;
  isTopicCompleted: boolean;
  unitId: number;
}

export interface GrammarUnit {
  id: number;
  isUnitCompleted: boolean;
  title: string;
  description: string;
  subtopics: GrammarTopic[];
}

export interface Exercise {
  id: string;
  unitId: number;
  title: string;
  description: string;
  instructions: string;
  type: 'multiple-choice' | 'drag-drop' | 'fill-blank' | 'matching';
  questions: Question[];
  isLocked: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'drag-drop' | 'fill-blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  userAnswer?: string | string[];
  isChecked?: boolean;
  isCorrect?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProgress: (unitId: number, exerciseId: string, score: ExerciseScore) => void;
}