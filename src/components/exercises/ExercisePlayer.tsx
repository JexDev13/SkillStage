import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Progress } from '../ui/progress';
import toast from 'react-hot-toast';
import { Game } from '../../types';
import MultipleChoiceGame from './games/MultipleChoiceGame';
import DragAndDropGame from './games/DragAndDropGame';
import ListeningMultipleChoiceGame from './games/ListeningMultipleChoiceGame';
import ListeningWritingGame from './games/ListeningWritingGame';
import SpeakingRepetitionGame from './games/SpeakingRepetitionGame';
import Timer from '../utils/Timer';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

interface ExercisePlayerProps {
	exercise: {
		id: string;
		unitId: string;
		title: string;
		games: Game[];
	};
	onComplete: () => void;
	onBack: () => void;
}

interface QuestionState extends Game {
	userAnswer?: string;
	isChecked: boolean;
	isCorrect?: boolean;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
	exercise,
	onComplete,
	onBack,
}) => {
	const { user } = useAuth();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [questions, setQuestions] = useState<QuestionState[]>(
		exercise.games.map((game) => ({
			...game,
			userAnswer: undefined,
			isChecked: false,
			isCorrect: undefined,
		}))
	);
	const [finalTime, setFinalTime] = useState(0);
	const [showResults, setShowResults] = useState(false);
	const explanationRef = useRef<HTMLDivElement>(null);
	const nextButtonRef = useRef<HTMLButtonElement>(null);

	const current = questions[currentIndex];
	const progress = ((currentIndex + 1) / questions.length) * 100;

	const formatTime = (sec: number) => {
		const m = Math.floor(sec / 60).toString().padStart(2, '0');
		const s = (sec % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};

	const handleAnswer = (answer: string) => {
		if (current.isChecked) return;

		const updated = [...questions];
		updated[currentIndex] = { ...current, userAnswer: answer };
		setQuestions(updated);
	};

	const questionRef = useRef<HTMLHeadingElement>(null);

	function normalize(str: string): string {
		return str
			.trim()
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[.,!?´']/g, '')
			.replace(/\s+/g, ' ');
	}

	const checkAnswer = () => {
		if (!current.userAnswer) {
			toast.error('Please provide an answer first');
			return;
		}

		let correct = false;

		switch (current.type) {
			case 'multiple_choice':
			case 'listening_multiple_choice':
				correct = current.answer.trim() === current.userAnswer.trim();
				break;
			case 'drag_and_drop':
				correct = current.blanks?.every((b, i) => b.correct_answer === current.userAnswer?.split(' ')[i]) ?? false;
				break;
			case 'listening_writing':
				correct = normalize(current.userAnswer || '') === normalize(current.model_answer || '');
				break;
			case 'speaking_repetition':
				correct = normalize(current.userAnswer || '') === normalize(current.sentence_to_repeat || '');
				break;
			default:
				correct = current.answer.trim() === current.userAnswer.trim();
		}

		const updated = [...questions];
		updated[currentIndex] = {
			...current,
			isChecked: true,
			isCorrect: correct,
		};
		setQuestions(updated);

		toast[correct ? 'success' : 'error'](correct ? 'Correct!' : 'Incorrect.');

		setTimeout(() => {

			if (current.type !== 'listening_writing') {
				if (updated[currentIndex].justification && explanationRef.current) {
					explanationRef.current.focus();
				} else if (nextButtonRef.current) {
					nextButtonRef.current.focus();
				}
			}
		}, 100);
	};

	useEffect(() => {
		questionRef.current?.focus();
	}, [currentIndex]);

	const next = () => {
		if (
			['multiple_choice', 'listening_multiple_choice', 'drag_and_drop', 'listening_writing', 'speaking_repetition'].includes(current.type) &&
			!current.isChecked
		) {
			toast.error('Check your answer first!');
			return;
		}

		if (currentIndex === questions.length - 1) {
			setShowResults(true);
		} else {
			setCurrentIndex((i) => i + 1);
		}
	};

	const previous = () => {
		if (currentIndex > 0) {
			setCurrentIndex((i) => i - 1);
		}
	};

	const renderGame = () => {
		const props = {
			question: current,
			onAnswer: handleAnswer,
			disabled: current.isChecked,
		};

		switch (current.type) {
			case 'multiple_choice':
				return <MultipleChoiceGame {...props} />;
			case 'drag_and_drop':
				return <DragAndDropGame {...props} />;
			case 'listening_multiple_choice':
				return <ListeningMultipleChoiceGame {...{ ...props, question: { ...current, audio_file: current.audio_file ?? '' } }} />;
			case 'listening_writing':
				return <ListeningWritingGame {...{ ...props, question: { ...current, audio_file: current.audio_file ?? '', justification: current.justification ?? '' } }} />;
			case 'speaking_repetition':
				return (
					<SpeakingRepetitionGame
						{...props}
						question={current}
					/>
				);
			default:
				return <p>Unsupported question type: {current.type}</p>;
		}
	};

	const updateUserProgress = async (score: number) => {
		if (!user) return;

		const { unitId, id: subtopicId } = exercise;

		try {
			const userProgressRef = doc(db, 'users', user.uid, 'user_progress', unitId);
			const userProgressSnap = await getDoc(userProgressRef);
			let userProgressData: any = userProgressSnap.exists() ? userProgressSnap.data() : { unitId, subtopics: [] };

			if (!userProgressData.subtopics) userProgressData.subtopics = [];

			const existingSubtopicIndex = userProgressData.subtopics.findIndex((s: any) => s.id === subtopicId);

			if (existingSubtopicIndex !== -1) {
				userProgressData.subtopics[existingSubtopicIndex].score = score;
				if (score >= 80) userProgressData.subtopics[existingSubtopicIndex].isCompleted = true;
			} else {
				userProgressData.subtopics.push({
					id: subtopicId,
					score,
					isCompleted: score >= 80,
					isLocked: false,
				});
			}

			if (score >= 80) {
				const subtopicsSnap = await getDocs(collection(db, `grammar_units/${unitId}/subtopics`));
				const subtopicIds = subtopicsSnap.docs.map((doc) => doc.id);

				const currentIndex = subtopicIds.indexOf(subtopicId);

				const nextIndex = currentIndex + 1;

				if (nextIndex < subtopicIds.length) {
					const nextSubId = subtopicIds[nextIndex];

					const nextSubIndex = userProgressData.subtopics.findIndex((s: any) => s.id === nextSubId);
					if (nextSubIndex === -1) {
						userProgressData.subtopics.push({
							id: nextSubId,
							isLocked: false,
							isCompleted: false,
							score: 0,
						});
					} else {
						userProgressData.subtopics[nextSubIndex].isLocked = false;
					}
				} else {
					const unitsSnap = await getDocs(collection(db, 'grammar_units'));
					const unitIds = unitsSnap.docs.map((doc) => doc.id);

					const currentUnitIndex = unitIds.indexOf(unitId);
					const nextUnitIndex = currentUnitIndex + 1;

					if (nextUnitIndex < unitIds.length) {
						const nextUnitId = unitIds[nextUnitIndex];

						const nextUnitSubtopicsSnap = await getDocs(collection(db, `grammar_units/${nextUnitId}/subtopics`));
						if (nextUnitSubtopicsSnap.docs.length > 0) {
							const firstSubIdNextUnit = nextUnitSubtopicsSnap.docs[0].id;

							const nextUnitProgressRef = doc(db, 'users', user.uid, 'user_progress', nextUnitId);
							const nextUnitProgressSnap = await getDoc(nextUnitProgressRef);

							let nextUnitProgressData = nextUnitProgressSnap.exists() ? nextUnitProgressSnap.data() : null;

							if (!nextUnitProgressData) {
								await setDoc(nextUnitProgressRef, {
									unitId: nextUnitId,
									subtopics: [{
										id: firstSubIdNextUnit,
										isLocked: false,
										isCompleted: false,
										score: 0,
									}],
								});
							} else {
								if (!nextUnitProgressData.subtopics) nextUnitProgressData.subtopics = [];

								const firstSubIndex = nextUnitProgressData.subtopics.findIndex((s: any) => s.id === firstSubIdNextUnit);
								if (firstSubIndex === -1) {
									nextUnitProgressData.subtopics.push({
										id: firstSubIdNextUnit,
										isLocked: false,
										isCompleted: false,
										score: 0,
									});
								} else if (nextUnitProgressData.subtopics[firstSubIndex].isLocked) {
									nextUnitProgressData.subtopics[firstSubIndex].isLocked = false;
								}
								await setDoc(nextUnitProgressRef, nextUnitProgressData);
							}
						}
					}
				}
			}

			const allCompleted = userProgressData.subtopics.every((s: any) => s.isCompleted);
			if (allCompleted) {
				userProgressData.isUnitCompleted = true;
			}

			await setDoc(userProgressRef, userProgressData);
		} catch (error) {
			console.error('❌ Error actualizando progreso:', error);
		}
	};


	if (showResults) {
		const correctCount = questions.filter((q) => q.isCorrect).length;
		const answeredCount = questions.filter((q) => q.userAnswer !== undefined).length;
		const score = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

		return (
			<div className="max-w-4xl mx-auto p-8 text-center">
				<div className="mb-6">
					<div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
						{score}%
					</div>
					<h2 className="text-2xl font-bold text-[#1ea5b9] mb-2">Exercise Complete! 🏆</h2>
					<p className="text-gray-600">You got {correctCount} of {answeredCount} correct</p>
					<p className="mb-8">Time taken: {formatTime(finalTime)}</p>
				</div>
				<div className="flex justify-center gap-4">
					<Button
						variant="outline"
						onClick={() => {
							setCurrentIndex(0);
							setQuestions(exercise.games.map(game => ({
								...game,
								userAnswer: undefined,
								isChecked: false,
								isCorrect: undefined
							})));
							setShowResults(false);
							setFinalTime(0);
						}}
					>
						Try Again
					</Button>
					<Button
						onClick={async () => {
							await updateUserProgress(score);
							onComplete();
						}}
						className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
					>
						Continue Learning
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-4 flex justify-between items-center text-gray-600">
				<Button tabIndex={0} variant="ghost" onClick={onBack} className="flex items-center space-x-1 text-[#1ea5b9] hover:bg-[#1ea5b9]/10" aria-label="Back to Instructions">
					<ArrowLeft className="h-4 w-4 mr-2" />
					<span>Back to Instructions</span>
				</Button>
				<Timer onTick={(sec) => setFinalTime(sec)} />
			</div>

			<div className="mb-6 flex items-center justify-between">
				<div ref={questionRef} tabIndex={-1} aria-label={`Question ${currentIndex + 1} of ${questions.length}`} className="text-sm text-gray-600">
					Question {currentIndex + 1} of {questions.length}
				</div>
				<Progress value={progress} className="h-2 w-2/3" />
			</div>

			<Card className="shadow-lg border-none">
				<CardContent className="p-8">
					<h2 tabIndex={0} aria-label={current.instructions} className="text-xl font-semibold text-[#1ea5b9] mb-6">
						{current.instructions}
					</h2>

					<div tabIndex={0} aria-label={current.instructions}>
						{renderGame()}
					</div>

					{current.isChecked && current.justification && (
						<div
							ref={explanationRef}
							tabIndex={0}
							aria-label={`Explanation: ${current.justification}`}
							className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
						>
							<h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
							<p className="text-blue-700">{current.justification}</p>
						</div>
					)}

					<div className="mt-6 flex items-center justify-between">
						<Button
							tabIndex={0}
							variant="outline"
							onClick={previous}
							disabled={currentIndex === 0}
							aria-label="Previous Question"
						>
							<ChevronLeft className="h-4 w-4 mr-2" />
							Previous
						</Button>
						<div className="flex gap-3">
							{!current.isChecked &&
								['multiple_choice', 'listening_multiple_choice', 'drag_and_drop', 'listening_writing', 'speaking_repetition'].includes(current.type) &&
								current.userAnswer && (
									<Button
										tabIndex={0}
										onClick={checkAnswer}
										className="bg-[#ff852e] hover:bg-[#ff852e]/90"
										aria-label="Check Answer"
									>
										<Check className="h-4 w-4 mr-2" />
										Check Answer
									</Button>
								)}
							{current.isChecked && (
								<Button
									ref={nextButtonRef}
									tabIndex={0}
									onClick={next}
									className="bg-[#1ea5b9] hover:bg-[#1ea5b9]/90"
									aria-label={currentIndex === questions.length - 1 ? 'Finish Exercise' : 'Next Question'}
								>
									{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
