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

/*export interface Exercise {
  id: string;
  unitId: number;
  title: string;
  description: string;
  instructions: string;
  type: 'multiple-choice' | 'drag-drop' | 'fill-blank' | 'matching';
  questions: Question[];
  isLocked: boolean;
}*/

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

// types.ts
export interface Game {
  game_id: string;
  type: string;
  title: string;
  instructions: string;
  justification?: string;
  [key: string]: any;
}

export interface Subtopic {
  subtopic_id: string;
  subtopic_title: string;
  is_locked: boolean;
  description?: string;
  games: Game[];
}

export interface Unit {
  unit_id: number;
  unit_title: string;
  isUnitCompleted: boolean;
  subtopics: Subtopic[];
}

export interface Exercise {
  id: string;
  unitId: number;
  unitTitle: string;
  subtopicId: string;
  subtopicTitle: string;
  title: string;
  instructions: string;
  description: string;
  questions: Game[];
  isLocked: boolean;
}