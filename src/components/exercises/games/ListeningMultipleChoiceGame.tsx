import React, { useEffect, useRef, useState } from 'react';
import { Check, X, ChevronDown, Play, Pause } from 'lucide-react';

interface ListeningMultipleChoiceGameProps {
    question: {
        question: string;
        options: string[];
        userAnswer?: string;
        answer: string;
        isChecked: boolean;
        audio_file: string;
    };
    onAnswer: (answer: string) => void;
    disabled?: boolean;
}

const ListeningMultipleChoiceGame: React.FC<ListeningMultipleChoiceGameProps> = ({
    question,
    onAnswer,
    disabled = false,
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

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

    const handleSpeedChange = (rate: number) => {
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
        if (audioRef.current) audioRef.current.playbackRate = rate;
    };

    const audioPath = question.audio_file.startsWith('http')
        ? question.audio_file
        : `/audio/${question.audio_file.replace('../audio/', '')}`;

    return (
        <div className="space-y-6 text-center">
            <span className="text-base font-semibold text-[#1ea5b9] block mb-2">
                Listen and choose the correct sentence:
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
                                        className={`w-full px-4 py-2 text-sm text-left hover:bg-[#1ea5b9]/10 ${playbackRate === rate ? 'text-[#1ea5b9] font-semibold' : 'text-gray-700'
                                            }`}
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

            <div className="space-y-3">
                {question.options.map((opt, idx) => {
                    const isSelected = question.userAnswer === opt;
                    const isCorrect = opt === question.answer;
                    const show = question.isChecked;

                    let className =
                        'w-full p-4 text-left border-2 rounded-lg transition-all flex items-center justify-between';

                    if (show) {
                        if (isCorrect) {
                            className += ' border-green-500 bg-green-50 text-green-800';
                        } else if (isSelected && !isCorrect) {
                            className += ' border-red-500 bg-red-50 text-red-800';
                        } else {
                            className += ' border-gray-200 bg-gray-50 text-gray-600';
                        }
                    } else if (isSelected) {
                        className += ' border-[#1ea5b9] bg-[#1ea5b9]/10 text-[#1ea5b9]';
                    } else {
                        className +=
                            ' border-gray-200 hover:border-[#1ea5b9]/50 hover:bg-[#1ea5b9]/5';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => onAnswer(opt)}
                            disabled={disabled}
                            className={className}
                        >
                            <span>{opt}</span>
                            {show && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                            {show && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ListeningMultipleChoiceGame;