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
  score: number;
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