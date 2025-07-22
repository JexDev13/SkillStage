// utils/parseExercises.ts

import { Unit, Exercise } from '../types';

export function parseUnitsToExercises(units: Unit[]): Exercise[] {
  const exercises: Exercise[] = [];

  for (const unit of units) {
    for (const subtopic of unit.subtopics) {
      exercises.push({
        id: subtopic.subtopic_id,
        unitId: unit.unit_id,
        unitTitle: unit.unit_title,
        subtopicId: subtopic.subtopic_id,
        subtopicTitle: subtopic.subtopic_title,
        title: subtopic.subtopic_title,
        instructions: subtopic.games[0]?.instructions ?? '',
        description: subtopic.description ?? '',
        questions: subtopic.games,
        isLocked: subtopic.is_locked,
      });
    }
  }

  return exercises;
}
