// ==========================
// ✅ User & Progress Models
// ==========================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  progress: UserProgress;
}

export interface UserProgress {
  currentUnit: string;
  completedUnits: Record<string, boolean>; 
  subtopicsProgress: Record<string, SubtopicProgress>; 
}

export interface SubtopicProgress {
  completed: boolean;
  games: Record<string, GameProgress>; 
}

export interface GameProgress {
  completed: boolean;
  score?: number;
  attempts?: number;
  completedAt?: string;
}

// =====================
// ✅ Grammar Structures
// =====================

export interface GrammarUnit {
  id: number;
  title: string;
  description?: string;
  isUnitCompleted: boolean;
  subtopics: GrammarSubtopic[];
}

export interface GrammarSubtopic {
  id: string;
  title: string;
  description?: string;
  usage?: string;
  examples?: string[];
  image?: string;
  isLocked: boolean;
  isCompleted: boolean;
  games: Game[];
}

export interface Game {
  game_id: string;
  type: GameType;
  title: string;
  instructions: string;
  question: string;
  answer: string;
  options: string[];
  audio_file: string | null;

  justification?: string;
  correct_feedback?: string;
  incorrect_feedback?: string;
  image_url?: string;

  blanks: { id: string; correct_answer: string }[];
  draggable_options: string[];

  transcript: string;
  model_answer: string;
  grading_criteria: string;

  sentence_to_repeat: string;
  audio_model_file: string;
  target_words: string[];
}

export type GameType =
  | "multiple_choice"
  | "drag_and_drop"
  | "listening_multiple_choice"
  | "listening_writing"
  | "speaking_repetition";

// =====================
// ✅ Auth Context Type
// =====================

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProgress: (
    unitId: string,
    subtopicId: string,
    gameId: string,
    progress: GameProgress
  ) => void;
}