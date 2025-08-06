import React, { useRef, useState, useEffect } from 'react';
import { Check, X, Play, Pause, ChevronDown } from 'lucide-react';

interface ListeningWritingGameProps {
    question: {
        game_id: string;
        question: string;
        audio_file: string;
        model_answer: string;
        transcript: string;
        grading_criteria: string;
        justification: string;
        userAnswer?: string;
        isChecked: boolean;
        isCorrect?: boolean;
    };
    onAnswer: (answer: string) => void;
    disabled?: boolean;
}

const ListeningWritingGame: React.FC<ListeningWritingGameProps> = ({
    question,
    onAnswer,
    disabled = false,
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);
    const [userInput, setUserInput] = useState(question.userAnswer || '');
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    useEffect(() => {
        if (question.isChecked && feedbackRef.current) {
            setTimeout(() => {
                feedbackRef.current?.focus();
            }, 0);
        }
    }, [question.isChecked]);

    const handlePlayAudio = () => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        if (audio.paused) {
            audio.play();
            setIsPlaying(true);
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUserInput(val);
        onAnswer(val);
    };

    const handleSpeedChange = (rate: number) => {
        setPlaybackRate(rate);
        if (audioRef.current) audioRef.current.playbackRate = rate;
        setShowSpeedMenu(false);
    };

    const audioPath = question.audio_file.startsWith('http')
        ? question.audio_file
        : `/audio/${question.audio_file.replace('../audio/', '')}`;

    const inputClass = question.isChecked
        ? question.isCorrect
            ? 'border-green-500 bg-green-50 text-green-800'
            : 'border-red-500 bg-red-50 text-red-800'
        : 'border-gray-300';

    return (
        <div className="space-y-6 text-center">
            <span tabIndex={0} aria-label={question.question} className="text-base font-semibold text-[#1ea5b9] block mb-2">
                {question.question}
            </span>

            <div className="flex justify-center">
                <div className="flex items-center space-x-8 border border-gray-300 rounded-full px-5 py-3 bg-white shadow-sm">
                    <button
                        onClick={handlePlayAudio}
                        disabled={disabled}
                        className="flex items-center space-x-2 disabled:opacity-50"
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 text-[#1ea5b9]" />
                        ) : (
                            <Play className="h-5 w-5 text-[#1ea5b9]" />
                        )}
                        <span className="text-[#1ea5b9] font-medium">
                            {isPlaying ? 'Pause Audio' : 'Play Audio'}
                        </span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowSpeedMenu(prev => !prev)}
                            className="flex items-center space-x-1 text-sm text-gray-700 hover:text-[#1ea5b9] transition"
                        >
                            <span className="font-medium">Speed: {playbackRate}x</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showSpeedMenu && (
                            <div className="absolute top-full left-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow z-10 text-left">
                                {[0.75, 1, 1.25, 1.5].map(rate => (
                                    <button
                                        key={rate}
                                        onClick={() => handleSpeedChange(rate)}
                                        className={`w-full px-4 py-2 text-sm text-left hover:bg-[#1ea5b9]/10 ${playbackRate === rate ? 'text-[#1ea5b9] font-semibold' : 'text-gray-700'}`}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <audio ref={audioRef} src={audioPath} preload="auto" />

            <input
                type="text"
                value={userInput}
                onChange={handleChange}
                disabled={disabled || question.isChecked}
                className={`w-full max-w-lg px-4 py-3 border-2 rounded-lg text-center focus:outline-none text-lg ${inputClass}`}
                placeholder="Type what you hear..."
            />

            {question.isChecked && (
                <div
                    ref={feedbackRef}
                    tabIndex={0}
                    aria-label={question.isCorrect ? 'Correct!' : 'Incorrect. Model answer:'}
                    className={question.isCorrect ? 'text-green-700' : 'text-red-700'}
                >
                    {question.isCorrect ? <Check className="inline w-5 h-5 mr-1" /> : <X className="inline w-5 h-5 mr-1" />}
                    {question.isCorrect ? 'Correct!' : 'Incorrect. Model answer:'}
                    {!question.isCorrect && <span className="ml-2 font-medium">{question.model_answer}</span>}
                </div>
            )}
        </div>
    );
};

export default ListeningWritingGame;