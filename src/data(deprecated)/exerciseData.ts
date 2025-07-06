import { Exercise, Question } from '../types';

const presentPerfectQuestions: Question[] = [
  {
    id: 'pp1',
    text: 'Choose the correct form: "I ___ in London for five years."',
    type: 'multiple-choice',
    options: ['have lived', 'have been living', 'lived', 'am living'],
    correctAnswer: 'have lived',
    explanation: 'We use present perfect simple for completed actions with a connection to the present, especially with "for" and "since".'
  },
  {
    id: 'pp2',
    text: 'Select the best option: "She ___ here since 9 AM."',
    type: 'multiple-choice',
    options: ['has been waiting', 'has waited', 'is waiting', 'waits'],
    correctAnswer: 'has been waiting',
    explanation: 'We use present perfect continuous for actions that started in the past and are still continuing, especially with "since".'
  },
  {
    id: 'pp3',
    text: 'Which is correct? "They ___ three emails today."',
    type: 'multiple-choice',
    options: ['have sent', 'have been sending', 'sent', 'are sending'],
    correctAnswer: 'have sent',
    explanation: 'We use present perfect simple for completed actions within a time period that is not finished (today).'
  }
];

const pastTenseQuestions: Question[] = [
  {
    id: 'pt1',
    text: 'Choose the correct form: "While I ___ TV, the phone rang."',
    type: 'multiple-choice',
    options: ['watched', 'was watching', 'have watched', 'am watching'],
    correctAnswer: 'was watching',
    explanation: 'We use past continuous for actions in progress when another action interrupted them.'
  },
  {
    id: 'pt2',
    text: 'Select the best option: "She ___ to work by bus yesterday."',
    type: 'multiple-choice',
    options: ['went', 'was going', 'has gone', 'goes'],
    correctAnswer: 'went',
    explanation: 'We use past simple for completed actions in the past, especially with time expressions like "yesterday".'
  }
];

export const exercises: Exercise[] = [
  {
    id: 'present-perfect-quiz',
    unitId: 2,
    title: 'Present Perfect Practice',
    description: 'Test your knowledge of present perfect simple and continuous',
    instructions: 'Choose the correct form of the present perfect tense for each sentence. Read each question carefully and select the best answer.',
    type: 'multiple-choice',
    questions: presentPerfectQuestions,
    isLocked: false
  },
  {
    id: 'past-tense-quiz',
    unitId: 1,
    title: 'Past Tenses Challenge',
    description: 'Practice past simple and past continuous',
    instructions: 'Select the correct past tense form for each sentence. Pay attention to the context clues that indicate which tense to use.',
    type: 'multiple-choice',
    questions: pastTenseQuestions,
    isLocked: false
  },
  {
    id: 'future-tense-quiz',
    unitId: 3,
    title: 'Future Forms Quiz',
    description: 'Master different future tenses',
    instructions: 'Complete this quiz to practice various ways of expressing future actions.',
    type: 'multiple-choice',
    questions: [],
    isLocked: true
  }
];