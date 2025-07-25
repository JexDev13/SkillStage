import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const initializeUserProgress = async (uid: string) => {
  const unitIds = ["1", "2", "3", "4", "5", "6", "7", "8"];

  for (const unitId of unitIds) {
    const subtopics = Array.from({ length: 5 }, (_, i) => {
      const subId = `${unitId}.${i + 1}`;
      return {
        id: subId,
        isCompleted: false,
        isLocked: !(subId === "1.1"), 
        score: 0,
      };
    });

    await setDoc(doc(db, 'users', uid, 'user_progress', `${unitId}`), {
      unitId,
      isUnitCompleted: false,
      subtopics,
    });
  }
};