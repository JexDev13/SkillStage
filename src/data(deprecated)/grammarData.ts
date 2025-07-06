import { GrammarUnit, GrammarTopic } from '../types';

export const grammarTopics: GrammarTopic[] = [
  {
    id: 'present-perfect-simple-continuous',
    title: 'Present Perfect Simple and Continuous',
    unitId: 2,
    content: `
      <h3>Present perfect simple: Use</h3>
      <p>We use the <strong>present perfect simple</strong> with past finished actions or experiences when we don't mention, or we don't know when they happened. We also use the present perfect simple <strong>to ask or talk about situations that started in the past and have not finished</strong>.</p>
      <p>We form the present perfect continuous with the present perfect simple of be + the -ing form of the main verb.</p>
      
      <h3>Present perfect continuous: Use</h3>
      <p>We use the present perfect continuous with action verbs (dynamic verbs) <strong>to talk about situations that started in the past and have not finished or have just finished.</strong></p>
      <p>We can use the present perfect continuous to talk about continuous or repeated actions or situations from the past till now.</p>
    `,
    examples: [
      "I have lived in London for five years.",
      "She has been working here since 2020.",
      "Have you ever been to Paris?",
      "They have been studying English for two hours."
    ]
  },
  {
    id: 'past-simple-continuous',
    title: 'Past Simple and Continuous',
    unitId: 1,
    content: `
      <h3>Past Simple: Use</h3>
      <p>We use the <strong>past simple</strong> to talk about completed actions in the past. We often use time expressions like yesterday, last week, in 2020, etc.</p>
      
      <h3>Past Continuous: Use</h3>
      <p>We use the <strong>past continuous</strong> to talk about actions that were in progress at a specific time in the past, or to describe the background of a story.</p>
    `,
    examples: [
      "I went to the store yesterday.",
      "She was reading when I called.",
      "They were playing football at 3 PM.",
      "We lived in Spain for three years."
    ]
  }
];

export const grammarUnits: GrammarUnit[] = [
  {
    id: 1,
    title: 'Unit 1: Past Tenses',
    description: 'Learn about past simple and past continuous tenses',
    topics: grammarTopics.filter(topic => topic.unitId === 1),
    isLocked: false
  },
  {
    id: 2,
    title: 'Unit 2: Present Perfect',
    description: 'Master present perfect simple and continuous',
    topics: grammarTopics.filter(topic => topic.unitId === 2),
    isLocked: false
  },
  {
    id: 3,
    title: 'Unit 3: Future Tenses',
    description: 'Explore different ways to express future',
    topics: [],
    isLocked: true
  }
];